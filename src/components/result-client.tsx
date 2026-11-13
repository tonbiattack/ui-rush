"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { QuestionDetail } from "@/components/question-label";
import { getQuestion, type Question } from "@/lib/questions";
import { loadResult, type StoredResult } from "@/lib/result-storage";
import { summarizeAnswers, type QuizResult } from "@/lib/quiz";

interface WeakItem {
  question: Question;
  outcome: "incorrect" | "timeout";
  selectedChoiceId: string | null;
}

function buildResult(stored: StoredResult): {
  summary: QuizResult;
  weak: WeakItem[];
} {
  const summary = summarizeAnswers(stored.answers, stored.questionIds.length);

  const weak: WeakItem[] = [];
  for (const answer of stored.answers) {
    if (answer.outcome === "correct") {
      continue;
    }
    const question = getQuestion(answer.questionId);
    if (!question) {
      continue;
    }
    weak.push({
      question,
      outcome: answer.outcome === "timeout" ? "timeout" : "incorrect",
      selectedChoiceId: answer.selectedChoiceId,
    });
  }

  return { summary, weak };
}

export function ResultClient() {
  const router = useRouter();
  // このコンポーネントはClientOnly配下でのみ描画されるため、初期化時に直接読み取れる。
  const [stored] = useState<StoredResult | null>(() => loadResult());

  const data = useMemo(() => (stored ? buildResult(stored) : null), [stored]);

  if (!stored || !data) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <h1 className="text-xl font-bold">表示できる結果がありません</h1>
        <p className="text-sm text-slate-600">
          クイズを最後まで進めると、ここに成績が表示されます。
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="focus-ring rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            ホームへ
          </Link>
        </div>
      </main>
    );
  }

  const { summary, weak } = data;
  const isConfusable = stored.mode === "confusable";
  const retryHref = isConfusable
    ? `/quiz?count=${stored.questionCount}&time=${stored.timeLimitSec}&mode=confusable&reveal=${stored.revealMode}`
    : `/quiz?count=${stored.questionCount}&time=${stored.timeLimitSec}&mode=normal&reveal=${stored.revealMode}`;
  const reviewIds = Array.from(new Set(weak.map((item) => item.question.id)));
  const reviewHref = `/quiz?count=${stored.questionCount}&time=${stored.timeLimitSec}&mode=review&reveal=${stored.revealMode}&ids=${reviewIds.join(",")}`;

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Result
        </p>
        <h1 className="text-2xl font-bold">
          {summary.correct} / {summary.total} 問正解
        </h1>
        <p className="text-sm text-slate-600">
          {stored.mode === "review"
            ? "苦手復習"
            : stored.mode === "confusable"
              ? "呼び分け特訓"
              : "通常"}
          ・{stored.timeLimitSec}秒設定・
          {stored.revealMode === "auto" ? "自動で次へ" : "自分で次へ"}
        </p>
      </header>

      <section aria-label="成績" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">正答率</p>
          <p className="text-2xl font-bold tabular-nums text-brand-700">{summary.accuracy}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">正解</p>
          <p className="text-2xl font-bold tabular-nums text-emerald-700">{summary.correct}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">不正解</p>
          <p className="text-2xl font-bold tabular-nums text-red-700">{summary.incorrect}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">時間切れ</p>
          <p className="text-2xl font-bold tabular-nums text-amber-700">{summary.timeout}</p>
        </div>
      </section>

      <section aria-label="間違えた用語" className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <h2 className="text-sm font-bold">間違えた用語</h2>
        {weak.length === 0 ? (
          <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
            全問正解です。お見事！
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-200">
            {weak.map((item, index) => {
              const selected = item.selectedChoiceId ? getQuestion(item.selectedChoiceId) : null;
              return (
                <li key={`${item.question.id}-${index}`} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <QuestionDetail question={item.question} />
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        item.outcome === "timeout"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.outcome === "timeout" ? "時間切れ" : "不正解"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    あなたの回答: {selected ? selected.nameJa : "回答なし（時間切れ）"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => router.push(retryHref)}
          className="focus-ring rounded-2xl bg-brand-600 px-6 py-4 text-base font-bold text-white hover:bg-brand-700"
        >
          {isConfusable ? "もう一度特訓する" : "もう一度挑戦する"}
        </button>
        <button
          type="button"
          onClick={() => router.push(reviewHref)}
          disabled={weak.length === 0}
          className="focus-ring rounded-2xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          間違えた問題を復習する
          {weak.length > 0 && (
            <span className="ml-2 text-xs font-medium text-slate-500">{weak.length}問</span>
          )}
        </button>
        <Link
          href="/"
          className="focus-ring rounded-2xl px-6 py-2 text-center text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          ホームに戻る
        </Link>
      </div>
    </main>
  );
}
