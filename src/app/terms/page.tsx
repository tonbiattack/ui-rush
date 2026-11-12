import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_LABELS, QUESTIONS } from "@/lib/questions";

export const metadata: Metadata = {
  title: "用語一覧 | UI Rush",
};

export default function TermsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">用語一覧</h1>
        <p className="text-sm text-slate-600">
          収録中の{QUESTIONS.length}種類のUI用語です。名前・英語表記・読み・説明を確認できます。
        </p>
      </header>

      <ul className="space-y-2">
        {QUESTIONS.map((question) => (
          <li key={question.id} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
              <h2 className="text-base font-bold">{question.nameJa}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {CATEGORY_LABELS[question.category]}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {question.nameEn}（{question.reading}）
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{question.description}</p>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="focus-ring rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-slate-50"
      >
        ホームへ
      </Link>
    </main>
  );
}
