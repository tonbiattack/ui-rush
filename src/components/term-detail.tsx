import {
  CATEGORY_LABELS,
  getConfusablePartners,
  getDistinction,
  getQuestion,
  type Question,
} from "@/lib/questions";

/** AIへの指示例。用語を実際に使う一文をそのまま真似できる形で見せる。 */
export function InstructionExample({
  question,
  className = "",
}: {
  question: Question;
  className?: string;
}) {
  return (
    <div className={`rounded-lg bg-slate-900 px-3 py-2 ${className}`}>
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span aria-hidden="true">🤖</span>
        AIへの指示例
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-100">
        「{question.exampleInstruction}」
      </p>
    </div>
  );
}

/** 呼び間違えやすい相手との違い。ペアが無ければ何も出さない。 */
export function DistinctionNote({
  question,
  compareWith,
  className = "",
}: {
  question: Question;
  /** 比較相手を固定したいとき（呼び分け特訓で使う）。省略時は登録済みのペアをすべて出す。 */
  compareWith?: Question;
  className?: string;
}) {
  const partners = compareWith
    ? [compareWith]
    : getConfusablePartners(question.id)
        .map((id) => getQuestion(id))
        .filter((partner): partner is Question => Boolean(partner));

  const items = partners
    .map((partner) => ({
      partner,
      distinction: getDistinction(question.id, partner.id),
    }))
    .filter(
      (item): item is { partner: Question; distinction: string } => Boolean(item.distinction),
    );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 ${className}`}>
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
        <span aria-hidden="true">⇄</span>
        呼び分けのコツ
      </p>
      <ul className="mt-1 space-y-1">
        {items.map(({ partner, distinction }) => (
          <li key={partner.id} className="text-xs leading-relaxed text-amber-950">
            <span className="font-bold">
              {question.nameJa} / {partner.nameJa}
            </span>
            ：{distinction}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 用語の読み・分類・説明をまとめた見出し。図鑑と結果画面で共用する。 */
export function TermSummary({ question }: { question: Question }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-base font-bold">{question.nameJa}</span>
        <span className="text-xs text-slate-500">
          {question.nameEn}（{question.reading}）
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          {CATEGORY_LABELS[question.category]}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{question.description}</p>
    </div>
  );
}
