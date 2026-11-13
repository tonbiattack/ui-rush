"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getQuestion, type Question } from "@/lib/questions";
import { loadResult, type StoredResult } from "@/lib/result-storage";
import { summarizeAnswers, type QuizMode, type QuizResult } from "@/lib/quiz";
import { Figure, Masthead } from "@/components/ui-kit";
import { InstructionExample } from "@/components/term-detail";
import { recordTimeAttack } from "@/lib/use-best-scores";

interface WeakItem {
  question: Question;
  outcome: "incorrect" | "timeout";
  selectedChoiceId: string | null;
}

function buildResult(stored: StoredResult): {
  summary: QuizResult;
  weak: WeakItem[];
} {
  // タイムアタックは同じ問題を繰り返すため、出題数ではなく回答数を分母にする。
  const total =
    stored.mode === "timeattack" ? stored.answers.length : stored.questionIds.length;
  const summary = summarizeAnswers(stored.answers, total);

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

const MODE_LABELS: Record<QuizMode, string> = {
  normal: "通常",
  review: "苦手復習",
  confusable: "呼び分け特訓",
  reverse: "逆引き",
  keyboard: "キーボード操作",
  timeattack: "60秒タイムアタック",
  spaced: "今日の復習",
  spotlight: "UIパーツ探し",
};

export function ResultClient() {
  const router = useRouter();
  // このコンポーネントはClientOnly配下でのみ描画されるため、初期化時に直接読み取れる。
  const [stored] = useState<StoredResult | null>(() => loadResult());
  // タイムアタックは自己ベストを更新する。表示のため、初回に一度だけ判定する。
  const [bestUpdated] = useState(() => {
    const result = loadResult();
    if (!result || result.mode !== "timeattack") {
      return false;
    }
    const correct = result.answers.filter((answer) => answer.outcome === "correct").length;
    return recordTimeAttack(correct);
  });

  const data = useMemo(() => (stored ? buildResult(stored) : null), [stored]);

  if (!stored || !data) {
    return (
      <main className="flex flex-1 flex-col">
        <Masthead />
        <h1 className="text-xl font-bold">まだ結果がありません</h1>
        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">
          クイズを最後まで進めると、ここに成績が並びます。
        </p>
        <div className="mt-5">
          <Link prefetch={false} href="/" className="focus-ring bg-ink px-5 py-3 text-sm font-bold text-paper">
            ホームへ
          </Link>
        </div>
      </main>
    );
  }

  const { summary, weak } = data;
  const retryMode: QuizMode =
    stored.mode === "normal" || stored.mode === "spaced" ? "normal" : stored.mode;
  const retryHref = `/quiz?count=${stored.questionCount}&time=${stored.timeLimitSec}&mode=${retryMode}&reveal=${stored.revealMode}`;
  const reviewIds = Array.from(new Set(weak.map((item) => item.question.id)));
  const reviewHref = `/quiz?count=${stored.questionCount}&time=${stored.timeLimitSec}&mode=review&reveal=${stored.revealMode}&ids=${reviewIds.join(",")}`;
  const wrongRatio = summary.total === 0 ? 0 : summary.correct / summary.total;

  return (
    <main className="flex flex-1 flex-col">
      <Masthead right={<span className="instrument">結果</span>} />

      <header className="border-b border-ink pb-4">
        <p className="text-[11px] text-muted">
          {MODE_LABELS[stored.mode]}・
          {stored.mode === "timeattack"
            ? "60秒"
            : `${stored.timeLimitSec}秒・${stored.revealMode === "auto" ? "自動で次へ" : "自分で次へ"}`}
        </p>
        <div className="mt-1 flex items-end gap-3">
          <p className="instrument text-6xl font-semibold leading-none">
            {summary.correct}
            <span className="text-2xl text-muted">/{summary.total}</span>
          </p>
          <p className="pb-1 text-sm text-muted">
            {stored.mode === "timeattack" ? "問正解（60秒）" : "問正解"}
          </p>
        </div>
        {stored.mode === "timeattack" && (
          <p className="mt-1 text-[11px] text-muted">
            {bestUpdated ? "自己ベストを更新しました。" : "自己ベストは更新されませんでした。"}
            {typeof stored.elapsedMs === "number" &&
              summary.answered > 0 &&
              ` 平均 ${(Math.min(stored.elapsedMs, 60_000) / 1000 / summary.answered).toFixed(1)}秒／問`}
          </p>
        )}

        {/* 正誤の比率を1本の帯で示す。色だけに頼らず、下の数値でも確認できる。 */}
        <div
          className="mt-3 flex h-2 overflow-hidden bg-rule"
          role="img"
          aria-label={`正解${summary.correct}問、不正解${summary.incorrect}問、時間切れ${summary.timeout}問`}
        >
          <span style={{ width: `${wrongRatio * 100}%` }} className="bg-correct" />
          <span
            style={{ width: `${(summary.total === 0 ? 0 : summary.incorrect / summary.total) * 100}%` }}
            className="bg-wrong"
          />
          <span
            style={{ width: `${(summary.total === 0 ? 0 : summary.timeout / summary.total) * 100}%` }}
            className="bg-timeout"
          />
        </div>
      </header>

      <dl className="grid grid-cols-2 divide-x divide-rule border-b border-rule sm:grid-cols-4">
        {[
          { label: "正答率", value: summary.accuracy, unit: "%", color: "text-ink" },
          { label: "正解", value: summary.correct, unit: "問", color: "text-correct" },
          { label: "不正解", value: summary.incorrect, unit: "問", color: "text-wrong" },
          { label: "時間切れ", value: summary.timeout, unit: "問", color: "text-timeout" },
        ].map((item) => (
          <div key={item.label} className="px-3 py-3 first:pl-0">
            <dt className="text-[11px] text-muted">{item.label}</dt>
            <dd className={`mt-0.5 ${item.color}`}>
              <Figure value={item.value} unit={item.unit} size="sm" />
            </dd>
          </div>
        ))}
      </dl>

      <section aria-label="間違えた用語" className="mt-6">
        <div className="flex items-baseline justify-between gap-2 border-b border-ink pb-1">
          <h2 className="text-sm font-bold">間違えた用語</h2>
          <span className="text-[11px] text-muted">{weak.length}件</span>
        </div>

        {weak.length === 0 ? (
          <p className="border-b border-rule py-4 text-sm text-correct">
            全問正解です。
          </p>
        ) : (
          <ul>
            {weak.slice(0, 20).map((item, index) => {
              const selected = item.selectedChoiceId ? getQuestion(item.selectedChoiceId) : null;
              return (
                <li key={`${item.question.id}-${index}`} className="border-b border-rule py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-bold">
                      {item.question.nameJa}
                      <span className="ml-2 text-[11px] font-medium text-muted">
                        {item.question.nameEn}（{item.question.reading}）
                      </span>
                    </p>
                    <span
                      className={`instrument shrink-0 text-[11px] font-semibold ${
                        item.outcome === "timeout" ? "text-timeout" : "text-wrong"
                      }`}
                    >
                      {item.outcome === "timeout" ? "時間切れ" : "不正解"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">
                    あなたの回答: {selected ? selected.nameJa : "回答なし"}
                  </p>
                  <div className="mt-2 max-w-[38rem]">
                    <InstructionExample question={item.question} />
                  </div>
                </li>
              );
            })}
            {weak.length > 20 && (
              <li className="py-2 text-[11px] text-muted">
                ほか {weak.length - 20} 件は用語図鑑で確認できます。
              </li>
            )}
          </ul>
        )}
      </section>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => router.push(retryHref)}
          className="focus-ring flex items-baseline justify-between gap-3 bg-ink px-5 py-4 text-paper transition-colors hover:bg-ink-soft"
        >
          <span className="text-base font-bold">
            {stored.mode === "confusable" ? "もう一度特訓する" : "もう一度挑戦する"}
          </span>
          <span className="instrument text-[11px] text-paper/70">
            {stored.mode === "timeattack"
              ? "60秒"
              : `${stored.questionCount}問 / ${stored.timeLimitSec}秒`}
          </span>
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push(reviewHref)}
            disabled={weak.length === 0}
            className="focus-ring flex items-baseline justify-between gap-2 border border-ink px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-rule-strong disabled:text-muted disabled:hover:bg-transparent disabled:hover:text-muted"
          >
            間違えた問題を復習
            <span className="instrument text-[11px] opacity-70">
              {reviewIds.length}問
            </span>
          </button>
          <Link prefetch={false}
            href="/"
            className="focus-ring border border-rule-strong px-4 py-3 text-sm font-bold transition-colors hover:border-ink"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
