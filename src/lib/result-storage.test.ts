import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/questions";
import { parseStoredResult, serializeResult } from "@/lib/result-storage";
import type { AnswerRecord } from "@/lib/quiz";

const answers: AnswerRecord[] = [
  {
    questionId: QUESTIONS[0].id,
    selectedChoiceId: QUESTIONS[1].id,
    outcome: "incorrect",
    remainingMs: 1200,
  },
  {
    questionId: QUESTIONS[1].id,
    selectedChoiceId: null,
    outcome: "timeout",
    remainingMs: 0,
  },
];

const base = {
  mode: "normal" as const,
  timeLimitSec: 5 as const,
  revealMode: "manual" as const,
  questionCount: 10 as const,
  answers,
  questionIds: [QUESTIONS[0].id, QUESTIONS[1].id],
};

describe("結果の受け渡し", () => {
  it("保存した結果を読み戻せる", () => {
    const raw = serializeResult(base, new Date("2026-01-01T00:00:00.000Z"));
    const parsed = parseStoredResult(raw);
    expect(parsed).toMatchObject({
      mode: "normal",
      timeLimitSec: 5,
      revealMode: "manual",
      questionCount: 10,
      answers,
      questionIds: base.questionIds,
      finishedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("旧データに進め方の設定が無ければ手動送りとして扱う", () => {
    const legacy = JSON.stringify({
      ...base,
      revealMode: undefined,
      version: 1,
    });
    expect(parseStoredResult(legacy)?.revealMode).toBe("manual");
  });

  it("未保存・壊れたJSON・型違いはnull", () => {
    expect(parseStoredResult(null)).toBeNull();
    expect(parseStoredResult("")).toBeNull();
    expect(parseStoredResult("{oops")).toBeNull();
    expect(parseStoredResult("[]")).toBeNull();
    expect(parseStoredResult(JSON.stringify({ version: 0 }))).toBeNull();
    expect(
      parseStoredResult(
        JSON.stringify({ ...base, version: 1, mode: "unknown", timeLimitSec: 5 }),
      ),
    ).toBeNull();
  });

  it("未知の問題や不正な回答は捨てる", () => {
    const raw = JSON.stringify({
      ...base,
      version: 1,
      answers: [
        ...answers,
        { questionId: "removed", selectedChoiceId: null, outcome: "timeout", remainingMs: 0 },
        { questionId: QUESTIONS[2].id, selectedChoiceId: null, outcome: "bogus", remainingMs: 0 },
        { questionId: QUESTIONS[2].id, selectedChoiceId: null, outcome: "timeout", remainingMs: "x" },
      ],
      questionIds: [...base.questionIds, "removed"],
    });
    const parsed = parseStoredResult(raw);
    expect(parsed?.answers).toHaveLength(2);
    expect(parsed?.questionIds).toEqual(base.questionIds);
  });

  it("件数と制限時間が許可値以外ならnull", () => {
    const raw = serializeResult({ ...base, questionCount: 15 });
    expect(parseStoredResult(raw)).toBeNull();
    expect(
      parseStoredResult(JSON.stringify({ ...base, version: 1, timeLimitSec: 4 })),
    ).toBeNull();
  });
});
