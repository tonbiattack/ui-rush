import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientOnly } from "@/components/client-only";
import { QuizRoute } from "@/components/quiz-route";

export const metadata: Metadata = {
  title: "クイズ | UI Rush",
};

const fallback = (
  <main className="flex flex-1 items-center justify-center">
    <p role="status" className="text-sm text-muted">
      問題を準備しています…
    </p>
  </main>
);

export default function QuizPage() {
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <QuizRoute />
      </Suspense>
    </ClientOnly>
  );
}
