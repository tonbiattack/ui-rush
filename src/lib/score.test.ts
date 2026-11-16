import { describe, expect, it } from "vitest";
import {
  BASE_POINTS,
  COMBO_BONUS_MAX,
  COMBO_STEP,
  SPEED_BONUS_MAX,
  comboBonus,
  currentStreak,
  elapsedMsForAnswer,
  formatSeconds,
  gradeFor,
  maxStreak,
  potentialScore,
  scoreForAnswer,
  speedBonus,
  summarizeScore,
  summarizeTiming,
} from "@/lib/score";
import type { AnswerRecord } from "@/lib/quiz";

const LIMIT_MS = 5000;

const answer = (
  outcome: AnswerRecord["outcome"],
  remainingMs = 0,
  questionId = "modal",
): AnswerRecord => ({
  questionId,
  selectedChoiceId: outcome === "timeout" ? null : questionId,
  outcome,
  remainingMs,
});

describe("speedBonus", () => {
  it("制限時間ちょうど残っていれば満点、残り0なら0点", () => {
    expect(speedBonus(LIMIT_MS, LIMIT_MS)).toBe(SPEED_BONUS_MAX);
    expect(speedBonus(0, LIMIT_MS)).toBe(0);
  });

  it("残り時間が半分なら約半分になる（丸め含む）", () => {
    expect(speedBonus(LIMIT_MS / 2, LIMIT_MS)).toBe(SPEED_BONUS_MAX / 2);
    // 5000ms の 1/3 は 33.33… なので四捨五入して33点。
    expect(speedBonus(5000 / 3, LIMIT_MS)).toBe(33);
    // 5000ms の 2/3 は 66.66… なので四捨五入して67点。
    expect(speedBonus((5000 / 3) * 2, LIMIT_MS)).toBe(67);
  });

  it("残り時間が制限時間を超えても満点で頭打ちになる", () => {
    expect(speedBonus(LIMIT_MS * 2, LIMIT_MS)).toBe(SPEED_BONUS_MAX);
  });

  it("制限時間が0以下なら0点", () => {
    expect(speedBonus(LIMIT_MS, 0)).toBe(0);
    expect(speedBonus(LIMIT_MS, -1000)).toBe(0);
  });

  it("壊れた入力（NaN・負の残り時間）でも例外を投げず0点に丸める", () => {
    expect(() => speedBonus(Number.NaN, LIMIT_MS)).not.toThrow();
    expect(speedBonus(Number.NaN, LIMIT_MS)).toBe(0);
    expect(speedBonus(-1000, LIMIT_MS)).toBe(0);
    expect(speedBonus(Number.POSITIVE_INFINITY, LIMIT_MS)).toBe(SPEED_BONUS_MAX);
  });

  it("常に0〜SPEED_BONUS_MAXの整数を返す", () => {
    for (let remaining = -1000; remaining <= LIMIT_MS + 1000; remaining += 250) {
      const bonus = speedBonus(remaining, LIMIT_MS);
      expect(Number.isInteger(bonus)).toBe(true);
      expect(bonus).toBeGreaterThanOrEqual(0);
      expect(bonus).toBeLessThanOrEqual(SPEED_BONUS_MAX);
    }
  });
});

describe("comboBonus", () => {
  it("連続正解数に応じて20点ずつ増え、100点で頭打ちになる", () => {
    expect(comboBonus(0)).toBe(0);
    expect(comboBonus(1)).toBe(COMBO_STEP);
    expect(comboBonus(2)).toBe(COMBO_STEP * 2);
    expect(comboBonus(3)).toBe(COMBO_STEP * 3);
    expect(comboBonus(4)).toBe(COMBO_STEP * 4);
    expect(comboBonus(5)).toBe(COMBO_BONUS_MAX);
    expect(comboBonus(6)).toBe(COMBO_BONUS_MAX);
    expect(comboBonus(100)).toBe(COMBO_BONUS_MAX);
  });

  it("負の連続数は0として扱う", () => {
    expect(comboBonus(-1)).toBe(0);
    expect(comboBonus(-100)).toBe(0);
  });

  it("小数は切り捨て、NaNは0として扱う", () => {
    expect(comboBonus(2.9)).toBe(COMBO_STEP * 2);
    expect(comboBonus(Number.NaN)).toBe(0);
  });
});

describe("scoreForAnswer", () => {
  it("正解は基礎点＋速さ＋連続の合計になる", () => {
    const breakdown = scoreForAnswer({
      outcome: "correct",
      remainingMs: LIMIT_MS / 2,
      limitMs: LIMIT_MS,
      streakBefore: 2,
    });
    expect(breakdown).toEqual({
      base: BASE_POINTS,
      speed: 50,
      combo: 40,
      total: BASE_POINTS + 50 + 40,
    });
  });

  it("正解以外（incorrect / timeout）は必ず0点", () => {
    for (const outcome of ["incorrect", "timeout"] as const) {
      const breakdown = scoreForAnswer({
        outcome,
        remainingMs: LIMIT_MS,
        limitMs: LIMIT_MS,
        streakBefore: 10,
      });
      expect(breakdown).toEqual({ base: 0, speed: 0, combo: 0, total: 0 });
    }
  });

  it("1問の最大点は基礎点＋速さ上限＋連続上限で300点", () => {
    const breakdown = scoreForAnswer({
      outcome: "correct",
      remainingMs: LIMIT_MS,
      limitMs: LIMIT_MS,
      streakBefore: 5,
    });
    expect(breakdown.total).toBe(300);
    expect(breakdown.total).toBe(BASE_POINTS + SPEED_BONUS_MAX + COMBO_BONUS_MAX);
  });

  it("壊れた入力でも例外を投げない", () => {
    expect(() =>
      scoreForAnswer({
        outcome: "correct",
        remainingMs: Number.NaN,
        limitMs: 0,
        streakBefore: Number.NaN,
      }),
    ).not.toThrow();
    expect(
      scoreForAnswer({
        outcome: "correct",
        remainingMs: Number.NaN,
        limitMs: 0,
        streakBefore: Number.NaN,
      }),
    ).toEqual({ base: BASE_POINTS, speed: 0, combo: 0, total: BASE_POINTS });
  });
});

describe("potentialScore", () => {
  it("正解した場合の内訳を返す", () => {
    expect(potentialScore(LIMIT_MS, LIMIT_MS, 3)).toEqual({
      base: BASE_POINTS,
      speed: SPEED_BONUS_MAX,
      combo: COMBO_STEP * 3,
      total: BASE_POINTS + SPEED_BONUS_MAX + COMBO_STEP * 3,
    });
  });

  it("残り時間が減るほど見込み点も下がる", () => {
    const full = potentialScore(LIMIT_MS, LIMIT_MS, 0);
    const half = potentialScore(LIMIT_MS / 2, LIMIT_MS, 0);
    const zero = potentialScore(0, LIMIT_MS, 0);
    expect(full.total).toBeGreaterThan(half.total);
    expect(half.total).toBeGreaterThan(zero.total);
    expect(zero.total).toBe(BASE_POINTS);
  });
});

describe("currentStreak / maxStreak", () => {
  it("末尾から数えた連続正解数を返す", () => {
    expect(currentStreak([])).toBe(0);
    expect(currentStreak([answer("correct"), answer("correct")])).toBe(2);
    expect(currentStreak([answer("correct"), answer("incorrect"), answer("correct")])).toBe(1);
  });

  it("誤答でリセットされる", () => {
    const answers = [
      answer("correct"),
      answer("correct"),
      answer("correct"),
      answer("incorrect"),
      answer("correct"),
    ];
    expect(currentStreak(answers)).toBe(1);
    expect(currentStreak([...answers, answer("timeout")])).toBe(0);
  });

  it("maxStreakは最長の連続正解数を返す", () => {
    expect(maxStreak([])).toBe(0);
    expect(maxStreak([answer("incorrect"), answer("timeout")])).toBe(0);
    expect(
      maxStreak([
        answer("correct"),
        answer("correct"),
        answer("correct"),
        answer("incorrect"),
        answer("correct"),
        answer("correct"),
      ]),
    ).toBe(3);
  });
});

describe("summarizeScore", () => {
  it("合計点が各問の内訳の合計と一致する", () => {
    const answers = [
      answer("correct", LIMIT_MS),
      answer("correct", LIMIT_MS / 2),
      answer("incorrect", 1000),
      answer("timeout", 0),
      answer("correct", 0),
    ];
    const summary = summarizeScore(answers, LIMIT_MS);

    expect(summary.breakdowns).toHaveLength(answers.length);
    const sum = summary.breakdowns.reduce((acc, breakdown) => acc + breakdown.total, 0);
    expect(summary.total).toBe(sum);
    // 1問目: 100+100+0 / 2問目: 100+50+20 / 3問目: 0 / 4問目: 0 / 5問目: 100+0+0
    expect(summary.total).toBe(200 + 170 + 0 + 0 + 100);
  });

  it("最長連続正解数を返す", () => {
    const summary = summarizeScore(
      [
        answer("correct"),
        answer("correct"),
        answer("incorrect"),
        answer("correct"),
        answer("correct"),
        answer("correct"),
      ],
      LIMIT_MS,
    );
    expect(summary.maxCombo).toBe(3);
  });

  it("空の回答列は0点", () => {
    expect(summarizeScore([], LIMIT_MS)).toEqual({ total: 0, maxCombo: 0, breakdowns: [] });
  });

  it("壊れた入力（NaN・limitMs=0）でも例外を投げない", () => {
    expect(() =>
      summarizeScore([answer("correct", Number.NaN), answer("correct", -1000)], 0),
    ).not.toThrow();
    const summary = summarizeScore([answer("correct", Number.NaN)], 0);
    expect(summary.total).toBe(BASE_POINTS);
  });
});

describe("gradeFor", () => {
  it("正答率の境界値で評価が変わる", () => {
    expect(gradeFor(100, 10)).toBe("S");
    expect(gradeFor(90, 10)).toBe("S");
    expect(gradeFor(89, 10)).toBe("A");
    expect(gradeFor(75, 10)).toBe("A");
    expect(gradeFor(74, 10)).toBe("B");
    expect(gradeFor(60, 10)).toBe("B");
    expect(gradeFor(59, 10)).toBe("C");
    expect(gradeFor(40, 10)).toBe("C");
    expect(gradeFor(39, 10)).toBe("D");
    expect(gradeFor(0, 10)).toBe("D");
  });

  it("出題数が0ならD", () => {
    expect(gradeFor(0, 0)).toBe("D");
    expect(gradeFor(100, 0)).toBe("D");
  });
});

describe("elapsedMsForAnswer", () => {
  it("残り時間から経過時間を逆算する", () => {
    expect(elapsedMsForAnswer(5000, 5000)).toBe(0);
    expect(elapsedMsForAnswer(0, 5000)).toBe(5000);
    expect(elapsedMsForAnswer(2000, 5000)).toBe(3000);
  });

  it("範囲外の値は制限時間に丸める", () => {
    expect(elapsedMsForAnswer(-100, 5000)).toBe(5000);
    expect(elapsedMsForAnswer(9999, 5000)).toBe(0);
  });

  it("壊れた入力でも例外を投げない", () => {
    expect(elapsedMsForAnswer(Number.NaN, 5000)).toBe(5000);
    expect(elapsedMsForAnswer(1000, 0)).toBe(0);
    expect(elapsedMsForAnswer(1000, -1)).toBe(0);
    expect(elapsedMsForAnswer(1000, Number.NaN)).toBe(0);
  });
});

describe("summarizeTiming", () => {
  it("正解した問題だけで平均・最速・最遅を出す", () => {
    const answers = [
      answer("correct", 4000), // 1000ms
      answer("correct", 2000), // 3000ms
      answer("incorrect", 1000), // 4000ms（対象外）
      answer("timeout", 0), // 5000ms（対象外）
    ];
    const stats = summarizeTiming(answers, LIMIT_MS);
    expect(stats.correctCount).toBe(2);
    expect(stats.averageMs).toBe(2000);
    expect(stats.fastestMs).toBe(1000);
    expect(stats.slowestMs).toBe(3000);
  });

  it("全問の平均は誤答・時間切れも含める", () => {
    const answers = [
      answer("correct", 4000), // 1000ms
      answer("incorrect", 1000), // 4000ms
      answer("timeout", 0), // 5000ms
    ];
    const stats = summarizeTiming(answers, LIMIT_MS);
    expect(stats.averageAllMs).toBe(Math.round((1000 + 4000 + 5000) / 3));
  });

  it("正解が無ければ平均・最速・最遅は null", () => {
    const stats = summarizeTiming([answer("incorrect", 1000)], LIMIT_MS);
    expect(stats.averageMs).toBeNull();
    expect(stats.fastestMs).toBeNull();
    expect(stats.slowestMs).toBeNull();
    expect(stats.correctCount).toBe(0);
  });

  it("回答が無ければすべて null", () => {
    const stats = summarizeTiming([], LIMIT_MS);
    expect(stats.averageMs).toBeNull();
    expect(stats.averageAllMs).toBeNull();
    expect(stats.correctCount).toBe(0);
  });

  it("速く押した誤答は平均を良くしない", () => {
    // 正解1問（3000ms）に、速い誤答（100ms）を混ぜても平均は3000msのまま。
    const answers = [answer("correct", 2000), answer("incorrect", 4900)];
    expect(summarizeTiming(answers, LIMIT_MS).averageMs).toBe(3000);
  });
});

describe("formatSeconds", () => {
  it("ミリ秒を秒の文字列にする", () => {
    expect(formatSeconds(0)).toBe("0.00");
    expect(formatSeconds(1234)).toBe("1.23");
    expect(formatSeconds(5000)).toBe("5.00");
  });

  it("未計測はダッシュ", () => {
    expect(formatSeconds(null)).toBe("—");
    expect(formatSeconds(Number.NaN)).toBe("—");
  });

  it("負の値は0として扱う", () => {
    expect(formatSeconds(-500)).toBe("0.00");
  });
});
