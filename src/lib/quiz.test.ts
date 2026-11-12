import { describe, expect, it } from "vitest";
import {
  CHOICE_COUNT,
  QUESTION_COUNT_OPTIONS,
  REVEAL_MS,
  TIME_LIMIT_OPTIONS,
  advanceIfReady,
  createQuizSession,
  currentQuestion,
  recordTimeout,
  remainingMs,
  startQuiz,
  submitAnswer,
  summarize,
  tick,
  type QuizSession,
  type TimeLimitSec,
} from "@/lib/quiz";
import { QUESTIONS, QUESTIONS_BY_ID, isConfusable } from "@/lib/questions";

const fixedRng = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const session = (overrides: Partial<QuizSession> = {}): QuizSession => ({
  mode: "normal",
  timeLimitSec: 5,
  questions: [
    { questionId: QUESTIONS[0].id, choices: [QUESTIONS[0].id, "modal", "tabs", "toast"] },
    { questionId: QUESTIONS[1].id, choices: ["accordion", QUESTIONS[1].id, "tabs", "toast"] },
    { questionId: QUESTIONS[2].id, choices: ["accordion", "modal", QUESTIONS[2].id, "toast"] },
  ],
  ...overrides,
});

describe("問題データ", () => {
  it("20種類以上あり、必須項目とIDが一意", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(20);
    const ids = new Set<string>();
    for (const question of QUESTIONS) {
      expect(question.nameJa.trim()).not.toBe("");
      expect(question.nameEn.trim()).not.toBe("");
      expect(question.reading.trim()).not.toBe("");
      expect(question.description.trim()).not.toBe("");
      expect(question.demoType.trim()).not.toBe("");
      expect(question.category.trim()).not.toBe("");
      expect(ids.has(question.id)).toBe(false);
      ids.add(question.id);
    }
  });

  it("日本語名が重複しない", () => {
    const names = QUESTIONS.map((question) => question.nameJa);
    expect(new Set(names).size).toBe(names.length);
  });

  it("紛らわしい組み合わせは相互に登録されている", () => {
    for (const question of QUESTIONS) {
      const partners = QUESTIONS.filter(
        (other) => other.id !== question.id && isConfusable(question.id, other.id),
      );
      for (const partner of partners) {
        expect(isConfusable(partner.id, question.id)).toBe(true);
      }
    }
  });
});

describe("createQuizSession", () => {
  it("指定した問題数を重複なく出題する", () => {
    for (const count of QUESTION_COUNT_OPTIONS) {
      const quiz = createQuizSession({ questionCount: count, timeLimitSec: 5 });
      expect(quiz.questions).toHaveLength(count);
      const ids = quiz.questions.map((question) => question.questionId);
      expect(new Set(ids).size).toBe(count);
      for (const question of quiz.questions) {
        expect(question.choices).toHaveLength(CHOICE_COUNT);
        expect(new Set(question.choices).size).toBe(CHOICE_COUNT);
        expect(question.choices).toContain(question.questionId);
      }
    }
  });

  it("正解位置が固定されない", () => {
    const positions = new Map<number, number>();
    for (let i = 0; i < 60; i += 1) {
      const quiz = createQuizSession({ questionCount: 10, timeLimitSec: 5 });
      for (const question of quiz.questions) {
        const position = question.choices.indexOf(question.questionId);
        positions.set(position, (positions.get(position) ?? 0) + 1);
      }
    }
    expect(positions.size).toBe(CHOICE_COUNT);
    for (const count of positions.values()) {
      expect(count).toBeGreaterThan(0);
    }
  });

  it("同義語を選択肢に混ぜない", () => {
    for (let i = 0; i < 100; i += 1) {
      const quiz = createQuizSession({ questionCount: 20, timeLimitSec: 5 });
      for (const question of quiz.questions) {
        for (const choice of question.choices) {
          if (choice !== question.questionId) {
            expect(isConfusable(question.questionId, choice)).toBe(false);
          }
        }
      }
    }
  });

  it("同カテゴリの候補が足りるときは同カテゴリから誤答を作る", () => {
    for (let i = 0; i < 50; i += 1) {
      const quiz = createQuizSession({ questionCount: 20, timeLimitSec: 5 });
      for (const item of quiz.questions) {
        const question = QUESTIONS_BY_ID.get(item.questionId)!;
        const sameCategoryCount = QUESTIONS.filter(
          (candidate) =>
            candidate.category === question.category &&
            candidate.id !== question.id &&
            !isConfusable(question.id, candidate.id),
        ).length;
        if (sameCategoryCount < CHOICE_COUNT - 1) {
          continue;
        }
        const distractors = item.choices.filter((choice) => choice !== question.id);
        for (const choice of distractors) {
          expect(QUESTIONS_BY_ID.get(choice)?.category).toBe(question.category);
        }
      }
    }
  });

  it("復習モードでは指定した問題だけを出題する", () => {
    const ids = [QUESTIONS[3].id, QUESTIONS[5].id];
    const quiz = createQuizSession({
      questionCount: 10,
      timeLimitSec: 5,
      mode: "review",
      questionIds: ids,
    });
    expect(quiz.questions.map((question) => question.questionId).sort()).toEqual(
      [...ids].sort(),
    );
  });

  it("未知の問題IDは無視する", () => {
    const quiz = createQuizSession({
      questionCount: 10,
      timeLimitSec: 5,
      questionIds: ["unknown", QUESTIONS[0].id],
    });
    expect(quiz.questions.map((question) => question.questionId)).toEqual([QUESTIONS[0].id]);
  });
});

describe("タイマーと状態遷移", () => {
  it.each(TIME_LIMIT_OPTIONS)("制限時間%s秒ちょうどで時間切れになる", (seconds) => {
    const quiz = session({ timeLimitSec: seconds as TimeLimitSec });
    const now = 1000;
    let state = startQuiz(quiz, now);
    expect(state.phase).toBe("answering");
    expect(remainingMs(state, now)).toBe(seconds * 1000);

    state = tick(state, now + seconds * 1000 - 1);
    expect(state.phase).toBe("answering");
    expect(remainingMs(state, now + seconds * 1000 - 1)).toBe(1);

    state = tick(state, now + seconds * 1000);
    expect(state.phase).toBe("revealed");
    expect(state.answers).toHaveLength(1);
    expect(state.answers[0].outcome).toBe("timeout");
  });

  it("正解を選ぶと約0.8秒表示して自動で次へ進む", () => {
    const now = 0;
    let state = startQuiz(session(), now);
    const question = currentQuestion(state)!;
    state = submitAnswer(state, question.questionId, now + 1000);

    expect(state.phase).toBe("revealed");
    expect(state.answers[0]).toMatchObject({ outcome: "correct", remainingMs: 4000 });

    state = advanceIfReady(state, now + 1000 + REVEAL_MS - 1);
    expect(state.phase).toBe("revealed");

    state = advanceIfReady(state, now + 1000 + REVEAL_MS);
    expect(state.phase).toBe("answering");
    expect(state.index).toBe(1);
    expect(state.deadline).toBe(now + 1000 + REVEAL_MS + 5000);
  });

  it("不正解を選ぶと不正解として記録される", () => {
    const now = 0;
    let state = startQuiz(session(), now);
    state = submitAnswer(state, "modal", now + 500);
    expect(state.answers[0]).toMatchObject({
      outcome: "incorrect",
      selectedChoiceId: "modal",
      questionId: QUESTIONS[0].id,
    });
  });

  it("二重回答・二重集計をしない", () => {
    const now = 0;
    let state = startQuiz(session(), now);
    const question = currentQuestion(state)!;
    state = submitAnswer(state, question.questionId, now + 100);
    const afterFirst = state;

    state = submitAnswer(state, "modal", now + 200);
    state = submitAnswer(state, "tabs", now + 300);
    expect(state).toBe(afterFirst);
    expect(state.answers).toHaveLength(1);
  });

  it("回答と時間切れが同時なら1問1結果（時間切れ）", () => {
    const now = 0;
    let state = startQuiz(session(), now);
    const question = currentQuestion(state)!;
    state = submitAnswer(state, question.questionId, now + 5000);
    expect(state.answers).toHaveLength(1);
    expect(state.answers[0].outcome).toBe("timeout");

    // 時間切れ後に届いた回答も無視される。
    state = submitAnswer(state, question.questionId, now + 5001);
    expect(state.answers).toHaveLength(1);
  });

  it("二重の時間切れ処理でも1回だけ記録する", () => {
    const now = 0;
    let state = startQuiz(session(), now);
    state = recordTimeout(state, now + 5000);
    state = tick(state, now + 5000);
    state = recordTimeout(state, now + 5100);
    expect(state.answers).toHaveLength(1);
  });

  it("バックグラウンド復帰時は実時間で追いつく", () => {
    const now = 0;
    let state = startQuiz(session(), now);
    // 30秒後に復帰。全問の時間切れと表示時間を経過した状態になる。
    state = tick(state, now + 30_000);
    expect(state.phase).toBe("finished");
    expect(state.answers).toHaveLength(3);
    expect(state.answers.every((answer) => answer.outcome === "timeout")).toBe(true);
  });

  it("最終問題も正答表示を挟んでから終了する", () => {
    const now = 0;
    let state = startQuiz(session({ questions: [session().questions[0]] }), now);
    const question = currentQuestion(state)!;
    state = submitAnswer(state, question.questionId, now + 1000);
    expect(state.phase).toBe("revealed");
    state = advanceIfReady(state, now + 1000 + REVEAL_MS);
    expect(state.phase).toBe("finished");
  });

  it("未知の選択肢は受け付けない", () => {
    const now = 0;
    const state = startQuiz(session(), now);
    expect(submitAnswer(state, "unknown", now + 100)).toBe(state);
  });

  it("0問のセッションは即終了する", () => {
    const state = startQuiz(session({ questions: [] }), 0);
    expect(state.phase).toBe("finished");
    expect(summarize(state).total).toBe(0);
  });
});

describe("summarize", () => {
  it("正答数・正答率・時間切れ数・誤答一覧を集計する", () => {
    const now = 0;
    let state = startQuiz(session(), now);
    state = submitAnswer(state, QUESTIONS[0].id, now + 1000); // correct
    state = advanceIfReady(state, now + 1800);
    state = submitAnswer(state, "tabs", now + 2000); // incorrect
    state = advanceIfReady(state, now + 3600);
    state = tick(state, now + 20_000); // timeout
    state = tick(state, now + 40_000);

    const result = summarize(state);
    expect(result.total).toBe(3);
    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(1);
    expect(result.timeout).toBe(1);
    expect(result.answered).toBe(2);
    expect(result.accuracy).toBe(33);
    expect(result.wrongQuestionIds).toEqual([QUESTIONS[1].id, QUESTIONS[2].id]);
  });

  it("乱数が固定でも結果が決定的", () => {
    const quiz = createQuizSession({
      questionCount: 10,
      timeLimitSec: 5,
      rng: fixedRng([0.1, 0.4, 0.7, 0.2]),
    });
    expect(quiz.questions.map((question) => question.questionId)).toEqual(
      createQuizSession({
        questionCount: 10,
        timeLimitSec: 5,
        rng: fixedRng([0.1, 0.4, 0.7, 0.2]),
      }).questions.map((question) => question.questionId),
    );
  });
});
