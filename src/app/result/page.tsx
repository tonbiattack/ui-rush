import type { Metadata } from "next";
import { ClientOnly } from "@/components/client-only";
import { ResultClient } from "@/components/result-client";

export const metadata: Metadata = {
  title: "結果 | UI Rush",
};

export default function ResultPage() {
  return (
    <ClientOnly
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <p role="status" className="text-sm text-slate-500">
            結果を読み込んでいます…
          </p>
        </main>
      }
    >
      <ResultClient />
    </ClientOnly>
  );
}
