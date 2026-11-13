"use client";

import { useId, useState } from "react";
import { UiDemo } from "@/components/ui-demos";
import { DistinctionNote, InstructionExample, TermSummary } from "@/components/term-detail";
import { SpecimenFrame } from "@/components/ui-kit";
import type { Question } from "@/lib/questions";

/** 図鑑の1項目。デモは既定で閉じておき、開いたときだけ描画する。 */
export function TermCard({ question }: { question: Question }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className="border-b border-rule py-3">
      <TermSummary question={question} />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="focus-ring border border-rule-strong px-2.5 py-1 text-[11px] font-bold text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          {open ? "デモを閉じる" : "デモを開く"}
        </button>
        {!open && <span className="text-[11px] text-muted">実際に操作できます</span>}
      </div>

      <div id={panelId} hidden={!open} className="mt-2 space-y-2">
        <SpecimenFrame label="操作できるデモ">
          <div className="flex min-h-44 flex-col justify-center">
            <UiDemo demoType={question.demoType} />
          </div>
        </SpecimenFrame>
        <div className="mt-2 flex flex-wrap gap-2 [&>*]:min-w-[16rem] [&>*]:flex-1">
          <InstructionExample question={question} />
          <DistinctionNote question={question} />
        </div>
      </div>
    </article>
  );
}
