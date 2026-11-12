import { describe, expect, it } from "vitest";
import {
  STORAGE_VERSION,
  emptyHistory,
  parseHistory,
  questionStat,
  recordAnswers,
  totalAnswered,
  weakQuestionIds,
} from "@/lib/history";
import { QUESTIONS } from "@/lib/questions";
import type { AnswerRecord } from "@/lib/quiz";

const answer = (questionId: string, outcome: AnswerRecord["outcome"]): AnswerRecord => ({
  questionId,
  selectedChoiceId: outcome === "timeout" ? null : questionId,
  outcome,
  remainingMs: 0,
});

describe("履歴の保存", () => {
  it("正解・不正解・時間切れを問題別に集計する", () => {
    const id = QUESTIONS[0].id;
    let history = emptyHistory();
    history = recordAnswers(history, [answer(id, "correct"), answer(id, "incorrect")], 1);
    history = recordAnswers(history, [answer(id, "timeout"), answer(id, "correct")], 2);

    expect(questionStat(history, id)).toEqual({ correct: 2, incorrect: 1, timeout: 1 });
    expect(totalAnswered(history)).toBe(4);
    expect(history.updatedAt).toBe(new Date(2).toISOString());
  });

  it("JSONへ保存して読み戻せる", () => {
    const id = QUESTIONS[1].id;
    const history = recordAnswers(emptyHistory(), [answer(id, "incorrect")], 10);
    const restored = parseHistory(JSON.stringify(history));
    expect(restored).toEqual(history);
  });

  it("苦手問題は不正解または時間切れがある問題", () => {
    const [a, b, c] = QUESTIONS;
    let history = emptyHistory();
    history = recordAnswers(
      history,
      [answer(a.id, "correct"), answer(b.id, "incorrect"), answer(c.id, "timeout")],
    );
    expect(weakQuestionIds(history).sort()).toEqual([b.id, c.id].sort());
  });

  it("正解だけの問題は苦手に含まれない", () => {
    const history = recordAnswers(emptyHistory(), [answer(QUESTIONS[0].id, "correct")]);
    expect(weakQuestionIds(history)).toEqual([]);
  });
});

describe("データ不整合時の復旧", () => {
  it("未保存・空文字は空の履歴", () => {
    expect(parseHistory(null)).toEqual(emptyHistory());
    expect(parseHistory("")).toEqual(emptyHistory());
  });

  it("壊れたJSONは空の履歴", () => {
    expect(parseHistory("{oops")).toEqual(emptyHistory());
    expect(parseHistory("null")).toEqual(emptyHistory());
    expect(parseHistory("[]")).toEqual(emptyHistory());
  });

  it("バージョン違いは空の履歴", () => {
    expect(parseHistory(JSON.stringify({ version: 0, stats: {} }))).toEqual(emptyHistory());
  });

  it("未知の問題IDを捨て、読める範囲を復元する", () => {
    const id = QUESTIONS[0].id;
    const raw = JSON.stringify({
      version: STORAGE_VERSION,
      stats: {
        [id]: { correct: 3, incorrect: 1, timeout: 2 },
        "removed-question": { correct: 1, incorrect: 1, timeout: 1 },
      },
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const history = parseHistory(raw);
    expect(Object.keys(history.stats)).toEqual([id]);
    expect(history.stats[id]).toEqual({ correct: 3, incorrect: 1, timeout: 2 });
  });

  it("不正な数値は0として扱う", () => {
    const id = QUESTIONS[0].id;
    const raw = JSON.stringify({
      version: STORAGE_VERSION,
      stats: { [id]: { correct: "x", incorrect: -3, timeout: null } },
    });
    expect(parseHistory(raw).stats[id]).toEqual({ correct: 0, incorrect: 0, timeout: 0 });
  });
});
