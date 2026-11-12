"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-xl font-bold">問題が発生しました</h1>
      <p className="text-sm text-slate-600">
        画面を再読み込みするか、ホームからやり直してください。
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="focus-ring rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
        >
          再読み込み
        </button>
        <Link
          href="/"
          className="focus-ring rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}
