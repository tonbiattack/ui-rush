"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getQuestion, type Question } from "@/lib/questions";
import { saveResult } from "@/lib/result-storage";
import { useHistory } from "@/lib/use-history";
import { timeLimitMs, type TimeLimitSec } from "@/lib/quiz";
import { SpecimenFrame } from "@/components/ui-kit";
import { InstructionExample } from "@/components/term-detail";

/**
 * 模擬画面に並べる部品。模式図はCSSだけで描く（デモをそのまま並べると縦に伸びるため）。
 * 名称は出題中に漏れないよう、画面には「部品1」のような中立ラベルだけを出す。
 */
const SPOTS = [
  { id: "accordion", label: "縦に並んだ見出しと開閉の矢印" },
  { id: "tabs", label: "横に並んだ見出しの切り替え" },
  { id: "modal", label: "背景を覆う中央の確認パネル" },
  { id: "toast", label: "隅に浮かぶ小さな通知" },
  { id: "breadcrumb", label: "区切りで並んだ階層の道筋" },
  { id: "toggleswitch", label: "つまみの付いたオンオフ" },
  { id: "checkbox", label: "四角い枠のチェック" },
  { id: "rating", label: "並んだ星の評価" },
] as const;

export type SpotlightTarget = { id: string; label: string };

/** 出題対象をランダムに選ぶ（同じセッション内で重複させない）。 */
export function pickSpotlightTargets(count: number, rng = Math.random): SpotlightTarget[] {
  const pool = SPOTS.filter((spot) => getQuestion(spot.id) !== undefined).map((spot) => ({
    id: spot.id,
    label: spot.label,
  }));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** 部品ごとの模式図。答えの名称は描かない。 */
function Schematic({ id }: { id: string }) {
  switch (id) {
    case "accordion":
      return (
        <div className="w-full space-y-1">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center justify-between border border-rule-strong px-1.5 py-1">
              <span className="h-1.5 w-8 bg-rule-strong" />
              <span className="text-[8px] text-muted">▾</span>
            </div>
          ))}
        </div>
      );
    case "tabs":
      return (
        <div className="w-full">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((tab) => (
              <span
                key={tab}
                className={`h-4 flex-1 border border-rule-strong ${tab === 0 ? "bg-ink" : "bg-surface"}`}
              />
            ))}
          </div>
          <div className="mt-1 h-6 border border-rule-strong bg-surface" />
        </div>
      );
    case "modal":
      return (
        <div className="relative h-16 w-full bg-rule">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2/3 border border-ink bg-surface p-1">
              <span className="block h-1 w-full bg-rule-strong" />
              <div className="mt-1 flex justify-end gap-0.5">
                <span className="h-2 w-4 border border-rule-strong" />
                <span className="h-2 w-4 bg-ink" />
              </div>
            </div>
          </div>
        </div>
      );
    case "toast":
      return (
        <div className="relative h-16 w-full border border-rule-strong bg-surface">
          <div className="absolute right-1 top-1 flex items-center gap-1 bg-ink px-1.5 py-1">
            <span className="h-1 w-8 bg-paper/70" />
          </div>
          <span className="absolute bottom-1 left-1 h-1.5 w-10 bg-rule" />
        </div>
      );
    case "breadcrumb":
      return (
        <div className="flex w-full items-center gap-1">
          {[0, 1, 2, 3].map((crumb) => (
            <span key={crumb} className="flex items-center gap-1">
              {crumb > 0 && <span className="text-[8px] text-muted">/</span>}
              <span className={`h-1.5 ${crumb === 3 ? "w-6 bg-ink" : "w-4 bg-rule-strong"}`} />
            </span>
          ))}
        </div>
      );
    case "toggleswitch":
      return (
        <div className="flex w-full items-center justify-between">
          <span className="h-1.5 w-10 bg-rule" />
          <span className="flex h-5 w-9 items-center rounded-full bg-ink px-0.5">
            <span className="ml-auto h-3.5 w-3.5 rounded-full bg-paper" />
          </span>
        </div>
      );
    case "checkbox":
      return (
        <div className="w-full space-y-1.5">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-1.5">
              <span className={`flex h-3 w-3 items-center justify-center border ${row === 0 ? "border-ink bg-ink" : "border-rule-strong"}`}>
                {row === 0 && <span className="text-[7px] leading-none text-paper">✓</span>}
              </span>
              <span className="h-1 w-10 bg-rule" />
            </div>
          ))}
        </div>
      );
    case "rating":
      return (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-base leading-none ${star <= 3 ? "text-timeout" : "text-rule-strong"}`}
            >
              ★
            </span>
          ))}
        </div>
      );
    default:
      return <span className="h-4 w-full bg-rule" />;
  }
}

interface SpotlightResult {
  question: Question;
  hit: "correct" | "wrong" | "timeout";
}

export function SpotlightClient({ timeLimitSec }: { timeLimitSec: TimeLimitSec }) {
  const router = useRouter();
  const { addAnswers } = useHistory();

  const [targets] = useState<SpotlightTarget[]>(() => pickSpotlightTargets(8));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<SpotlightResult[]>([]);
  const [phase, setPhase] = useState<"answering" | "revealed" | "finished">("answering");
  const [deadline, setDeadline] = useState(() => performance.now() + timeLimitMs(timeLimitSec));
  const [now, setNow] = useState(() => performance.now());
  const answeredRef = useRef(false);

  const target = targets[index];
  const question = target ? getQuestion(target.id) : undefined;

  // タイマー。
  useEffect(() => {
    if (phase !== "answering") {
      return;
    }
    const timer = window.setInterval(() => {
      const current = performance.now();
      setNow(current);
      if (current >= deadline && !answeredRef.current && question) {
        answeredRef.current = true;
        setResults((previous) => [...previous, { question, hit: "timeout" }]);
        setPhase("revealed");
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, deadline, question]);

  const answer = (id: string) => {
    if (phase !== "answering" || !question || answeredRef.current) {
      return;
    }
    answeredRef.current = true;
    setResults((previous) => [
      ...previous,
      { question, hit: id === question.id ? "correct" : "wrong" },
    ]);
    setPhase("revealed");
  };

  const next = () => {
    if (index + 1 >= targets.length) {
      setPhase("finished");
      return;
    }
    answeredRef.current = false;
    setIndex((value) => value + 1);
    setPhase("answering");
    setDeadline(performance.now() + timeLimitMs(timeLimitSec));
  };

  // 終了したら履歴と結果へ。
  const finishedRef = useRef(false);
  useEffect(() => {
    if (phase !== "finished" || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    const answers = results.map((result) => ({
      questionId: result.question.id,
      selectedChoiceId: result.hit === "correct" ? result.question.id : null,
      outcome:
        result.hit === "correct"
          ? ("correct" as const)
          : result.hit === "timeout"
            ? ("timeout" as const)
            : ("incorrect" as const),
      remainingMs: 0,
    }));
    addAnswers(answers);
    saveResult({
      mode: "spotlight",
      timeLimitSec,
      revealMode: "manual",
      questionCount: results.length,
      answers,
      questionIds: results.map((result) => result.question.id),
      elapsedMs: results.length * timeLimitMs(timeLimitSec),
    });
    router.replace("/result");
  }, [phase, results, addAnswers, router, timeLimitSec]);

  if (!question || !target) {
    return (
      <main className="flex flex-1 flex-col">
        <p className="text-sm text-muted">出題できる部品がありません。</p>
        <Link prefetch={false} href="/" className="focus-ring mt-3 w-fit bg-ink px-4 py-2 text-sm font-bold text-paper">
          ホームへ
        </Link>
      </main>
    );
  }

  const remaining = phase === "answering" ? Math.max(0, deadline - now) : 0;
  const ratio = Math.max(0, Math.min(1, remaining / timeLimitMs(timeLimitSec)));
  const last = results.at(-1);
  const isLast = index + 1 >= targets.length;

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">UIパーツ探し</h1>

      <header className="mb-3 border-b border-ink pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="instrument text-sm font-semibold">
            {String(index + 1).padStart(2, "0")}
            <span className="text-muted"> / {targets.length}</span>
          </p>
          <Link prefetch={false}
            href="/"
            className="focus-ring text-[11px] text-muted underline underline-offset-4 hover:text-ink"
          >
            やめる
          </Link>
        </div>
        <div className="mt-1 flex items-end gap-4">
          <p
            role="timer"
            className="instrument shrink-0 text-4xl font-semibold leading-none"
            aria-label={`残り時間 ${(remaining / 1000).toFixed(1)}秒`}
          >
            {(remaining / 1000).toFixed(1)}
            <span className="ml-1 text-xs font-medium text-muted">秒</span>
          </p>
          <div className="flex-1 pb-1">
            <div className="h-1.5 overflow-hidden bg-rule">
              <div
                className={`h-full ${ratio > 0.3 ? "bg-ink" : "bg-wrong"}`}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <p className="mb-2 text-sm font-bold">
        次のどれか1つを押してください:
        <span className="ml-1 border-b-2 border-ink">{question.nameJa}</span>
      </p>

      <SpecimenFrame
        label="模擬画面"
        footer={<p className="text-[11px] text-muted">部品を直接押して答えます</p>}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SPOTS.map((spot, spotIndex) => {
            const spotQuestion = getQuestion(spot.id);
            if (!spotQuestion) {
              return null;
            }
            const isTarget = spot.id === question.id;
            const wasPicked = last?.question.id === spot.id && last.hit !== "correct";

            return (
              <div
                key={spot.id}
                role="button"
                tabIndex={phase === "answering" ? 0 : -1}
                aria-disabled={phase !== "answering"}
                aria-label={`部品${spotIndex + 1}`}
                onClick={() => answer(spot.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    answer(spot.id);
                  }
                }}
                className={`focus-ring relative flex h-24 cursor-pointer flex-col justify-center border p-2 transition-colors ${
                  phase === "revealed" && isTarget
                    ? "border-correct bg-correct-soft"
                    : wasPicked
                      ? "border-wrong bg-wrong-soft"
                      : "border-rule bg-surface hover:border-ink"
                } ${phase !== "answering" ? "cursor-default" : ""}`}
              >
                <span className="pointer-events-none flex flex-1 items-center justify-center">
                  <Schematic id={spot.id} />
                </span>
                <span className="mt-1 block text-center text-[9px] text-muted">
                  部品{spotIndex + 1}
                </span>
                {phase === "revealed" && isTarget && (
                  <span className="absolute right-0.5 top-0.5 bg-correct px-1 text-[9px] font-bold text-paper">
                    正解
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SpecimenFrame>

      {phase === "revealed" && last && (
        <section role="status" aria-live="assertive" className="mt-3 border-t-2 border-ink pt-3">
          <p
            className={`instrument text-2xl font-semibold ${
              last.hit === "correct" ? "text-correct" : "text-wrong"
            }`}
          >
            {last.hit === "correct" ? "正解" : last.hit === "timeout" ? "時間切れ" : "不正解"}
          </p>
          <p className="mt-1 text-sm font-bold">
            {last.question.nameJa}
            <span className="ml-2 text-xs font-medium text-muted">
              {last.question.nameEn}（{last.question.reading}）
            </span>
          </p>
          <p className="mt-1 max-w-[42rem] text-xs leading-relaxed text-ink-soft">
            {last.question.description}
          </p>
          <div className="mt-2 max-w-[42rem]">
            <InstructionExample question={last.question} />
          </div>
          <button
            type="button"
            onClick={next}
            data-testid="advance-button"
            className="focus-ring mt-3 flex w-full items-baseline justify-between gap-3 bg-ink px-5 py-3 text-paper sm:w-auto sm:min-w-[14rem]"
          >
            <span className="text-sm font-bold">{isLast ? "結果を見る" : "次の問題へ"}</span>
            <span className="instrument text-[10px] text-paper/70">
              {isLast ? "集計" : `${timeLimitSec}s`}
            </span>
          </button>
        </section>
      )}

      <p className="sr-only" aria-live="polite">
        {phase === "answering" ? `${question.nameJa}を探してください。` : ""}
      </p>
    </main>
  );
}
