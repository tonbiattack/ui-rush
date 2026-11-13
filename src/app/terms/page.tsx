import type { Metadata } from "next";
import Link from "next/link";
import { TermCard } from "@/components/term-card";
import { Masthead } from "@/components/ui-kit";
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
    <main className="flex flex-1 flex-col">
      <Masthead right={<span className="instrument">{QUESTIONS.length}語</span>} />

      <header className="border-b border-ink pb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
          用語図鑑
        </h1>
        <p className="mt-2 max-w-[38rem] text-sm leading-relaxed text-ink-soft">
          20語の名前・読み・説明・AIへの指示例を分類ごとに並べています。各項目のデモは開いて操作できます。時間制限はありません。
        </p>
        <nav aria-label="分類" className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
          {grouped.map((group) => (
            <a
              key={group.category}
              href={`#category-${group.category}`}
              className="focus-ring text-muted underline underline-offset-4 hover:text-ink"
            >
              {group.label}
              <span className="instrument ml-1">{group.questions.length}</span>
            </a>
          ))}
        </nav>
      </header>

      {grouped.map((group) => (
        <section
          key={group.category}
          id={`category-${group.category}`}
          aria-label={group.label}
          className="mt-6 scroll-mt-4"
        >
          <div className="flex items-baseline justify-between gap-2 border-b border-ink pb-1">
            <h2 className="text-sm font-bold">{group.label}</h2>
            <span className="instrument text-[11px] text-muted">
              {group.questions.length}
            </span>
          </div>
          <ul>
            {group.questions.map((question) => (
              <li key={question.id}>
                <TermCard question={question} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/quiz?count=10&time=5&mode=normal&reveal=manual"
          className="focus-ring bg-ink px-5 py-3 text-sm font-bold text-paper transition-colors hover:bg-ink-soft"
        >
          クイズを始める
        </Link>
        <Link
          href="/dictionary"
          className="focus-ring border border-rule-strong px-5 py-3 text-sm font-bold transition-colors hover:border-ink"
        >
          用語と別名
        </Link>
        <Link
          href="/"
          className="focus-ring border border-rule-strong px-5 py-3 text-sm font-bold transition-colors hover:border-ink"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}
