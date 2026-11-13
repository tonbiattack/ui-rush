"use client";

import { useId, useState } from "react";
import { UiDemo } from "@/components/ui-demos";
import { DistinctionNote, InstructionExample, TermSummary } from "@/components/term-detail";
import type { Question } from "@/lib/questions";

/** 図鑑の1項目。デモは既定で閉じておき、開いたときだけ描画する。 */
export function TermCard({ question }: { question: Question }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <TermSummary question={question} />

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="focus-ring mt-2 flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <span>{open ? "デモを閉じる" : "デモを開いて操作する"}</span>
        <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      <div id={panelId} hidden={!open} className="mt-2 space-y-2">
        <div className="min-h-60 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <UiDemo demoType={question.demoType} />
        </div>
        <InstructionExample question={question} />
        <DistinctionNote question={question} />
      </div>
    </article>
  );
}
