import {
  CATEGORY_LABELS,
  getConfusablePartners,
  getDistinction,
  getQuestion,
  type Question,
} from "@/lib/questions";

/** AIへの指示例。用語をそのまま使う一文として、コピーして使える形で見せる。 */
export function InstructionExample({
  question,
  className = "",
}: {
  question: Question;
  className?: string;
}) {
  return (
    <div className={`border border-ink bg-ink px-3 py-2 text-paper ${className}`}>
      <p className="text-[10px] font-bold text-paper/60">AIへの指示例</p>
      <p className="mt-1 text-xs leading-relaxed">「{question.exampleInstruction}」</p>
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
    <div className={`border border-rule-strong border-l-2 border-l-ink bg-surface px-3 py-2 ${className}`}>
      <p className="text-[10px] font-bold text-ink">呼び分けのコツ</p>
      <ul className="mt-1 space-y-1.5">
        {items.map(({ partner, distinction }) => (
          <li key={partner.id} className="text-xs leading-relaxed text-ink-soft">
            <span className="font-bold text-ink">
              {question.nameJa} と {partner.nameJa}
            </span>
            <span className="mt-0.5 block">{distinction}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 用語の読み・分類・説明。図鑑と結果画面で共用する。 */
export function TermSummary({ question }: { question: Question }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-base font-bold leading-tight">{question.nameJa}</h3>
        <span className="instrument text-[11px] text-muted">
          {question.nameEn}（{question.reading}）
        </span>
        <span className="border border-rule-strong px-1.5 py-px text-[10px] text-muted">
          {CATEGORY_LABELS[question.category]}
        </span>
      </div>
      <p className="mt-1 max-w-[38rem] text-sm leading-relaxed text-ink-soft">
        {question.description}
      </p>
    </div>
  );
}
