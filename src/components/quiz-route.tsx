"use client";

import { useSearchParams } from "next/navigation";
import { QuizClient } from "@/components/quiz-client";
import { SpotlightClient } from "@/components/spotlight-client";
import {
  DEFAULT_QUESTION_COUNT,
  DEFAULT_TIME_LIMIT_SEC,
  isQuestionCount,
  isQuizMode,
  isRevealMode,
  isTimeLimitSec,
} from "@/lib/quiz";

/**
 * クイズの入口。クエリをクライアントで読むことで、静的書き出し（GitHub Pages等）でも動く。
 * サーバー側の書き出し時には Suspense のフォールバックが表示される。
 */
export function QuizRoute() {
  const params = useSearchParams();

  const rawTime = Number(params.get("time"));
  const timeLimitSec = isTimeLimitSec(rawTime) ? rawTime : DEFAULT_TIME_LIMIT_SEC;

  const rawCount = Number(params.get("count"));
  const questionCount = isQuestionCount(rawCount) ? rawCount : DEFAULT_QUESTION_COUNT;

  const rawMode = params.get("mode");
  const mode = isQuizMode(rawMode) ? rawMode : "normal";

  const rawReveal = params.get("reveal");
  const revealMode = isRevealMode(rawReveal) ? rawReveal : "manual";

  // 結果画面・ホームから、出題対象の問題IDをカンマ区切りで受け取る。
  const rawIds = params.get("ids");
  const reviewIds = rawIds
    ? rawIds.split(",").map((id) => id.trim()).filter(Boolean)
    : undefined;

  if (mode === "spotlight") {
    return <SpotlightClient timeLimitSec={timeLimitSec} />;
  }

  return (
    <QuizClient
      questionCount={questionCount}
      timeLimitSec={timeLimitSec}
      mode={mode}
      revealMode={revealMode}
      reviewIds={reviewIds}
    />
  );
}
