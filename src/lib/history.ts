import { QUESTIONS_BY_ID } from "./questions";
import type { AnswerRecord, AnswerOutcome } from "./quiz";

export const STORAGE_KEY = "ui-rush/history/v1";
export const STORAGE_VERSION = 1;

export interface QuestionStat {
  correct: number;
  incorrect: number;
  timeout: number;
  /** 最後に解いた日時（ISO文字列）。間隔反復の起点。 */
  lastAnsweredAt?: string;
  /** 連続正解数。間隔の伸びに使う。 */
  streak?: number;
  /** 次に復習する目安（ISO文字列）。未設定なら未学習。 */
  dueAt?: string;
}

export interface History {
  version: typeof STORAGE_VERSION;
  /** questionId -> 集計 */
  stats: Record<string, QuestionStat>;
  updatedAt: string;
}

export function emptyHistory(): History {
  return { version: STORAGE_VERSION, stats: {}, updatedAt: new Date(0).toISOString() };
}

function emptyStat(): QuestionStat {
  return { correct: 0, incorrect: 0, timeout: 0 };
}

export function isStoredHistory(value: unknown): value is History {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<History>;
  if (candidate.version !== STORAGE_VERSION) {
    return false;
  }
  if (typeof candidate.stats !== "object" || candidate.stats === null) {
    return false;
  }
  return Object.values(candidate.stats).every(
    (stat) =>
      typeof stat === "object" &&
      stat !== null &&
      Number.isFinite((stat as QuestionStat).correct) &&
      Number.isFinite((stat as QuestionStat).incorrect) &&
      Number.isFinite((stat as QuestionStat).timeout),
  );
}

function readCount(input: unknown): number {
  return typeof input === "number" && Number.isFinite(input) && input >= 0
    ? Math.floor(input)
    : 0;
}

function readIsoDate(input: unknown): string | undefined {
  if (typeof input !== "string") {
    return undefined;
  }
  const time = Date.parse(input);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

/**
 * 保存データを安全に読み込む。壊れていたり未知の問題IDが混ざっていた場合は
 * 読み取れる範囲だけを復元し、読めなければ空の履歴を返す。
 */
export function parseHistory(raw: string | null): History {
  if (!raw) {
    return emptyHistory();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyHistory();
  }

  if (typeof parsed !== "object" || parsed === null) {
    return emptyHistory();
  }

  const candidate = parsed as Partial<History>;
  if (candidate.version !== STORAGE_VERSION) {
    return emptyHistory();
  }
  if (typeof candidate.stats !== "object" || candidate.stats === null) {
    return emptyHistory();
  }

  const stats: Record<string, QuestionStat> = {};
  for (const [id, stat] of Object.entries(candidate.stats)) {
    if (!QUESTIONS_BY_ID.has(id) || typeof stat !== "object" || stat === null) {
      continue;
    }
    const value = stat as Partial<QuestionStat>;
    stats[id] = {
      correct: readCount(value.correct),
      incorrect: readCount(value.incorrect),
      timeout: readCount(value.timeout),
      lastAnsweredAt: readIsoDate(value.lastAnsweredAt),
      streak: readCount(value.streak),
      dueAt: readIsoDate(value.dueAt),
    };
  }

  return {
    version: STORAGE_VERSION,
    stats,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date(0).toISOString(),
  };
}

/**
 * 間隔反復の間隔（日）。連続正解に応じて伸ばし、誤答で1日に戻す。
 * 1日 → 3日 → 7日 → 14日 → 30日 → 60日 と段階的に広げる。
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60] as const;

export function nextIntervalDays(streak: number): number {
  const index = Math.min(Math.max(0, streak - 1), REVIEW_INTERVALS_DAYS.length - 1);
  return REVIEW_INTERVALS_DAYS[index];
}

function addDays(base: number, days: number): string {
  return new Date(base + days * 86_400_000).toISOString();
}

export function recordAnswers(history: History, answers: readonly AnswerRecord[], now = Date.now()): History {
  const stats: Record<string, QuestionStat> = { ...history.stats };
  for (const answer of answers) {
    const current = stats[answer.questionId] ?? emptyStat();
    const key: AnswerOutcome = answer.outcome;
    const next: QuestionStat = { ...current, [key]: current[key] + 1 };

    next.lastAnsweredAt = new Date(now).toISOString();
    if (answer.outcome === "correct") {
      next.streak = (current.streak ?? 0) + 1;
      next.dueAt = addDays(now, nextIntervalDays(next.streak));
    } else {
      // 誤答・時間切れは翌日に再確認する。
      next.streak = 0;
      next.dueAt = addDays(now, 1);
    }
    stats[answer.questionId] = next;
  }
  return { version: STORAGE_VERSION, stats, updatedAt: new Date(now).toISOString() };
}

/** 苦手（不正解または時間切れが1回以上ある）問題ID。 */
export function weakQuestionIds(history: History): string[] {
  return Object.entries(history.stats)
    .filter(([, stat]) => stat.incorrect > 0 || stat.timeout > 0)
    .map(([id]) => id);
}

/**
 * 今日の復習対象。期限が来ているもの、または未学習のものを返す。
 * 時計が逆行しても壊れないよう、未来の日時は「まだ早い」として扱う。
 */
export function dueQuestionIds(history: History, now = Date.now(), limit?: number): string[] {
  const due: Array<{ id: string; dueAt: number }> = [];
  for (const [id, stat] of Object.entries(history.stats)) {
    if (!stat.dueAt) {
      continue;
    }
    const dueTime = Date.parse(stat.dueAt);
    if (Number.isNaN(dueTime) || dueTime > now) {
      continue;
    }
    due.push({ id, dueAt: dueTime });
  }
  due.sort((a, b) => a.dueAt - b.dueAt);
  const ids = due.map((item) => item.id);
  return typeof limit === "number" ? ids.slice(0, Math.max(0, limit)) : ids;
}

/** 期限が来ている件数（ホームのバッジ表示用）。 */
export function dueCount(history: History, now = Date.now()): number {
  return dueQuestionIds(history, now).length;
}

export function questionStat(history: History, id: string): QuestionStat {
  return history.stats[id] ?? emptyStat();
}

export function totalAnswered(history: History): number {
  return Object.values(history.stats).reduce(
    (sum, stat) => sum + stat.correct + stat.incorrect + stat.timeout,
    0,
  );
}

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
  accuracy: number;
}

/** カテゴリ別の正答状況。得意・苦手の把握に使う。 */
export function categoryScores(history: History): CategoryScore[] {
  const byCategory = new Map<string, { correct: number; total: number }>();
  for (const [id, stat] of Object.entries(history.stats)) {
    const question = QUESTIONS_BY_ID.get(id);
    if (!question) {
      continue;
    }
    const current = byCategory.get(question.category) ?? { correct: 0, total: 0 };
    current.correct += stat.correct;
    current.total += stat.correct + stat.incorrect + stat.timeout;
    byCategory.set(question.category, current);
  }

  return Array.from(byCategory.entries())
    .filter(([, value]) => value.total > 0)
    .map(([category, value]) => ({
      category,
      correct: value.correct,
      total: value.total,
      accuracy: Math.round((value.correct / value.total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}
