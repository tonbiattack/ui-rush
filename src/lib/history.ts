import { QUESTIONS_BY_ID } from "./questions";
import type { AnswerRecord, AnswerOutcome } from "./quiz";

export const STORAGE_KEY = "ui-rush/history/v1";
export const STORAGE_VERSION = 1;

export interface QuestionStat {
  correct: number;
  incorrect: number;
  timeout: number;
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
    const toCount = (input: unknown): number =>
      typeof input === "number" && Number.isFinite(input) && input >= 0
        ? Math.floor(input)
        : 0;
    stats[id] = {
      correct: toCount(value.correct),
      incorrect: toCount(value.incorrect),
      timeout: toCount(value.timeout),
    };
  }

  return {
    version: STORAGE_VERSION,
    stats,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date(0).toISOString(),
  };
}

export function recordAnswers(history: History, answers: readonly AnswerRecord[], now = Date.now()): History {
  const stats: Record<string, QuestionStat> = { ...history.stats };
  for (const answer of answers) {
    const current = stats[answer.questionId] ?? emptyStat();
    const key: AnswerOutcome = answer.outcome;
    stats[answer.questionId] = { ...current, [key]: current[key] + 1 };
  }
  return { version: STORAGE_VERSION, stats, updatedAt: new Date(now).toISOString() };
}

/** 苦手（不正解または時間切れが1回以上ある）問題ID。 */
export function weakQuestionIds(history: History): string[] {
  return Object.entries(history.stats)
    .filter(([, stat]) => stat.incorrect > 0 || stat.timeout > 0)
    .map(([id]) => id);
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
