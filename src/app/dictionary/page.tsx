import type { Metadata } from "next";
import { ClientOnly } from "@/components/client-only";
import { DictionaryClient } from "@/components/dictionary-client";

export const metadata: Metadata = {
  title: "用語と別名 | UI Rush",
};

export default function DictionaryPage() {
  return (
    <ClientOnly
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <p role="status" className="text-sm text-muted">
            用語を読み込んでいます…
          </p>
        </main>
      }
    >
      <DictionaryClient />
    </ClientOnly>
  );
}
