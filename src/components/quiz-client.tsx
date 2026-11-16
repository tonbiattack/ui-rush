"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { SpecimenFrame, Stamp } from "@/components/ui-kit";
import { UiDemo } from "@/components/ui-demos";
import { matchesQuestion, useSpeech } from "@/lib/use-speech";
import { getHistorySnapshot, useHistory } from "@/lib/use-history";
import { weakQuestionIds } from "@/lib/history";
import { markOnboarded, useOnboarding } from "@/lib/use-onboarding";
import { saveResult } from "@/lib/result-storage";
import {
  COMBO_BONUS_MAX,
  COMBO_STEP,
  currentStreak,
  elapsedMsForAnswer,
  formatSeconds,
  potentialScore,
  scoreForAnswer,
  summarizeScore,
  summarizeTiming,
} from "@/lib/score";
import {
  DistinctionNote,
  InstructionExample,
} from "@/components/term-detail";
import { getQuestion } from "@/lib/questions";
import {
  advance,
  createConfusableSession,
  createKeyboardSession,
  createQuizSession,
  createReverseSession,
  createSpacedSession,
  createTimeAttackSession,
  currentQuestion,
  remainingMs,
  remainingSessionMs,
  startQuiz,
  submitAnswer,
  tick,
  TIME_ATTACK_MS,
  timeLimitMs,
  type QuestionCount,
  type QuizMode,
  type QuizSession,
  type QuizState,
  type RevealMode,
  type TimeLimitSec,
} from "@/lib/quiz";
import { dueQuestionIds } from "@/lib/history";

/** モード名。ヘッダーの表示に使う。 */
const MODE_TITLES: Record<QuizMode, string> = {
  normal: "通常",
  review: "苦手復習",
  confusable: "呼び分け特訓",
  reverse: "逆引き",
  keyboard: "キーボード操作",
  timeattack: "60秒タイムアタック",
  spaced: "今日の復習",
  spotlight: "UIパーツ探し",
};

const DemoPanel = memo(function DemoPanel({ demoType }: { demoType: string }) {
  return <UiDemo demoType={demoType} />;
});

const CHOICE_KEYS = ["1", "2", "3", "4"];
const TICK_INTERVAL_MS = 100;

/** 得点は4桁までなので、桁区切りだけ自前で入れる（ロケール依存を避ける）。 */
function formatPoints(value: number): string {
  return String(Math.max(0, Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function timerTone(ratio: number): string {
  if (ratio > 0.5) {
    return "bg-ink";
  }
  if (ratio > 0.2) {
    return "bg-timeout";
  }
  return "bg-wrong";
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

/** 間隔反復の復習セッションを作る。期限が来た問題が無ければ null。 */
function createSpacedReviewSession(
  questionCount: QuestionCount,
  timeLimitSec: TimeLimitSec,
  revealMode: RevealMode,
  reviewIds?: string[],
): QuizSession | null {
  const ids = reviewIds?.length ? reviewIds : dueQuestionIds(getHistorySnapshot());
  const knownIds = ids.filter((id) => getQuestion(id) !== undefined);
  if (knownIds.length === 0) {
    return null;
  }
  return createSpacedSession({
    questionCount: Math.min(questionCount, knownIds.length),
    timeLimitSec,
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
  // 初回だけ、得点の読み方を1問目のうちに伝える（別画面のチュートリアルは挟まない）。
  const showOnboarding = useOnboarding();

  // セッションと開始時刻は初回レンダリング時に一度だけ確定する。
  const [session] = useState<QuizSession | null>(() => {
    if (mode === "review") {
      return createReviewSession(questionCount, timeLimitSec, revealMode, reviewIds);
    }
    if (mode === "spaced") {
      return createSpacedReviewSession(questionCount, timeLimitSec, revealMode, reviewIds);
    }
    if (mode === "confusable") {
      // 出題数は「ペア数×2」で受け取る。
      return createConfusableSession({
        timeLimitSec,
        revealMode,
        pairCount: Math.max(1, Math.floor(questionCount / 2)),
      });
    }
    if (mode === "reverse") {
      return createReverseSession({ questionCount, timeLimitSec, revealMode });
    }
    if (mode === "keyboard") {
      return createKeyboardSession({ questionCount, timeLimitSec, revealMode });
    }
    if (mode === "timeattack") {
      return createTimeAttackSession({ revealMode });
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
    const finalScore = summarizeScore(state.answers, timeLimitMs(session.timeLimitSec));
    saveResult({
      mode: session.mode,
      timeLimitSec: session.timeLimitSec,
      revealMode: session.revealMode,
      questionCount: session.questions.length,
      answers: state.answers,
      questionIds: session.questions.map((question) => question.questionId),
      elapsedMs: performance.now() - state.startedAt,
      score: finalScore.total,
      maxCombo: finalScore.maxCombo,
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

  // 音声で答えたとき、聞き取れた名称に一致する選択肢を選ぶ。
  const handleSpoken = useCallback(
    (transcript: string) => {
      const previous = stateRef.current;
      if (!previous || previous.phase !== "answering") {
        return;
      }
      const current = previous.session.questions[previous.index];
      const match = current?.choices
        .map((choiceId) => getQuestion(choiceId))
        .find((choice) => choice && matchesQuestion(transcript, choice));
      if (match) {
        handleAnswer(match.id);
      }
    },
    [handleAnswer],
  );

  const speech = useSpeech(handleSpoken);

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

  // 回答したら解説へ視線を移す。スクロール位置だけを動かし、演出は加えない。
  const revealRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!showingExplanation) {
      return;
    }
    const node = revealRef.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    // 既に画面内に見えているなら何もしない。
    if (rect.top < window.innerHeight * 0.6) {
      return;
    }
    node.scrollIntoView({ block: "start", behavior: "auto" });
  }, [showingExplanation, state?.index]);

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
      <main className="flex flex-1 flex-col">
        <h1 className="text-xl font-bold">苦手な問題がまだありません</h1>
        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">
          クイズに挑戦すると、間違えた問題や時間切れになった問題がここに溜まります。
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link prefetch={false}
            href={`/quiz?count=${questionCount}&time=${timeLimitSec}&mode=normal&reveal=${revealMode}`}
            className="focus-ring bg-ink px-5 py-3 text-sm font-bold text-paper"
          >
            クイズを始める
          </Link>
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

  if (!state || !question || !questionData) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p role="status" className="instrument text-sm text-muted">
          準備中…
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

  // 得点。出題中は「いま正解したら何点か」をライブで見せ、時間とともに減らす。
  // 回答後は確定した内訳を出す。連続正解は「この回答より前」の連続数で数える。
  const settledAnswers = answer ? state.answers.slice(0, -1) : state.answers;
  const streakBefore = currentStreak(settledAnswers);
  const earned = answer
    ? scoreForAnswer({
        outcome: answer.outcome,
        remainingMs: answer.remainingMs,
        limitMs,
        streakBefore,
      })
    : null;
  const potential = answering
    ? potentialScore(liveRemaining, limitMs, streakBefore)
    : null;
  // 得点は回答した瞬間に増える（数字が跳ねるのを見せる）。
  const scoreBefore = summarizeScore(settledAnswers, limitMs).total;
  const runningScore = scoreBefore + (earned?.total ?? 0);
  const comboActive = streakBefore > 0;
  const comboAtMax = streakBefore * COMBO_STEP >= COMBO_BONUS_MAX;

  // 解答時間。出題中は経過をそのまま数え、回答後は確定値を出す。
  const elapsedMs = answering
    ? Math.max(0, limitMs - liveRemaining)
    : answer
      ? elapsedMsForAnswer(answer.remainingMs, limitMs)
      : 0;
  const priorTiming = summarizeTiming(settledAnswers, limitMs);
  const timing = summarizeTiming(state.answers, limitMs);
  // 誤答は最速記録と比較しない。正解した問題の中での最速を示す。
  const isPersonalBest =
    answeredCorrectly &&
    priorTiming.fastestMs !== null &&
    elapsedMs < priorTiming.fastestMs;
  const autoRevealRemainingMs =
    showingExplanation && state.revealDeadline !== null
      ? Math.max(0, state.revealDeadline - now)
      : null;
  // タイムアタックはセッション全体の残り時間を主役にする。
  const sessionRemaining = remainingSessionMs(state, now);
  const isTimeAttack = sessionRemaining !== null;
  const promptText =
    session.mode === "reverse" || session.mode === "spaced"
      ? questionData.reversePrompt
      : null;

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">UI用語クイズ</h1>

      {/* 計器レール: 進捗・残り時間・脱出。細い罫線だけで区切る。 */}
      <header className="mb-4 border-b border-ink pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <p className="instrument text-sm font-semibold">
              {String(state.index + 1).padStart(2, "0")}
              <span className="text-muted"> / {state.session.questions.length}</span>
            </p>
            <p className="text-[11px] text-muted">
              {MODE_TITLES[session.mode]}
              {isTimeAttack
                ? `・1問 ${session.timeLimitSec}秒`
                : `・制限 ${session.timeLimitSec}秒`}
            </p>
          </div>
          <Link prefetch={false}
            href="/"
            className="focus-ring text-[11px] text-muted underline underline-offset-4 hover:text-ink"
          >
            やめる
          </Link>
        </div>

        <div className="mt-2 flex items-end gap-4">
          <p
            role="timer"
            data-testid="remaining-seconds"
            aria-label={`残り時間 ${(liveRemaining / 1000).toFixed(1)}秒`}
            className={`instrument shrink-0 text-5xl font-semibold leading-none ${
              showingExplanation ? "text-muted" : "text-ink"
            }`}
          >
            {((isTimeAttack ? (sessionRemaining ?? 0) : liveRemaining) / 1000).toFixed(1)}
            <span className="ml-1 text-xs font-medium text-muted">秒</span>
          </p>
          <div className="flex flex-1 flex-col gap-1 pb-1">
            <div
              role="progressbar"
              aria-label={isTimeAttack ? "残り時間（セッション）" : "残り時間"}
              aria-valuemin={0}
              aria-valuemax={isTimeAttack ? 60 : session.timeLimitSec}
              aria-valuenow={Number(
                ((isTimeAttack ? (sessionRemaining ?? 0) : liveRemaining) / 1000).toFixed(1),
              )}
              className="h-1.5 overflow-hidden bg-rule"
            >
              <div
                className={`h-full ${isTimeAttack ? "bg-ink" : timerTone(ratio)}`}
                style={{
                  width: `${
                    isTimeAttack
                      ? ((sessionRemaining ?? 0) / TIME_ATTACK_MS) * 100
                      : ratio * 100
                  }%`,
                }}
              />
            </div>
            <p
              data-testid="timer-status"
              className="min-h-4 text-[11px] leading-4 text-muted"
            >
              {isTimeAttack
                ? `正解 ${state.answers.filter((item) => item.outcome === "correct").length} 問`
                : showingExplanation
                  ? session.revealMode === "auto"
                    ? "停止中。まもなく自動で次へ進みます"
                    : session.mode === "confusable"
                      ? "停止中。2つの違いを確かめてから次へ"
                      : "停止中。解説を読んでから次へ"
                  : " "}
            </p>
          </div>
        </div>

        {/* 得点レール: 速く答えるほど増える点、解答秒数、連続正解の伸びを並べる。 */}
        <dl className="mt-2 grid grid-cols-4 divide-x divide-rule border-t border-rule pt-2">
          <div className="pr-2">
            <dt className="text-[10px] text-muted">得点</dt>
            <dd
              data-testid="running-score"
              className="instrument mt-0.5 text-lg font-semibold leading-none"
            >
              {formatPoints(runningScore)}
            </dd>
          </div>
          <div className="px-2">
            <dt className="text-[10px] text-muted">
              {showingExplanation ? "この1問" : "正解なら"}
            </dt>
            <dd
              data-testid="question-score"
              className={`instrument mt-0.5 text-lg font-semibold leading-none ${
                earned
                  ? earned.total > 0
                    ? "text-correct"
                    : "text-wrong"
                  : "text-ink"
              }`}
            >
              {earned
                ? earned.total > 0
                  ? `+${formatPoints(earned.total)}`
                  : "0"
                : formatPoints(potential?.total ?? 0)}
            </dd>
          </div>
          <div className="px-2">
            <dt className="text-[10px] text-muted">
              {showingExplanation ? "解答時間" : "経過"}
            </dt>
            <dd className="mt-0.5 flex items-baseline gap-1">
              <span
                data-testid="elapsed-seconds"
                className={`instrument text-lg font-semibold leading-none ${
                  isPersonalBest ? "text-correct" : "text-ink"
                }`}
              >
                {formatSeconds(elapsedMs)}
              </span>
              <span className="text-[10px] text-muted">秒</span>
            </dd>
          </div>
          <div className="pl-2">
            <dt className="text-[10px] text-muted">連続正解</dt>
            <dd className="mt-0.5 flex items-baseline gap-1">
              <span
                data-testid="combo-count"
                className={`instrument text-lg font-semibold leading-none ${
                  comboActive ? "text-correct" : "text-muted"
                }`}
              >
                {streakBefore}
              </span>
              <span className="text-[10px] text-muted">
                {comboAtMax ? "上限" : `+${COMBO_STEP}点/問`}
              </span>
            </dd>
          </div>
        </dl>

        {/* 初回だけ、得点の読み方を本編の1問目に重ねて伝える。閉じる操作は要らない。 */}
        {showOnboarding && state.index === 0 && !answer && (
          <p
            data-testid="onboarding-note"
            className="mt-2 border-l-2 border-l-ink bg-surface px-2 py-1.5 text-[11px] leading-relaxed text-ink-soft"
          >
            「正解なら」の数字は、いま答えると入る得点です。時間が経つほど減るので、
            早く押すほど高くなります。誤答すると連続正解が0に戻ります。
            <button
              type="button"
              onClick={markOnboarded}
              className="focus-ring ml-2 font-bold underline underline-offset-4"
            >
              わかった
            </button>
          </p>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* 標本ステージ: 画面で唯一明るい物体。 */}
        <section aria-label="UIデモ">
          {/* 誤答のときだけ枠ごと小さく揺らす。判子とは別の要素にして transform の競合を避ける。
              key は付けない。付けるとデモが作り直され、操作していた状態が消える。 */}
          <div className={answer && !answeredCorrectly ? "shake-sm" : undefined}>
            <div className="relative">
              <SpecimenFrame
                label={promptText ? "要件" : "操作できるデモ"}
                footer={
                  <p className="text-[11px] text-muted">
                    {session.mode === "confusable"
                      ? "どちらの名前か、見分けてください"
                      : session.mode === "reverse" || session.mode === "spaced"
                        ? "この要件に合うUIはどれか"
                        : session.mode === "keyboard"
                          ? "この操作に使うキーはどれか"
                          : "このUIの名前はどれか"}
                  </p>
                }
              >
                {promptText ? (
                  <div className="flex min-h-56 flex-col justify-center gap-3 sm:min-h-64">
                    <p className="text-base font-bold leading-relaxed sm:text-lg">
                      {promptText}
                    </p>
                    {answer ? (
                      <div className="border border-rule bg-surface p-2">
                        <DemoPanel key={question.questionId} demoType={questionData.demoType} />
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted">
                        答え合わせのあとに、該当するUIのデモが出ます。
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-56 flex-col justify-center sm:min-h-64">
                    <DemoPanel key={question.questionId} demoType={questionData.demoType} />
                  </div>
                )}
              </SpecimenFrame>

              {/* 判定の判子。標本の隅に押し、当たった手応えを残す。 */}
              {answer && (
                <div className="pointer-events-none absolute right-2 top-8 sm:right-4">
                  <Stamp
                    key={`stamp-${state.index}`}
                    tone={answeredCorrectly ? "correct" : timedOut ? "timeout" : "wrong"}
                    className="text-base"
                  >
                    {answeredCorrectly ? "正解" : timedOut ? "時間切れ" : "不正解"}
                  </Stamp>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 回答ブロック */}
        <section aria-label="選択肢" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] text-muted">
              {showingExplanation ? "選んだ答えと正解" : "4つから選ぶ（キー1〜4）"}
            </p>
            {speech.supported && (
              <button
                type="button"
                onClick={speech.listening ? speech.stop : speech.start}
                disabled={Boolean(answer)}
                className="focus-ring border border-rule-strong px-2 py-0.5 text-[11px] font-bold disabled:opacity-40"
                aria-pressed={speech.listening}
              >
                {speech.listening ? "聞き取り中…" : "声で答える"}
              </button>
            )}
          </div>
          {speech.error && (
            <p className="text-[11px] text-wrong">{speech.error}</p>
          )}
          {speech.transcript && (
            <p className="text-[11px] text-muted">聞き取り: 「{speech.transcript}」</p>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {question.choices.map((choiceId, index) => {
              const choice = getQuestion(choiceId);
              if (!choice) {
                return null;
              }
              const isCorrectChoice = choiceId === question.questionId;
              const isSelected = selected === choiceId;

              let tone = "border-rule-strong bg-surface hover:border-ink";
              let mark: string | null = null;
              let markColor = "text-muted";
              if (answer) {
                if (isCorrectChoice) {
                  tone = "border-correct bg-correct-soft";
                  mark = "正解";
                  markColor = "text-correct";
                } else if (isSelected) {
                  tone = "border-wrong bg-wrong-soft";
                  mark = "あなたの回答";
                  markColor = "text-wrong";
                } else {
                  tone = "border-rule bg-surface opacity-55";
                }
              }

              return (
                <button
                  key={choiceId}
                  type="button"
                  disabled={Boolean(answer)}
                  onClick={() => handleAnswer(choiceId)}
                  aria-label={`${index + 1}. ${choice.nameJa}`}
                  className={`focus-ring flex min-h-14 items-center gap-3 border px-3 py-2 text-left transition-colors disabled:cursor-default ${tone}`}
                >
                  <span
                    aria-hidden="true"
                    className="instrument w-5 shrink-0 text-xs font-semibold text-muted"
                  >
                    {CHOICE_KEYS[index]}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold leading-tight">
                      {choice.nameJa}
                    </span>
                    <span className="instrument block text-[11px] text-muted">
                      {choice.nameEn}
                    </span>
                  </span>
                  {mark && (
                    <span className={`shrink-0 text-[10px] font-bold ${markColor}`}>
                      {mark}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!showingExplanation && (
            <p className="text-[11px] text-muted">Enter / Space でも次へ進めます</p>
          )}
        </section>
      </div>

      {/* 判定と解説。回答後はここが主役になる。 */}
      {answer && (
        <section
          ref={revealRef}
          role="status"
          aria-live="assertive"
          className="mt-4 scroll-mt-2 border-t-2 border-ink pt-3"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p
              className={`instrument text-2xl font-semibold ${
                answeredCorrectly ? "text-correct" : "text-wrong"
              }`}
            >
              {answeredCorrectly ? "正解" : timedOut ? "時間切れ" : "不正解"}
            </p>
            <p className="text-sm font-bold">
              {questionData.nameJa}
              <span className="ml-2 text-xs font-medium text-muted">
                {questionData.nameEn}（{questionData.reading}）
              </span>
            </p>
          </div>
          <p className="mt-1 max-w-[42rem] text-xs leading-relaxed text-ink-soft">
            {questionData.description}
          </p>

          {/* 得点の内訳。なぜその点数になったかを、次の判断材料として見せる。 */}
          {earned && (
            <dl
              data-testid="score-breakdown"
              className="mt-2 flex max-w-[42rem] flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-rule py-1.5 text-[11px]"
            >
              <div className="flex items-baseline gap-1">
                <dt className="text-muted">基礎</dt>
                <dd className="instrument font-semibold">{earned.base}</dd>
              </div>
              <div className="flex items-baseline gap-1">
                <dt className="text-muted">速さ</dt>
                <dd
                  className={`instrument font-semibold ${
                    earned.speed > 0 ? "text-correct" : "text-muted"
                  }`}
                >
                  +{earned.speed}
                </dd>
              </div>
              <div className="flex items-baseline gap-1">
                <dt className="text-muted">連続</dt>
                <dd
                  className={`instrument font-semibold ${
                    earned.combo > 0 ? "text-correct" : "text-muted"
                  }`}
                >
                  +{earned.combo}
                </dd>
              </div>
              <div className="flex items-baseline gap-1">
                <dt className="text-muted">合計</dt>
                <dd
                  className={`instrument text-sm font-semibold ${
                    earned.total > 0 ? "text-correct" : "text-wrong"
                  }`}
                >
                  {earned.total > 0 ? `+${formatPoints(earned.total)}` : "0"}
                </dd>
              </div>
              {earned.total > 0 && earned.speed < 50 && (
                <p className="text-muted">次はもっと早く答えると速さの点が増えます</p>
              )}
              {earned.total > 0 && earned.combo >= COMBO_BONUS_MAX && (
                <p className="text-correct">連続正解のボーナスは上限です</p>
              )}
            </dl>
          )}

          {/* 解答時間の内訳。この1問と、ここまでの平均・最速を並べる。 */}
          {answer && (
            <dl
              data-testid="timing-breakdown"
              className="mt-1 flex max-w-[42rem] flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-rule py-1.5 text-[11px]"
            >
              <div className="flex items-baseline gap-1">
                <dt className="text-muted">この1問</dt>
                <dd
                  className={`instrument font-semibold ${
                    isPersonalBest ? "text-correct" : "text-ink"
                  }`}
                >
                  {formatSeconds(elapsedMs)}秒
                </dd>
              </div>
              {timing.correctCount > 0 && (
                <>
                  <div className="flex items-baseline gap-1">
                    <dt className="text-muted">正解の平均</dt>
                    <dd className="instrument font-semibold">
                      {formatSeconds(timing.averageMs)}秒
                    </dd>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <dt className="text-muted">正解の最速</dt>
                    <dd className="instrument font-semibold">
                      {formatSeconds(timing.fastestMs)}秒
                    </dd>
                  </div>
                </>
              )}
              {isPersonalBest && (
                <p className="font-bold text-correct">このセッションで最速です</p>
              )}
              {answeredCorrectly && !isPersonalBest && priorTiming.fastestMs !== null && elapsedMs - priorTiming.fastestMs >= 10 && (
                <p className="text-muted">
                  最速より {formatSeconds(elapsedMs - priorTiming.fastestMs)}秒 遅い
                </p>
              )}
            </dl>
          )}

          <div className="mt-3 flex max-w-[42rem] flex-wrap gap-2 [&>*]:min-w-[16rem] [&>*]:flex-1">
            <InstructionExample question={questionData} />
            <DistinctionNote
              question={questionData}
              compareWith={
                session.mode === "confusable" && selected && selected !== question.questionId
                  ? getQuestion(selected)
                  : undefined
              }
            />
          </div>

          <div className="mt-3 flex flex-col gap-1.5 border-t border-rule pt-2 sm:flex-row-reverse sm:items-center sm:justify-end sm:gap-4">
            <p className="text-[11px] text-muted">
              {autoRevealRemainingMs !== null
                ? `あと ${(autoRevealRemainingMs / 1000).toFixed(1)} 秒で次へ`
                : "Enter / Space でも次へ進めます"}
            </p>
            <button
              type="button"
              onClick={handleAdvance}
              data-testid="advance-button"
              className="focus-ring flex w-full items-baseline justify-between gap-3 bg-ink px-5 py-3 text-paper transition-colors hover:bg-ink-soft sm:w-auto sm:min-w-[14rem]"
            >
              <span className="text-sm font-bold">
                {isLastQuestion ? "結果を見る" : "次の問題へ"}
              </span>
              <span className="instrument text-[10px] text-paper/70">
                {isLastQuestion ? "集計" : `${session.timeLimitSec}s`}
              </span>
            </button>
          </div>
        </section>
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
