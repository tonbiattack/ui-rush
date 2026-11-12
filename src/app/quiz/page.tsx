import type { Metadata } from "next";
import { ClientOnly } from "@/components/client-only";
import { QuizClient } from "@/components/quiz-client";
import {
  DEFAULT_QUESTION_COUNT,
  DEFAULT_TIME_LIMIT_SEC,
  isQuestionCount,
  isQuizMode,
  isTimeLimitSec,
} from "@/lib/quiz";

export const metadata: Metadata = {
  title: "クイズ | UI Rush",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const rawTime = Number(first(params.time));
  const timeLimitSec = isTimeLimitSec(rawTime) ? rawTime : DEFAULT_TIME_LIMIT_SEC;

  const rawCount = Number(first(params.count));
  const questionCount = isQuestionCount(rawCount) ? rawCount : DEFAULT_QUESTION_COUNT;

  const rawMode = first(params.mode);
  const mode = isQuizMode(rawMode) ? rawMode : "normal";

  // 結果画面からは、そのセッションで間違えた問題IDをカンマ区切りで受け取る。
  const rawIds = first(params.ids);
  const reviewIds =
    mode === "review" && rawIds
      ? rawIds.split(",").map((id) => id.trim()).filter(Boolean)
      : undefined;

  return (
    <ClientOnly
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <p role="status" className="text-sm text-slate-500">
            問題を準備しています…
          </p>
        </main>
      }
    >
      <QuizClient
        questionCount={questionCount}
        timeLimitSec={timeLimitSec}
        mode={mode}
        reviewIds={reviewIds}
      />
    </ClientOnly>
  );
}
