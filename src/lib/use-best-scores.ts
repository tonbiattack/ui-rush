"use client";

import { useSyncExternalStore } from "react";

const KEY = "ui-rush/best/v1";

export interface BestScores {
  /** タイムアタックの自己ベスト（正解数）。 */
  timeAttack: number;
  /** 自己ベストを出した日時。 */
  timeAttackAt: string | null;
}

const EMPTY: BestScores = { timeAttack: 0, timeAttackAt: null };

function read(): BestScores {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Partial<BestScores>;
    return {
      timeAttack:
        typeof parsed.timeAttack === "number" && Number.isFinite(parsed.timeAttack)
          ? Math.max(0, Math.floor(parsed.timeAttack))
          : 0,
      timeAttackAt: typeof parsed.timeAttackAt === "string" ? parsed.timeAttackAt : null,
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

/** 自己ベストを更新する。更新したときだけ true。 */
export function recordTimeAttack(score: number, now = new Date()): boolean {
  const current = read();
  if (score <= current.timeAttack) {
    return false;
  }
  const next: BestScores = { timeAttack: score, timeAttackAt: now.toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 保存できなくてもプレイ自体は完了する。
  }
  cached = next;
  window.dispatchEvent(new Event("ui-rush:best"));
  return true;
}

export function useBestScores(): BestScores {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
