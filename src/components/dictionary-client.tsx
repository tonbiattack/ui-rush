"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Masthead } from "@/components/ui-kit";
import {
  CATEGORY_LABELS,
  CONFUSABLE_PAIRS,
  CONFUSABLE,
  QUESTIONS,
  getQuestion,
  searchQuestions,
} from "@/lib/questions";

export function DictionaryClient() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchQuestions(query), [query]);
  const comparisons = useMemo(
    () =>
      CONFUSABLE_PAIRS.map((pair) => ({
        a: getQuestion(pair.a),
        b: getQuestion(pair.b),
        distinction: pair.distinction,
      })).filter((item) => item.a && item.b),
    [],
  );

  return (
    <main className="flex flex-1 flex-col">
      <Masthead right={<span className="instrument">{QUESTIONS.length}語</span>} />

      <header className="border-b border-ink pb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
          用語と別名
        </h1>
        <p className="mt-2 max-w-[38rem] text-sm leading-relaxed text-ink-soft">
          同じUIでも呼び方が複数あります。推奨する呼び方と、似ているが別物のUIを並べています。名前・英語名・読み・別名のどれでも検索できます。
        </p>
        <label className="mt-3 flex items-center gap-1.5 border border-rule-strong px-2">
          <span aria-hidden="true" className="text-muted">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例: プルダウン / toast / ぷるだうん"
            aria-label="用語を検索"
            className="w-full bg-transparent py-2 text-sm outline-none"
          />
        </label>
        <p className="mt-1 text-[11px] text-muted">{results.length}件</p>
      </header>

      <section aria-label="用語と別名" className="mt-4">
        {results.length === 0 ? (
          <p className="border-b border-rule py-4 text-sm text-muted">
            該当する用語がありません。別の表記で試してください。
          </p>
        ) : (
          <ul>
            {results.map((question) => (
              <li key={question.id} className="border-b border-rule py-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h2 className="text-sm font-bold">{question.nameJa}</h2>
                  <span className="instrument text-[11px] text-muted">
                    {question.nameEn}（{question.reading}）
                  </span>
                  <span className="border border-rule-strong px-1.5 py-px text-[10px] text-muted">
                    {CATEGORY_LABELS[question.category]}
                  </span>
                </div>
                {question.aliases.length > 0 && (
                  <p className="mt-1 text-[11px] text-ink-soft">
                    別名: {question.aliases.join(" / ")}
                  </p>
                )}
                {CONFUSABLE[question.id]?.length > 0 && (
                  <p className="mt-0.5 text-[11px] text-muted">
                    似ているが別物:{" "}
                    {CONFUSABLE[question.id]
                      .map((id) => getQuestion(id)?.nameJa)
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                )}
                <p className="mt-1 max-w-[42rem] text-xs leading-relaxed text-ink-soft">
                  {question.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="呼び分け" className="mt-6">
        <div className="flex items-baseline justify-between gap-2 border-b border-ink pb-1">
          <h2 className="text-sm font-bold">呼び分けのコツ</h2>
          <span className="text-[11px] text-muted">{comparisons.length}組</span>
        </div>
        <ul>
          {comparisons.map((item) => (
            <li key={`${item.a!.id}-${item.b!.id}`} className="border-b border-rule py-3">
              <p className="text-sm font-bold">
                {item.a!.nameJa}
                <span className="mx-1 text-muted">/</span>
                {item.b!.nameJa}
              </p>
              <p className="mt-1 max-w-[42rem] text-xs leading-relaxed text-ink-soft">
                {item.distinction}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link prefetch={false}
          href="/quiz?count=10&time=5&mode=confusable&reveal=manual"
          className="focus-ring bg-ink px-5 py-3 text-sm font-bold text-paper transition-colors hover:bg-ink-soft"
        >
          呼び分け特訓を始める
        </Link>
        <Link prefetch={false}
          href="/terms"
          className="focus-ring border border-rule-strong px-5 py-3 text-sm font-bold transition-colors hover:border-ink"
        >
          用語図鑑へ
        </Link>
        <Link prefetch={false}
          href="/"
          className="focus-ring border border-rule-strong px-5 py-3 text-sm font-bold transition-colors hover:border-ink"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}
