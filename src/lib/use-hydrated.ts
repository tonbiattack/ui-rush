"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** ハイドレーション完了後にtrueになる。SSRでは常にfalse。 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
