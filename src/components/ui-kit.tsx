import Link from "next/link";

/** 全画面共通の上端。細い罫線と、計器風の小さな数字だけで構成する。 */
export function Masthead({ right }: { right?: React.ReactNode }) {
  return (
    <header className="mb-6 flex items-baseline justify-between gap-3 border-b border-ink pb-2">
      <Link prefetch={false} href="/" className="focus-ring flex items-baseline gap-2">
        <span className="instrument text-xl font-semibold tracking-tight">UI RUSH</span>
      </Link>
      {right ? <div className="text-[11px] text-muted">{right}</div> : null}
    </header>
  );
}

/** 節の見出し。大文字ラベルではなく、日本語の短い名詞＋細い罫線。 */
export function SectionHead({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-rule pb-1">
      <h2 className="text-sm font-bold">{title}</h2>
      {action ?? (note ? <p className="text-[11px] text-muted">{note}</p> : null)}
    </div>
  );
}

/** 仕様表の1行。左にラベル、右に操作。 */
export function SpecRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-center gap-x-3 gap-y-1 border-b border-rule py-3 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-x-4">
      <div>
        <p className="text-sm font-bold leading-tight">{label}</p>
        {hint ? <p className="mt-0.5 text-[10px] leading-snug text-muted">{hint}</p> : null}
      </div>
      <div className="max-w-[34rem]">{children}</div>
    </div>
  );
}

/** 押せる選択肢。角丸カードではなく、枠線と反転で状態を表す。 */
export function ChoiceTile({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`focus-ring flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap border px-2 py-2 text-[13px] font-bold transition-colors sm:px-3 sm:text-sm ${
        selected
          ? "border-ink bg-ink text-paper"
          : "border-rule-strong bg-surface text-ink-soft hover:border-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** 標本枠。デモだけが画面で一番明るい物体になるよう、細い罫線と四隅の目盛りで囲う。 */
export function SpecimenFrame({
  label,
  children,
  footer,
}: {
  label: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative border border-rule-strong bg-surface">
      <span aria-hidden="true" className="absolute -left-px -top-px h-2 w-2 border-l border-t border-ink" />
      <span aria-hidden="true" className="absolute -right-px -top-px h-2 w-2 border-r border-t border-ink" />
      <span aria-hidden="true" className="absolute -bottom-px -left-px h-2 w-2 border-b border-l border-ink" />
      <span aria-hidden="true" className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-ink" />
      <p className="border-b border-rule px-3 py-1 text-[10px] font-medium tracking-wide text-muted">
        {label}
      </p>      <div className="bg-paper p-3 sm:p-4">{children}</div>
      {footer ? <div className="border-t border-rule px-3 py-1.5">{footer}</div> : null}
    </div>
  );
}

/** 大きな数字。設定値・スコアなど「計器」として見せたい数に使う。 */
export function Figure({
  value,
  unit,
  size = "lg",
}: {
  value: string | number;
  unit?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span className="instrument inline-flex items-baseline gap-1">
      <span className={size === "lg" ? "text-4xl font-semibold leading-none" : "text-xl font-semibold leading-none"}>
        {value}
      </span>
      {unit ? <span className="text-xs font-medium text-muted">{unit}</span> : null}
    </span>
  );
}
