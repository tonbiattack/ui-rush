"use client";

import { useSyncExternalStore } from "react";

/**
 * 初回だけ出す案内の既読フラグ。
 * チュートリアルを別画面にせず、本編の1問目に重ねるための最小限の状態。
 */
const KEY = "ui-rush/onboarded/v1";
const EVENT = "ui-rush:onboarded";

let cachedRaw: string | null | undefined;
let cachedValue = false;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): boolean {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = raw === "1";
  }
  return cachedValue;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, onChange);
  };
}

/** 案内を既読にする。保存できなくても、その場では閉じる。 */
export function markOnboarded(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // 保存できなくても案内は閉じる。
  }
  cachedRaw = undefined;
  window.dispatchEvent(new Event(EVENT));
}

/** 初回の案内をまだ見ていないか。SSRでは false（案内を出さない）。 */
export function useOnboarding(): boolean {
  return useSyncExternalStore(subscribe, () => !getSnapshot(), () => false);
}
