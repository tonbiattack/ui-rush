import { describe, expect, it } from "vitest";
import {
  ALL_QUESTIONS,
  KEYBOARD_QUESTIONS,
  QUESTIONS,
  QUESTIONS_BY_ID,
  getQuestion,
  searchQuestions,
} from "@/lib/questions";
import {
  TIME_ATTACK_MS,
  createKeyboardSession,
  createReverseSession,
  createSpacedSession,
  createTimeAttackSession,
  remainingSessionMs,
  startQuiz,
  submitAnswer,
  tick,
} from "@/lib/quiz";
import { matchesQuestion, normalizeSpoken } from "@/lib/use-speech";
import { pickSpotlightTargets } from "@/components/spotlight-client";
import { hasDemo } from "@/components/ui-demos";

describe("用語データの拡充", () => {
  it("通常用語が50種類以上ある", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(50);
  });

  it("キーボード操作の用語が10問以上ある", () => {
    expect(KEYBOARD_QUESTIONS.length).toBeGreaterThanOrEqual(10);
    for (const question of KEYBOARD_QUESTIONS) {
      expect(question.kind).toBe("keyboard");
      // キーの出題はデモが必ず存在する。
      expect(question.demoType.startsWith("key-")).toBe(true);
    }
  });

  it("IDが一意で、必須項目が埋まっている", () => {
    const ids = new Set<string>();
    for (const question of ALL_QUESTIONS) {
      expect(ids.has(question.id)).toBe(false);
      ids.add(question.id);
      expect(question.nameJa.trim()).not.toBe("");
      expect(question.nameEn.trim()).not.toBe("");
      expect(question.reading.trim()).not.toBe("");
      expect(question.description.trim()).not.toBe("");
      // 指示例は名称か別名のどちらかを含み、そのまま使える文になっている。
      const mentioned = [question.nameJa, ...question.aliases].some((label) =>
        question.exampleInstruction.includes(label),
      );
      expect(mentioned).toBe(true);
      expect(question.reversePrompt.trim()).not.toBe("");
    }
  });

  it("日本語名が重複しない", () => {
    const names = QUESTIONS.map((question) => question.nameJa);
    expect(new Set(names).size).toBe(names.length);
  });

  it("逆引きの出題文に名称が含まれない（正解が漏れない）", () => {
    for (const question of QUESTIONS) {
      const prompt = question.reversePrompt;
      expect(prompt).not.toContain(question.nameJa);
      expect(prompt).not.toContain(question.nameEn);
      // 別名も出題文には出さない。
      for (const alias of question.aliases) {
        expect(prompt).not.toContain(alias);
      }
    }
  });

  it("逆引きの出題文が重複しない（複数正解を防ぐ）", () => {
    const prompts = QUESTIONS.map((question) => question.reversePrompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("すべての用語に操作できるデモが登録されている", () => {
    for (const question of ALL_QUESTIONS) {
      expect(
        hasDemo(question.demoType),
        `${question.nameJa} のデモ（${question.demoType}）が未登録です`,
      ).toBe(true);
    }
  });
});

describe("別名検索", () => {
  it("名称・英語名・読み・別名のどれでもヒットする", () => {
    const byAlias = searchQuestions("プルダウン");
    expect(byAlias.map((question) => question.id)).toContain("select");

    expect(searchQuestions("toast").map((question) => question.id)).toContain("toast");
    expect(searchQuestions("とーすと").map((question) => question.id)).toContain("toast");
    expect(searchQuestions("チェックボックス").map((question) => question.id)).toContain(
      "checkbox",
    );
  });

  it("空の検索語では全用語を返す", () => {
    expect(searchQuestions("   ")).toHaveLength(QUESTIONS.length);
  });
});

describe("逆引き・キーボード・タイムアタックのセッション", () => {
  it("逆引きは4択で、正解を含む", () => {
    const quiz = createReverseSession({ questionCount: 10, timeLimitSec: 5 });
    expect(quiz.mode).toBe("reverse");
    expect(quiz.questions).toHaveLength(10);
    for (const item of quiz.questions) {
      expect(item.choices).toHaveLength(4);
      expect(item.choices).toContain(item.questionId);
    }
  });

  it("キーボードはキーの用語だけを出題する", () => {
    const quiz = createKeyboardSession({ questionCount: 5, timeLimitSec: 5 });
    expect(quiz.mode).toBe("keyboard");
    for (const item of quiz.questions) {
      expect(getQuestion(item.questionId)?.kind).toBe("keyboard");
      // 選択肢もキーの用語だけで構成する（用語が混ざらない）。
      for (const choiceId of item.choices) {
        expect(getQuestion(choiceId)?.kind).toBe("keyboard");
      }
      expect(item.choices).toHaveLength(4);
      expect(item.choices).toContain(item.questionId);
    }
  });

  it("タイムアタックは60秒のセッション制限を持つ", () => {
    const quiz = createTimeAttackSession({});
    expect(quiz.mode).toBe("timeattack");
    expect(quiz.sessionLimitMs).toBe(TIME_ATTACK_MS);

    const now = 0;
    let state = startQuiz(quiz, now);
    expect(remainingSessionMs(state, now)).toBe(TIME_ATTACK_MS);

    // 60秒を過ぎると、何問目でもその場で終了する。
    state = tick(state, TIME_ATTACK_MS);
    expect(state.phase).toBe("finished");
  });

  it("タイムアタックは問題を使い切ると先頭へ戻って続く", () => {
    const quiz = {
      ...createTimeAttackSession({}),
      questions: createTimeAttackSession({}).questions.slice(0, 1),
    };
    const now = 0;
    let state = startQuiz(quiz, now);
    const question = quiz.questions[0];
    state = submitAnswer(state, question.questionId, now + 500);
    expect(state.phase).toBe("revealed");

    // 1問しか無いので、表示時間が過ぎたら先頭（同じ問題）へ戻る。
    state = tick(state, now + 500 + 700);
    expect(state.phase).toBe("answering");
    expect(state.index).toBe(0);
  });

  it("タイムアタックは終了時刻直前の回答を二重採点しない", () => {
    const quiz = createTimeAttackSession({});
    const now = 0;
    let state = startQuiz(quiz, now);
    const first = quiz.questions[0];

    state = submitAnswer(state, first.questionId, now + 1000);
    const afterFirst = state;
    state = submitAnswer(state, first.questionId, now + 1001);
    expect(state).toBe(afterFirst);
    expect(state.answers).toHaveLength(1);
  });

  it("今日の復習は期限の問題だけを出題する", () => {
    const ids = [QUESTIONS[0].id, QUESTIONS[1].id];
    const quiz = createSpacedSession({
      questionCount: 10,
      timeLimitSec: 5,
      questionIds: ids,
    });
    expect(quiz.mode).toBe("spaced");
    expect(quiz.questions.map((question) => question.questionId).sort()).toEqual(
      [...ids].sort(),
    );
  });
});

describe("UIパーツ探し", () => {
  it("指定数まで重複なく対象を選ぶ", () => {
    const targets = pickSpotlightTargets(10);
    // 画面に重ねられる部品数が上限。
    expect(targets.length).toBeGreaterThanOrEqual(8);
    expect(new Set(targets.map((target) => target.id)).size).toBe(targets.length);
    for (const target of targets) {
      expect(QUESTIONS_BY_ID.has(target.id)).toBe(true);
    }
  });

  it("収録数を超える指定でも重複しない", () => {
    const targets = pickSpotlightTargets(1000);
    expect(new Set(targets.map((target) => target.id)).size).toBe(targets.length);
  });
});

describe("音声回答の照合", () => {
  const toast = getQuestion("toast")!;

  it("名称・読み・英語名・別名を受け付ける", () => {
    expect(matchesQuestion("トースト", toast)).toBe(true);
    expect(matchesQuestion("とーすと", toast)).toBe(true);
    expect(matchesQuestion("トースト通知", toast)).toBe(true);
    expect(matchesQuestion("toast", toast)).toBe(true);
    expect(matchesQuestion("トースト", toast)).toBe(true);
  });

  it("文の中に含まれていても一致する", () => {
    expect(matchesQuestion("あの、トーストを出して", toast)).toBe(true);
  });

  it("関係ない語は一致しない", () => {
    expect(matchesQuestion("モーダル", toast)).toBe(false);
    expect(matchesQuestion("", toast)).toBe(false);
  });

  it("表記ゆれ（長音・中黒・大小文字）を吸収する", () => {
    expect(normalizeSpoken("ボトム・シート")).toBe(normalizeSpoken("ボトムシート"));
    expect(normalizeSpoken("TOAST")).toBe(normalizeSpoken("toast"));
    expect(normalizeSpoken("すなっくばー")).toBe(normalizeSpoken("スナックバー"));
  });

  it("同義語どうしは互いに一致しない（呼び分けを壊さない）", () => {
    const snackbar = getQuestion("snackbar")!;
    expect(matchesQuestion("トースト", snackbar)).toBe(false);
  });
});
