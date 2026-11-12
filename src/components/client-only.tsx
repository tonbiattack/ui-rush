"use client";

import { useHydrated } from "@/lib/use-hydrated";

/**
 * ブラウザのAPI（performance.now、sessionStorageなど）に依存する画面を
 * ハイドレーション完了後にだけ描画する。SSRとの食い違いを避けるための境界。
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hydrated = useHydrated();
  return hydrated ? children : fallback;
}
