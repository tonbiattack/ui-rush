import type { Question } from "@/lib/questions";

export function QuestionDetail({ question }: { question: Question }) {
  return (
    <div className="space-y-1">
      <p className="text-base font-semibold sm:text-lg">{question.nameJa}</p>
      <p className="text-sm text-slate-600">
        {question.nameEn}（{question.reading}）
      </p>
      <p className="text-sm leading-relaxed text-slate-700">{question.description}</p>
    </div>
  );
}
