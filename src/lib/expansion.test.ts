import { describe, expect, it } from "vitest";
import {
  ALL_QUESTIONS,
  CATEGORY_ORDER,
  QUESTIONS,
  QUESTIONS_BY_ID,
  getQuestion,
} from "@/lib/questions";
import { PRACTICAL_CASES } from "@/lib/practical-cases";
import { createPracticalSession } from "@/lib/quiz";
import { hasDemo } from "@/components/ui-demos";

describe("用語の拡充（Issue #18）", () => {
  it("UI用語が100語以上ある", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(100);
  });

  it("全用語に操作できるデモがある", () => {
    for (const question of ALL_QUESTIONS) {
      expect(
        hasDemo(question.demoType),
        `${question.nameJa} のデモ（${question.demoType}）が未登録です`,
      ).toBe(true);
    }
  });

  it("別名が他の用語の名称と衝突しない", () => {
    const names = new Set(QUESTIONS.map((question) => question.nameJa));
    for (const question of QUESTIONS) {
      for (const alias of question.aliases) {
        // 自分の名称は当然含むので除く。
        if (alias === question.nameJa) {
          continue;
        }
        expect(
          names.has(alias),
          `${question.nameJa} の別名「${alias}」が他の用語の名称と重複しています`,
        ).toBe(false);
      }
    }
  });

  it("逆引きの出題文が一意で、名称を含まない", () => {
    const prompts = QUESTIONS.map((question) => question.reversePrompt);
    expect(new Set(prompts).size).toBe(prompts.length);
    for (const question of QUESTIONS) {
      expect(question.reversePrompt).not.toContain(question.nameJa);
      expect(question.reversePrompt).not.toContain(question.nameEn);
    }
  });

  it("カテゴリがすべて既知の値", () => {
    const known = new Set([
      "overlay",
      "feedback",
      "navigation",
      "form",
      "disclosure",
      "content",
      "data",
      "layout",
    ]);
    for (const question of ALL_QUESTIONS) {
      expect(known.has(question.category)).toBe(true);
    }
  });

  it("用語図鑑の分類リストが全カテゴリを網羅する", () => {
    // 図鑑の CATEGORY_ORDER から漏れたカテゴリは、その用語が図鑑に出なくなる。
    const used = new Set(QUESTIONS.map((question) => question.category));
    const listed = new Set(CATEGORY_ORDER);
    for (const category of used) {
      expect(listed.has(category), `図鑑の分類に ${category} がありません`).toBe(true);
    }
    // 重複が無いことも確かめる。
    expect(CATEGORY_ORDER.length).toBe(listed.size);
  });
});

describe("実践ケース（Issue #19）", () => {
  it("30問以上ある", () => {
    expect(PRACTICAL_CASES.length).toBeGreaterThanOrEqual(30);
  });

  it("IDと出題文が一意", () => {
    const ids = PRACTICAL_CASES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    const prompts = PRACTICAL_CASES.map((item) => item.prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("正解と誤答3つが登録済みの用語を指す", () => {
    for (const item of PRACTICAL_CASES) {
      expect(QUESTIONS_BY_ID.has(item.answerId), `${item.id} の正解が未登録`).toBe(true);
      expect(item.distractorIds).toHaveLength(3);
      for (const id of item.distractorIds) {
        expect(QUESTIONS_BY_ID.has(id), `${item.id} の誤答 ${id} が未登録`).toBe(true);
        expect(id).not.toBe(item.answerId);
      }
      // 誤答どうしの重複を許さない（4択が3択になってしまう）。
      expect(new Set(item.distractorIds).size).toBe(3);
    }
  });

  it("出題文に正解の名称・英語名・別名が含まれない", () => {
    for (const item of PRACTICAL_CASES) {
      const answer = getQuestion(item.answerId);
      expect(answer).toBeDefined();
      if (!answer) {
        continue;
      }
      expect(item.prompt).not.toContain(answer.nameJa);
      expect(item.prompt).not.toContain(answer.nameEn);
      for (const alias of answer.aliases) {
        expect(
          item.prompt.includes(alias),
          `${item.id} の出題文に別名「${alias}」が含まれています`,
        ).toBe(false);
      }
    }
  });

  it("正解と誤答それぞれに理由がある", () => {
    for (const item of PRACTICAL_CASES) {
      expect(item.reason.trim()).not.toBe("");
      expect(item.distractorReasons).toHaveLength(3);
      for (const reason of item.distractorReasons) {
        expect(reason.trim()).not.toBe("");
      }
    }
  });

  it("セッションは4択で、正解を含み、理由が選択肢と対応する", () => {
    const quiz = createPracticalSession({ questionCount: 10, timeLimitSec: 5 });
    expect(quiz.mode).toBe("practical");
    expect(quiz.questions).toHaveLength(10);

    for (const item of quiz.questions) {
      expect(item.choices).toHaveLength(4);
      expect(new Set(item.choices).size).toBe(4);
      expect(item.choices).toContain(item.questionId);
      expect(item.casePrompt?.trim()).toBeTruthy();
      expect(item.caseReason?.trim()).toBeTruthy();
      expect(item.caseDistractorReasons).toHaveLength(4);

      // 正解の位置の理由が、そのケースの正解理由と一致する。
      // 同じ用語を問うケースが複数あるので、出題文で照合する。
      const source = PRACTICAL_CASES.find((entry) => entry.prompt === item.casePrompt);
      expect(source).toBeDefined();
      expect(source?.answerId).toBe(item.questionId);
      const correctIndex = item.choices.indexOf(item.questionId);
      expect(item.caseDistractorReasons?.[correctIndex]).toBe(source?.reason);
    }
  });

  it("収録数を超える指定でも重複しない", () => {
    const quiz = createPracticalSession({ questionCount: 1000, timeLimitSec: 5 });
    const ids = quiz.questions.map((item) => item.questionId);
    expect(ids.length).toBeLessThanOrEqual(PRACTICAL_CASES.length);
    expect(new Set(quiz.questions.map((item) => item.casePrompt)).size).toBe(ids.length);
  });
});
