"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { UiDemo } from "@/components/ui-demos";
import { getHistorySnapshot, useHistory } from "@/lib/use-history";
import { weakQuestionIds } from "@/lib/history";
import { saveResult } from "@/lib/result-storage";
import {
  DistinctionNote,
  InstructionExample,
} from "@/components/term-detail";
import { getQuestion } from "@/lib/questions";
import {
  advance,
  createConfusableSession,
  createQuizSession,
  currentQuestion,
  remainingMs,
  startQuiz,
  submitAnswer,
  tick,
  timeLimitMs,
  type QuestionCount,
  type QuizMode,
  type QuizSession,
  type QuizState,
  type RevealMode,
  type TimeLimitSec,
} from "@/lib/quiz";

const DemoPanel = memo(function DemoPanel({ demoType }: { demoType: string }) {
  return <UiDemo demoType={demoType} />;
});

const CHOICE_KEYS = ["1", "2", "3", "4"];
const TICK_INTERVAL_MS = 100;

function timerTone(ratio: number): string {
  if (ratio > 0.5) {
    return "bg-emerald-500";
  }
  if (ratio > 0.2) {
    return "bg-amber-500";
  }
  return "bg-red-500";
}

export interface QuizClientProps {
  questionCount: QuestionCount;
  timeLimitSec: TimeLimitSec;
  mode: QuizMode;
  /** 正誤表示後の進め方（manual: 待機 / auto: 5秒で自動）。 */
  revealMode: RevealMode;
  /** 復習モードで出題する問題ID（結果画面からの復習で使用）。未指定なら履歴の苦手問題。 */
  reviewIds?: string[];
}

/** 復習セッションを作る。対象が無ければ null。 */
function createReviewSession(
  questionCount: QuestionCount,
  timeLimitSec: TimeLimitSec,
  revealMode: RevealMode,
  reviewIds?: string[],
): QuizSession | null {
  const ids = reviewIds?.length ? reviewIds : weakQuestionIds(getHistorySnapshot());
  const knownIds = ids.filter((id) => getQuestion(id) !== undefined);
  if (knownIds.length === 0) {
    return null;
  }
  return createQuizSession({
    questionCount: Math.min(questionCount, knownIds.length),
    timeLimitSec,
    mode: "review",
    revealMode,
    questionIds: knownIds,
  });
}

/** クイズ本体。クライアントでのみ描画する（タイマー基準をブラウザの実時間に固定するため）。 */
export function QuizClient({
  questionCount,
  timeLimitSec,
  mode,
  revealMode,
  reviewIds,
}: QuizClientProps) {
  const router = useRouter();
  const { addAnswers } = useHistory();

  // セッションと開始時刻は初回レンダリング時に一度だけ確定する。
  const [session] = useState<QuizSession | null>(() => {
    if (mode === "review") {
      return createReviewSession(questionCount, timeLimitSec, revealMode, reviewIds);
    }
    if (mode === "confusable") {
      // 出題数は「ペア数×2」で受け取る。
      return createConfusableSession({
        timeLimitSec,
        revealMode,
        pairCount: Math.max(1, Math.floor(questionCount / 2)),
      });
    }
    return createQuizSession({ questionCount, timeLimitSec, mode, revealMode });
  });
  const [state, setState] = useState<QuizState | null>(() =>
    session ? startQuiz(session, performance.now()) : null,
  );
  const stateRef = useRef<QuizState | null>(state);
  const [now, setNow] = useState(() => performance.now());

  const applyState = useCallback((next: QuizState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  // 実時間ベースのタイマー。タブが裏に回っても復帰時に締切から追いつく。
  useEffect(() => {
    if (!session) {
      return;
    }
    const step = () => {
      const current = performance.now();
      setNow(current);
      const previous = stateRef.current;
      if (previous) {
        const next = tick(previous, current);
        if (next !== previous) {
          applyState(next);
        }
      }
    };
    step();
    const timer = window.setInterval(step, TICK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        step();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [session, applyState]);

  // 決着した問題だけを1問1回履歴へ積む（途中終了しても、答えた分は学習履歴に残す）。
  const recordedRef = useRef(0);
  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.answers.length > recordedRef.current) {
      addAnswers(state.answers.slice(recordedRef.current));
      recordedRef.current = state.answers.length;
    }
  }, [state, addAnswers]);

  // 全問終了で結果画面へ。結果はタブ内にだけ保存して渡す。
  const finishedRef = useRef(false);
  useEffect(() => {
    if (!state || !session || state.phase !== "finished" || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    saveResult({
      mode: session.mode,
      timeLimitSec: session.timeLimitSec,
      revealMode: session.revealMode,
      questionCount: session.questions.length,
      answers: state.answers,
      questionIds: session.questions.map((question) => question.questionId),
    });
    router.replace("/result");
  }, [state, session, router]);

  const question = state ? currentQuestion(state) : null;
  const questionData = question ? getQuestion(question.questionId) : undefined;
  const answer = state && state.phase === "revealed" ? state.answers.at(-1) : undefined;
  const answering = state?.phase === "answering";

  const handleAnswer = useCallback(
    (choiceId: string) => {
      const previous = stateRef.current;
      if (!previous) {
        return;
      }
      const next = submitAnswer(previous, choiceId, performance.now());
      if (next !== previous) {
        applyState(next);
        setNow(performance.now());
      }
    },
    [applyState],
  );

  // 解説を読み終えたら次へ。タイマーはここから計り直す。
  const handleAdvance = useCallback(() => {
    const previous = stateRef.current;
    if (!previous || previous.phase !== "revealed") {
      return;
    }
    const next = advance(previous, performance.now());
    if (next !== previous) {
      applyState(next);
      setNow(performance.now());
    }
  }, [applyState]);

  const showingExplanation = state?.phase === "revealed";
  const isLastQuestion = Boolean(
    state && state.index >= state.session.questions.length - 1,
  );

  // PCでは数字キー1〜4で回答、Enter / Space で次へ。
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(target.tagName))
      ) {
        return;
      }
      // ボタンやリンク上でのEnter/Spaceはブラウザ標準の押下に任せる（二重送りを防ぐ）。
      // ただし無効化された選択肢（回答後にdisabledになる）では標準動作が無いので自前で進める。
      const interactive = target?.closest?.(
        'button, a, [role="button"], [role="menuitem"], [role="switch"], [role="tab"]',
      ) as HTMLElement | null;
      const nativeHandlesIt = Boolean(interactive) && !interactive?.hasAttribute("disabled");
      if (nativeHandlesIt && (event.key === "Enter" || event.key === " ")) {
        return;
      }
      const current = stateRef.current;
      if (!current) {
        return;
      }
      if (
        current.phase === "revealed" &&
        (event.key === "Enter" || event.key === " " || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        handleAdvance();
        return;
      }
      const index = CHOICE_KEYS.indexOf(event.key);
      if (index < 0 || current.phase !== "answering") {
        return;
      }
      const choiceId = current.session.questions[current.index]?.choices[index];
      if (!choiceId) {
        return;
      }
      event.preventDefault();
      handleAnswer(choiceId);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleAnswer, handleAdvance]);

  if (!session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <h1 className="text-xl font-bold">苦手な問題がまだありません</h1>
        <p className="max-w-sm text-sm leading-relaxed text-slate-600">
          クイズに挑戦すると、間違えた問題や時間切れになった問題がここに集まります。
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href={`/quiz?count=${questionCount}&time=${timeLimitSec}&mode=normal`}
            className="focus-ring rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            クイズを始める
          </Link>
          <Link
            href="/"
            className="focus-ring rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-white"
          >
            ホームへ
          </Link>
        </div>
      </main>
    );
  }

  if (!state || !question || !questionData) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p role="status" className="text-sm text-slate-500">
          集計中…
        </p>
      </main>
    );
  }

  const limitMs = timeLimitMs(session.timeLimitSec);
  const liveRemaining = answering
    ? remainingMs(state, now)
    : (answer?.remainingMs ?? 0);
  const ratio = Math.max(0, Math.min(1, liveRemaining / limitMs));
  const answeredCorrectly = answer?.outcome === "correct";
  const timedOut = answer?.outcome === "timeout";
  const selected = answer?.selectedChoiceId ?? null;
  const autoRevealRemainingMs =
    showingExplanation && state.revealDeadline !== null
      ? Math.max(0, state.revealDeadline - now)
      : null;

  return (
    <main className="flex flex-1 flex-col gap-3">
      <h1 className="sr-only">UI用語クイズ</h1>
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-200 px-2 py-0.5 font-semibold tabular-nums">
              {state.index + 1} / {session.questions.length}
            </span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 font-semibold text-brand-700">
              {session.mode === "review"
                ? "苦手復習"
                : session.mode === "confusable"
                  ? "呼び分け特訓"
                  : "通常"}
            </span>
            <span className="hidden sm:inline">制限 {session.timeLimitSec}秒</span>
          </div>
          <Link
            href="/"
            className="focus-ring rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            やめる
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <p
            role="timer"
            data-testid="remaining-seconds"
            aria-label={`残り時間 ${(liveRemaining / 1000).toFixed(1)}秒`}
            className={`w-20 text-right text-3xl font-bold tabular-nums ${
              showingExplanation ? "text-slate-500" : ""
            }`}
          >
            {(liveRemaining / 1000).toFixed(1)}
            <span className="ml-0.5 text-sm font-semibold text-slate-500">秒</span>
          </p>
          <div className="flex flex-1 flex-col gap-1">
            <div
              role="progressbar"
              aria-label="残り時間"
              aria-valuemin={0}
              aria-valuemax={session.timeLimitSec}
              aria-valuenow={Number((liveRemaining / 1000).toFixed(1))}
              className="h-2.5 overflow-hidden rounded-full bg-slate-200"
            >
              <div
                className={`h-full rounded-full ${timerTone(ratio)}`}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            {showingExplanation && (
              <p
                data-testid="timer-status"
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"
              >
                <span aria-hidden="true">⏸</span>
                {session.revealMode === "auto"
                  ? "タイマー停止中 — まもなく自動で次へ進みます"
                  : session.mode === "confusable"
                    ? "タイマー停止中 — 2つの違いを確認してから次へ進めます"
                    : "タイマー停止中 — 解説を読んでから次へ進めます"}
              </p>
            )}
          </div>
        </div>
      </header>

      <section
        aria-label="UIデモ"
        className="flex min-h-60 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:min-h-72 sm:p-4"
      >
        <p className="mb-2 text-xs font-semibold text-slate-500">
          {session.mode === "confusable"
            ? "このUIはどっち？（操作して確かめられます）"
            : "このUIは何という？（操作して確かめられます）"}
        </p>
        <div className="flex flex-1 flex-col justify-center">
          <DemoPanel key={question.questionId} demoType={questionData.demoType} />
        </div>

        {answer && (
          <div
            role="status"
            aria-live="assertive"
            className={`mt-2 space-y-2 rounded-xl border px-3 py-2 ${
              answeredCorrectly ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
            }`}
          >
            <div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-bold">
                <span aria-hidden="true">{answeredCorrectly ? "✓" : "✗"}</span>
                <span>{answeredCorrectly ? "正解" : timedOut ? "時間切れ" : "不正解"}</span>
                <span className="font-semibold text-slate-700">
                  正解は「{questionData.nameJa}」（{questionData.reading}）
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-snug text-slate-600">
                {questionData.description}
              </p>
            </div>

            <InstructionExample question={questionData} />

            <DistinctionNote
              question={questionData}
              compareWith={
                session.mode === "confusable" && selected && selected !== question.questionId
                  ? getQuestion(selected)
                  : undefined
              }
            />

            {autoRevealRemainingMs !== null && (
              <p className="text-[11px] font-medium text-slate-500">
                あと{(autoRevealRemainingMs / 1000).toFixed(1)}秒で次へ進みます
              </p>
            )}
          </div>
        )}
      </section>

      <section aria-label="選択肢" className="grid gap-2 sm:grid-cols-2">
        {question.choices.map((choiceId, index) => {
          const choice = getQuestion(choiceId);
          if (!choice) {
            return null;
          }
          const isCorrectChoice = choiceId === question.questionId;
          const isSelected = selected === choiceId;

          let tone = "border-slate-300 bg-white hover:border-brand-500 hover:bg-brand-50";
          if (answer) {
            if (isCorrectChoice) {
              tone = "border-emerald-500 bg-emerald-50";
            } else if (isSelected) {
              tone = "border-red-500 bg-red-50";
            } else {
              tone = "border-slate-200 bg-white opacity-70";
            }
          }

          return (
            <button
              key={choiceId}
              type="button"
              disabled={Boolean(answer)}
              onClick={() => handleAnswer(choiceId)}
              aria-label={`${index + 1}. ${choice.nameJa}`}
              className={`focus-ring flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition-colors disabled:cursor-default ${tone}`}
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600"
              >
                {CHOICE_KEYS[index]}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold sm:text-base">{choice.nameJa}</span>
                <span className="block text-[11px] text-slate-500">{choice.nameEn}</span>
              </span>
              {answer && isCorrectChoice && (
                <span className="shrink-0 text-[11px] font-bold text-emerald-700">✓ 正解</span>
              )}
              {answer && isSelected && !isCorrectChoice && (
                <span className="shrink-0 text-[11px] font-bold text-red-700">
                  ✗ あなたの回答
                </span>
              )}
            </button>
          );
        })}
      </section>

      <p className="text-center text-[11px] text-slate-500">
        {showingExplanation
          ? "Enter / Space でも次へ進めます"
          : "PCでは数字キー 1〜4 でも回答できます"}
      </p>

      {showingExplanation && (
        <div className="sticky bottom-2 z-10 mt-auto">
          <button
            type="button"
            onClick={handleAdvance}
            data-testid="advance-button"
            className="focus-ring w-full rounded-2xl bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-brand-700 active:bg-brand-700"
          >
            {isLastQuestion ? "結果を見る" : "次の問題へ"}
            <span className="ml-2 text-xs font-semibold opacity-90">
              {isLastQuestion ? "ここまでの成績を表示" : "ここから制限時間が始まります"}
            </span>
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {answering
          ? `第${state.index + 1}問です。制限時間は${session.timeLimitSec}秒です。`
          : showingExplanation
            ? "タイマーは停止しています。解説を読んで次へ進んでください。"
            : ""}
      </p>
    </main>
  );
}
