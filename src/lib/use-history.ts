"use client";

import { useSyncExternalStore } from "react";
import {
  STORAGE_KEY,
  emptyHistory,
  parseHistory,
  recordAnswers,
  type History,
} from "@/lib/history";
import type { AnswerRecord } from "@/lib/quiz";

/** 同一タブ内の更新を通知するイベント。storageイベントは他タブでしか発火しない。 */
const HISTORY_EVENT = "ui-rush:history";

let cachedRaw: string | null | undefined;
const EMPTY_HISTORY = emptyHistory();
let cachedValue: History = EMPTY_HISTORY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * 保存データからスナップショットを作る。生の文字列が変わらない限り同じ参照を返すため、
 * useSyncExternalStoreの無限再描画を防げる。
 */
export function getHistorySnapshot(): History {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parseHistory(raw);
  }
  return cachedValue;
}

function getServerSnapshot(): History {
  return EMPTY_HISTORY;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(HISTORY_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HISTORY_EVENT, onChange);
  };
}

function write(next: History): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 容量不足やプライベートモードでもクイズ自体は続行できるようにする。
    cachedRaw = undefined;
  }
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export interface UseHistory {
  /** 保存済みの履歴。サーバー描画時は空の履歴。 */
  history: History;
  addAnswers: (answers: readonly AnswerRecord[]) => void;
  clear: () => void;
}

export function useHistory(): UseHistory {
  const history = useSyncExternalStore(subscribe, getHistorySnapshot, getServerSnapshot);

  return {
    history,
    addAnswers: (answers) => {
      if (answers.length === 0) {
        return;
      }
      write(recordAnswers(getHistorySnapshot(), answers));
    },
    clear: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // 消せなくても画面の状態はリセットする。
      }
      cachedRaw = undefined;
      window.dispatchEvent(new Event(HISTORY_EVENT));
    },
  };
}
