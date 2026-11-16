import type { AnswerOutcome, AnswerRecord } from "./quiz";

export const BASE_POINTS = 100;
export const SPEED_BONUS_MAX = 100;
export const COMBO_STEP = 20;
export const COMBO_BONUS_MAX = 100;

export interface ScoreBreakdown {
  base: number;
  speed: number;
  combo: number;
  total: number;
}

/** 得点なしの内訳。誤答・時間切れの共通値。 */
function zeroBreakdown(): ScoreBreakdown {
  return { base: 0, speed: 0, combo: 0, total: 0 };
}

/**
 * 残り時間の割合に応じた速さボーナス。0〜SPEED_BONUS_MAX の整数。
 * 制限時間ちょうど残っていれば満点、残り0なら0点。
 * 壊れた保存データ（NaN・負の残り時間・制限時間なし）でも落ちないように0へ丸める。
 */
export function speedBonus(remainingMs: number, limitMs: number): number {
  // 制限時間が無い、または壊れている場合は割合を出せないのでボーナスなし。
  if (!Number.isFinite(limitMs) || limitMs <= 0) {
    return 0;
  }
  if (Number.isNaN(remainingMs)) {
    return 0;
  }
  const ratio = Math.min(Math.max(remainingMs / limitMs, 0), 1);
  return Math.round(SPEED_BONUS_MAX * ratio);
}

/**
 * この回答の直前までの連続正解数に応じたボーナス。0〜COMBO_BONUS_MAX の整数。
 * COMBO_STEP ずつ増え、COMBO_BONUS_MAX で頭打ちになる。
 */
export function comboBonus(streakBefore: number): number {
  if (Number.isNaN(streakBefore)) {
    return 0;
  }
  const streak = Math.max(0, Math.floor(streakBefore));
  return Math.min(streak * COMBO_STEP, COMBO_BONUS_MAX);
}

/** 1問ぶんの得点。正解以外はすべて0点。 */
export function scoreForAnswer(input: {
  outcome: AnswerOutcome;
  remainingMs: number;
  limitMs: number;
  streakBefore: number;
}): ScoreBreakdown {
  if (input.outcome !== "correct") {
    return zeroBreakdown();
  }
  const base = BASE_POINTS;
  const speed = speedBonus(input.remainingMs, input.limitMs);
  const combo = comboBonus(input.streakBefore);
  return { base, speed, combo, total: base + speed + combo };
}

/** いま答えたら何点になるかの見込み（出題中のライブ表示に使う）。 */
export function potentialScore(
  remainingMs: number,
  limitMs: number,
  streak: number,
): ScoreBreakdown {
  const base = BASE_POINTS;
  const speed = speedBonus(remainingMs, limitMs);
  const combo = comboBonus(streak);
  return { base, speed, combo, total: base + speed + combo };
}

/** 末尾から数えた現在の連続正解数。 */
export function currentStreak(answers: readonly AnswerRecord[]): number {
  let streak = 0;
  for (let i = answers.length - 1; i >= 0; i -= 1) {
    if (answers[i].outcome !== "correct") {
      break;
    }
    streak += 1;
  }
  return streak;
}

/** セッション中の最長連続正解数。 */
export function maxStreak(answers: readonly AnswerRecord[]): number {
  let best = 0;
  let streak = 0;
  for (const answer of answers) {
    streak = answer.outcome === "correct" ? streak + 1 : 0;
    best = Math.max(best, streak);
  }
  return best;
}

export interface ScoreSummary {
  total: number;
  maxCombo: number;
  breakdowns: ScoreBreakdown[];
}

/**
 * 回答列を先頭から走査して合計点と最長連続を出す。
 * 各問の得点は「その時点までの連続正解数」で決まるので、順番を保ったまま集計する。
 */
export function summarizeScore(
  answers: readonly AnswerRecord[],
  limitMs: number,
): ScoreSummary {
  const breakdowns: ScoreBreakdown[] = [];
  let total = 0;
  let streak = 0;
  let maxCombo = 0;

  for (const answer of answers) {
    const breakdown = scoreForAnswer({
      outcome: answer.outcome,
      remainingMs: answer.remainingMs,
      limitMs,
      streakBefore: streak,
    });
    breakdowns.push(breakdown);
    total += breakdown.total;
    streak = answer.outcome === "correct" ? streak + 1 : 0;
    maxCombo = Math.max(maxCombo, streak);
  }

  return { total, maxCombo, breakdowns };
}

export type Grade = "S" | "A" | "B" | "C" | "D";

/** 正答率から評価を決める。total が 0 なら "D"。 */
export function gradeFor(accuracy: number, total: number): Grade {
  // 1問も出題していないセッションは評価しない。
  if (total <= 0) {
    return "D";
  }
  if (accuracy >= 90) {
    return "S";
  }
  if (accuracy >= 75) {
    return "A";
  }
  if (accuracy >= 60) {
    return "B";
  }
  if (accuracy >= 40) {
    return "C";
  }
  return "D";
}

/**
 * 1問にかかった時間（ミリ秒）。
 * 残り時間から逆算するので、保存済みの回答列だけで求まる。
 * 時間切れは制限時間ちょうど、壊れた値は制限時間に丸める。
 */
export function elapsedMsForAnswer(remainingMs: number, limitMs: number): number {
  if (!Number.isFinite(limitMs) || limitMs <= 0) {
    return 0;
  }
  if (!Number.isFinite(remainingMs)) {
    return limitMs;
  }
  return Math.min(Math.max(limitMs - remainingMs, 0), limitMs);
}

export interface TimingStats {
  /** 正解した問題の平均解答時間（ミリ秒）。正解が無ければ null。 */
  averageMs: number | null;
  /** 正解した問題のうち最速の解答時間（ミリ秒）。正解が無ければ null。 */
  fastestMs: number | null;
  /** 正解した問題のうち最遅の解答時間（ミリ秒）。正解が無ければ null。 */
  slowestMs: number | null;
  /** 正解した問題数。平均の分母。 */
  correctCount: number;
  /** 全問の平均解答時間（ミリ秒）。時間切れは制限時間として数える。 */
  averageAllMs: number | null;
}

/**
 * 解答時間の統計。**正解した問題だけ**を平均・最速・最遅の対象にする。
 * 誤答や時間切れを混ぜると「速く押しただけ」の記録が良く見えてしまうため。
 */
export function summarizeTiming(
  answers: readonly AnswerRecord[],
  limitMs: number,
): TimingStats {
  const correct = answers.filter((answer) => answer.outcome === "correct");
  const all = answers.map((answer) => elapsedMsForAnswer(answer.remainingMs, limitMs));

  if (correct.length === 0) {
    return {
      averageMs: null,
      fastestMs: null,
      slowestMs: null,
      correctCount: 0,
      averageAllMs: all.length === 0 ? null : Math.round(average(all)),
    };
  }

  const times = correct.map((answer) => elapsedMsForAnswer(answer.remainingMs, limitMs));
  return {
    averageMs: Math.round(average(times)),
    fastestMs: Math.min(...times),
    slowestMs: Math.max(...times),
    correctCount: correct.length,
    averageAllMs: all.length === 0 ? null : Math.round(average(all)),
  };
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** ミリ秒を「1.23」のような秒の文字列にする。小数2桁まで。 */
export function formatSeconds(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) {
    return "—";
  }
  return (Math.max(0, ms) / 1000).toFixed(2);
}
