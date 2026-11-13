import type { Metadata } from "next";
import Link from "next/link";
import { TermCard } from "@/components/term-card";
import { CATEGORY_LABELS, QUESTIONS, type QuestionCategory } from "@/lib/questions";

export const metadata: Metadata = {
  title: "用語図鑑 | UI Rush",
};

const CATEGORY_ORDER: QuestionCategory[] = [
  "overlay",
  "feedback",
  "navigation",
  "form",
  "disclosure",
];

export default function TermsPage() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    questions: QUESTIONS.filter((question) => question.category === category),
  })).filter((group) => group.questions.length > 0);

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Dictionary
        </p>
        <h1 className="text-xl font-bold sm:text-2xl">用語図鑑</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          収録中の{QUESTIONS.length}種類を、分類ごとにまとめました。
          デモを開いて操作しながら、名前・読み・使い方の指示例まで確認できます。時間制限はありません。
        </p>
      </header>

      <nav aria-label="分類" className="flex flex-wrap gap-1.5">
        {grouped.map((group) => (
          <a
            key={group.category}
            href={`#category-${group.category}`}
            className="focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {group.label}
            <span className="ml-1 text-slate-400">{group.questions.length}</span>
          </a>
        ))}
      </nav>

      {grouped.map((group) => (
        <section
          key={group.category}
          id={`category-${group.category}`}
          aria-label={group.label}
          className="scroll-mt-2 space-y-2"
        >
          <h2 className="flex items-baseline gap-2 text-sm font-bold">
            {group.label}
            <span className="text-xs font-medium text-slate-400">
              {group.questions.length}種類
            </span>
          </h2>
          <ul className="space-y-2">
            {group.questions.map((question) => (
              <li key={question.id}>
                <TermCard question={question} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="flex flex-col gap-2 pt-1">
        <Link
          href="/quiz?count=10&time=5&mode=normal&reveal=manual"
          className="focus-ring rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          覚えたらクイズに挑戦
        </Link>
        <Link
          href="/"
          className="focus-ring rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-slate-50"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}
