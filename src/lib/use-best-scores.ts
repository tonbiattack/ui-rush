"use client";

import { useSyncExternalStore } from "react";
import type { QuizMode, TimeLimitSec } from "@/lib/quiz";

const KEY = "ui-rush/best/v1";

export interface BestScores {
  /** タイムアタックの自己ベスト（正解数）。 */
  timeAttack: number;
  /** 自己ベストを出した日時。 */
  timeAttackAt: string | null;
  /** セッション条件ごとの最高得点。キーは scoreKey() で作る。 */
  scores: Record<string, number>;
  /** 最高得点を出した日時。キーは scoreKey() で作る。 */
  scoreAt: Record<string, string>;
}

const EMPTY: BestScores = {
  timeAttack: 0,
  timeAttackAt: null,
  scores: {},
  scoreAt: {},
};

/**
 * 得点の自己ベストを引くキー。
 * 出題数や制限時間が違う記録と比べても意味がないので、条件ごとに分けて持つ。
 */
export function scoreKey(
  mode: QuizMode,
  questionCount: number,
  timeLimitSec: TimeLimitSec,
): string {
  return `${mode}:${questionCount}:${timeLimitSec}`;
}

function readCount(input: unknown): number {
  return typeof input === "number" && Number.isFinite(input)
    ? Math.max(0, Math.floor(input))
    : 0;
}

function readScoreMap(input: unknown): Record<string, number> {
  if (typeof input !== "object" || input === null) {
    return {};
  }
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = Math.max(0, Math.floor(value));
    }
  }
  return out;
}

function readDateMap(input: unknown): Record<string, string> {
  if (typeof input !== "object" || input === null) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

function read(): BestScores {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Partial<BestScores>;
    return {
      timeAttack: readCount(parsed.timeAttack),
      timeAttackAt: typeof parsed.timeAttackAt === "string" ? parsed.timeAttackAt : null,
      // 旧バージョンの保存データには無いので、空の記録として読む。
      scores: readScoreMap(parsed.scores),
      scoreAt: readDateMap(parsed.scoreAt),
    };
  } catch {
    return EMPTY;
  }
}

function subscribe(onChange: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      onChange();
    }
  };
  const local = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener("ui-rush:best", local);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("ui-rush:best", local);
  };
}

let cached: BestScores | null = null;

function getSnapshot(): BestScores {
  if (!cached) {
    cached = read();
  }
  return cached;
}

function write(next: BestScores): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 保存できなくてもプレイ自体は完了する。
  }
  cached = next;
  window.dispatchEvent(new Event("ui-rush:best"));
}

/** 自己ベストを更新する。更新したときだけ true。 */
export function recordTimeAttack(score: number, now = new Date()): boolean {
  const current = read();
  if (score <= current.timeAttack) {
    return false;
  }
  write({ ...current, timeAttack: score, timeAttackAt: now.toISOString() });
  return true;
}

/** 条件別の最高得点を更新する。更新したときだけ true。 */
export function recordScore(key: string, score: number, now = new Date()): boolean {
  const current = read();
  if (score <= (current.scores[key] ?? 0)) {
    return false;
  }
  write({
    ...current,
    scores: { ...current.scores, [key]: score },
    scoreAt: { ...current.scoreAt, [key]: now.toISOString() },
  });
  return true;
}

/** 条件別の最高得点。記録が無ければ 0。 */
export function bestScoreFor(scores: BestScores, key: string): number {
  return scores.scores[key] ?? 0;
}

export function useBestScores(): BestScores {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
