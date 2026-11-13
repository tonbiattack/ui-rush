"use client";

import Link from "next/link";
import { Masthead } from "@/components/ui-kit";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col">
      <Masthead />
      <h1 className="text-xl font-bold">表示できませんでした</h1>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">
        画面の読み込みに失敗しました。もう一度読み込むか、ホームからやり直してください。
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="focus-ring bg-ink px-5 py-3 text-sm font-bold text-paper"
        >
          もう一度読み込む
        </button>
        <Link prefetch={false}
          href="/"
          className="focus-ring border border-rule-strong px-5 py-3 text-sm font-bold hover:border-ink"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}
