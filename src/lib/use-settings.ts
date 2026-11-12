"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_QUESTION_COUNT,
  DEFAULT_TIME_LIMIT_SEC,
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  type QuestionCount,
  type TimeLimitSec,
} from "@/lib/quiz";

export const SETTINGS_KEY = "ui-rush/settings/v1";
const SETTINGS_EVENT = "ui-rush:settings";

export interface Settings {
  time: TimeLimitSec;
  count: QuestionCount;
}

const DEFAULT_SETTINGS: Settings = {
  time: DEFAULT_TIME_LIMIT_SEC,
  count: DEFAULT_QUESTION_COUNT,
};

let cachedRaw: string | null | undefined;
let cachedValue: Settings = DEFAULT_SETTINGS;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SETTINGS_KEY);
  } catch {
    return null;
  }
}

export function getSettingsSnapshot(): Settings {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = DEFAULT_SETTINGS;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { time?: unknown; count?: unknown };
        cachedValue = {
          time: TIME_LIMIT_OPTIONS.includes(parsed.time as TimeLimitSec)
            ? (parsed.time as TimeLimitSec)
            : DEFAULT_SETTINGS.time,
          count: QUESTION_COUNT_OPTIONS.includes(parsed.count as QuestionCount)
            ? (parsed.count as QuestionCount)
            : DEFAULT_SETTINGS.count,
        };
      } catch {
        cachedValue = DEFAULT_SETTINGS;
      }
    }
  }
  return cachedValue;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SETTINGS_KEY || event.key === null) {
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(SETTINGS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SETTINGS_EVENT, onChange);
  };
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    cachedRaw = undefined;
  } catch {
    // 保存できなくても既定値で開始できる。
  }
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettingsSnapshot, () => DEFAULT_SETTINGS);
}
