import { describe, expect, it } from "vitest";
import {
  STORAGE_VERSION,
  categoryScores,
  dueCount,
  dueQuestionIds,
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

    expect(questionStat(history, id)).toMatchObject({
      correct: 2,
      incorrect: 1,
      timeout: 1,
    });
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
    expect(history.stats[id]).toMatchObject({ correct: 3, incorrect: 1, timeout: 2 });
  });

  it("不正な数値は0として扱う", () => {
    const id = QUESTIONS[0].id;
    const raw = JSON.stringify({
      version: STORAGE_VERSION,
      stats: { [id]: { correct: "x", incorrect: -3, timeout: null } },
    });
    expect(parseHistory(raw).stats[id]).toMatchObject({
      correct: 0,
      incorrect: 0,
      timeout: 0,
    });
  });
});

describe("間隔反復", () => {
  const day = 86_400_000;

  it("正解すると次回の期限が先になる", () => {
    const id = QUESTIONS[0].id;
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    const history = recordAnswers(emptyHistory(), [answer(id, "correct")], now);
    const stat = questionStat(history, id);

    expect(stat.streak).toBe(1);
    expect(stat.dueAt).toBe(new Date(now + day).toISOString());
  });

  it("連続正解で間隔が伸び、誤答で1日に戻る", () => {
    const id = QUESTIONS[0].id;
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    let history = emptyHistory();
    for (let i = 0; i < 3; i += 1) {
      history = recordAnswers(history, [answer(id, "correct")], now);
    }
    expect(questionStat(history, id).streak).toBe(3);
    expect(questionStat(history, id).dueAt).toBe(new Date(now + 7 * day).toISOString());

    history = recordAnswers(history, [answer(id, "incorrect")], now + 8 * day);
    expect(questionStat(history, id).streak).toBe(0);
    expect(questionStat(history, id).dueAt).toBe(new Date(now + 9 * day).toISOString());
  });

  it("期限が来た問題だけを返す（時計の逆行にも耐える）", () => {
    const [a, b] = QUESTIONS;
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    let history = emptyHistory();
    history = recordAnswers(history, [answer(a.id, "correct")], now);
    history = recordAnswers(history, [answer(b.id, "incorrect")], now);

    // 当日は a も b も期限前（どちらも翌日以降）。
    expect(dueQuestionIds(history, now)).toEqual([]);

    // 翌日は両方期限が来る。
    expect(dueQuestionIds(history, now + day).sort()).toEqual([a.id, b.id].sort());
    expect(dueCount(history, now + day)).toBe(2);

    // 時計が過去に戻っても、未来の期限を期限切れ扱いしない。
    expect(dueQuestionIds(history, now - 30 * day)).toEqual([]);
  });

  it("期限が来た順に並べ、件数を絞れる", () => {
    const [a, b] = QUESTIONS;
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    let history = emptyHistory();
    history = recordAnswers(history, [answer(a.id, "incorrect")], now);
    history = recordAnswers(history, [answer(b.id, "incorrect")], now + day);

    expect(dueQuestionIds(history, now + 3 * day)).toEqual([a.id, b.id]);
    expect(dueQuestionIds(history, now + 3 * day, 1)).toEqual([a.id]);
  });

  it("旧形式の統計（日時なし）も読み込める", () => {
    const id = QUESTIONS[0].id;
    const raw = JSON.stringify({
      version: STORAGE_VERSION,
      stats: { [id]: { correct: 2, incorrect: 0, timeout: 0 } },
    });
    const history = parseHistory(raw);
    expect(questionStat(history, id).correct).toBe(2);
    // 日時が無いものは復習対象にしない。
    expect(dueQuestionIds(history, Date.now())).toEqual([]);
  });

  it("カテゴリ別の正答率を苦手順に返す", () => {
    const formQuestion = QUESTIONS.find((question) => question.category === "form")!;
    const overlayQuestion = QUESTIONS.find((question) => question.category === "overlay")!;
    let history = emptyHistory();
    history = recordAnswers(
      history,
      [answer(formQuestion.id, "incorrect"), answer(overlayQuestion.id, "correct")],
      1,
    );
    const scores = categoryScores(history);
    expect(scores[0].category).toBe("form");
    expect(scores[0].accuracy).toBe(0);
    expect(scores[1].category).toBe("overlay");
    expect(scores[1].accuracy).toBe(100);
  });
});
