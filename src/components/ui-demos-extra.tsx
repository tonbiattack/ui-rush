"use client";

import { useEffect, useId, useState } from "react";
import { DemoFrame } from "@/components/ui-demos";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const inputClass =
  "focus-ring w-full rounded-sm border border-rule-strong bg-surface px-2 py-1.5 text-sm";

function ComboboxDemo() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const options = ["デザイン", "デザインシステム", "デザイン調査", "エンジニア", "エンジニアリング"];
  const filtered = options.filter((option) => option.includes(query));
  const id = useId();

  return (
    <DemoFrame hint="文字を打つと候補が絞り込まれます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          部署
        </label>
        <input
          id={id}
          role="combobox"
          aria-expanded={filtered.length > 0}
          aria-controls={`${id}-list`}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          placeholder="打ち込んで絞り込む"
          className={cx(inputClass, "mt-1")}
        />
        {filtered.length > 0 && (
          <ul id={`${id}-list`} role="listbox" className="mt-1 max-h-28 overflow-auto border border-rule">
            {filtered.map((option) => (
              <li key={option} role="option" aria-selected={selected === option}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(option);
                    setQuery(option);
                  }}
                  className="focus-ring block w-full px-2 py-1 text-left text-sm hover:bg-paper"
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[11px] text-muted">選択中: {selected ?? "なし"}</p>
      </div>
    </DemoFrame>
  );
}

function StepperDemo() {
  const [value, setValue] = useState(1);

  return (
    <DemoFrame hint="−と＋で1つずつ増減します">
      <div className="rounded-sm border border-rule bg-white p-4">
        <p className="text-xs font-bold text-ink-soft">チケット枚数</p>
        <div className="mt-2 inline-flex items-center border border-rule-strong">
          <button
            type="button"
            onClick={() => setValue((current) => Math.max(0, current - 1))}
            aria-label="1減らす"
            className="focus-ring px-3 py-1.5 text-sm font-bold hover:bg-paper"
          >
            −
          </button>
          <output className="w-10 border-x border-rule-strong py-1.5 text-center text-sm font-bold tabular-nums">
            {value}
          </output>
          <button
            type="button"
            onClick={() => setValue((current) => Math.min(9, current + 1))}
            aria-label="1増やす"
            className="focus-ring px-3 py-1.5 text-sm font-bold hover:bg-paper"
          >
            ＋
          </button>
        </div>
      </div>
    </DemoFrame>
  );
}

function ChipDemo() {
  const [chips, setChips] = useState(["デザイン", "モバイル", "2026年"]);
  const [added, setAdded] = useState(1);
  const available = ["Web", "API", "運用", "調査"];

  return (
    <DemoFrame hint="×で外せます。下の候補から追加もできます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1 border border-rule-strong bg-paper px-2 py-0.5 text-xs"
            >
              {chip}
              <button
                type="button"
                onClick={() => setChips((current) => current.filter((item) => item !== chip))}
                aria-label={`${chip}を外す`}
                className="focus-ring text-muted hover:text-wrong"
              >
                ×
              </button>
            </span>
          ))}
          {chips.length === 0 && <span className="text-xs text-muted">条件なし</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {available.map((option, index) => (
            <button
              key={option}
              type="button"
              disabled={chips.includes(option)}
              onClick={() => {
                setChips((current) => [...current, option]);
                setAdded((value) => value + index);
              }}
              className="focus-ring border border-rule-strong px-2 py-0.5 text-[11px] disabled:opacity-40"
            >
              ＋ {option}
            </button>
          ))}
        </div>
        <span className="sr-only">{added}回追加しました</span>
      </div>
    </DemoFrame>
  );
}

function BadgeDemo() {
  const [count, setCount] = useState(3);

  return (
    <DemoFrame hint="アイコンの右上に件数を重ねます">
      <div className="flex min-h-44 items-center justify-center rounded-sm border border-rule bg-white p-4">
        <div className="relative">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center border border-rule-strong text-lg"
          >
            🔔
          </span>
          {count > 0 && (
            <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-wrong px-1 text-center text-[10px] font-bold leading-5 text-paper">
              {count}
            </span>
          )}
          <span className="sr-only">未読{count}件</span>
        </div>
        <button
          type="button"
          onClick={() => setCount((value) => Math.max(0, value - 1))}
          className="focus-ring ml-6 border border-rule-strong px-2 py-1 text-xs"
        >
          1件既読にする
        </button>
      </div>
    </DemoFrame>
  );
}

function AvatarDemo() {
  const members = [
    { name: "佐藤", color: "bg-correct text-paper" },
    { name: "鈴木", color: "bg-ink text-paper" },
    { name: "高橋", color: "bg-timeout text-paper" },
  ];

  return (
    <DemoFrame hint="写真の代わりに頭文字を丸く出します">
      <ul className="space-y-2 rounded-sm border border-rule bg-white p-4">
        {members.map((member) => (
          <li key={member.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cx(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                member.color,
              )}
            >
              {member.name[0]}
            </span>
            <span className="text-sm">{member.name}さんがコメントしました</span>
          </li>
        ))}
      </ul>
    </DemoFrame>
  );
}

function SegmentedControlDemo() {
  const options = ["リスト", "グリッド"] as const;
  const [value, setValue] = useState<(typeof options)[number]>("リスト");

  return (
    <DemoFrame hint="横並びのボタンから1つだけ選べます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <div role="group" aria-label="表示形式" className="inline-flex border border-rule-strong">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              onClick={() => setValue(option)}
              className={cx(
                "focus-ring px-3 py-1.5 text-xs font-bold",
                value === option ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <div
          className={cx(
            "mt-3 gap-1.5",
            value === "リスト" ? "flex flex-col" : "grid grid-cols-3",
          )}
        >
          {[1, 2, 3].map((item) => (
            <div key={item} className="border border-rule bg-paper p-2 text-center text-xs">
              項目{item}
            </div>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

function TextfieldDemo() {
  const [value, setValue] = useState("");
  const id = useId();

  return (
    <DemoFrame hint="1行だけ入力できます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          氏名
        </label>
        <input
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="山田 太郎"
          className={cx(inputClass, "mt-1")}
        />
      </div>
    </DemoFrame>
  );
}

function TextareaDemo() {
  const [value, setValue] = useState("");
  const id = useId();

  return (
    <DemoFrame hint="改行しながら複数行を書けます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          問い合わせ内容
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={4}
          placeholder="3行まで書けます"
          className={cx(inputClass, "mt-1 resize-none")}
        />
        <p className="mt-1 text-[11px] text-muted">{value.split("\n").length}行・{value.length}文字</p>
      </div>
    </DemoFrame>
  );
}

function SearchFieldDemo() {
  const [query, setQuery] = useState("");
  const items = ["アコーディオン", "モーダル", "トースト", "タブ", "スライダー"];
  const filtered = items.filter((item) => item.includes(query));
  const id = useId();

  return (
    <DemoFrame hint="入力すると一覧が絞り込まれます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="sr-only">
          検索
        </label>
        <div className="flex items-center gap-1.5 border border-rule-strong px-2">
          <span aria-hidden="true" className="text-muted">
            ⌕
          </span>
          <input
            id={id}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="用語を検索"
            className="w-full bg-transparent py-1.5 text-sm outline-none"
          />
        </div>
        <ul className="mt-2 space-y-1 text-sm">
          {filtered.length > 0 ? (
            filtered.map((item) => <li key={item}>{item}</li>)
          ) : (
            <li className="text-muted">該当なし</li>
          )}
        </ul>
      </div>
    </DemoFrame>
  );
}

function DatepickerDemo() {
  const [day, setDay] = useState(15);
  const days = Array.from({ length: 30 }, (_, index) => index + 1);

  return (
    <DemoFrame hint="カレンダーから日付を選べます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <p className="text-xs font-bold text-ink-soft">2026年11月</p>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px]">
          {days.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={day === value}
              onClick={() => setDay(value)}
              className={cx(
                "focus-ring py-1",
                day === value ? "bg-ink text-paper" : "hover:bg-paper",
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">選択中: 11月{day}日</p>
      </div>
    </DemoFrame>
  );
}

function RatingDemo() {
  const [value, setValue] = useState(0);

  return (
    <DemoFrame hint="星を押すと評価が決まります">
      <div className="rounded-sm border border-rule bg-white p-4">
        <div className="flex items-center gap-1" role="group" aria-label="5段階評価">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star}つ星`}
              aria-pressed={value >= star}
              onClick={() => setValue(star)}
              className={cx(
                "focus-ring text-2xl leading-none",
                value >= star ? "text-timeout" : "text-rule-strong",
              )}
            >
              ★
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {value === 0 ? "まだ評価していません" : `${value} / 5`}
        </p>
      </div>
    </DemoFrame>
  );
}

function DropzoneDemo() {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <DemoFrame hint="枠内にファイルを落とすか、押して選びます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label
          className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-rule-strong bg-paper p-4 text-center hover:border-ink"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) {
              setFileName(file.name);
            }
          }}
        >
          <input
            type="file"
            className="sr-only"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
          />
          <span className="text-sm font-bold">ここにファイルを落とす</span>
          <span className="text-[11px] text-muted">または押して選ぶ</span>
        </label>
        <p className="mt-2 text-[11px] text-muted">
          {fileName ? `選択中: ${fileName}` : "まだ選ばれていません"}
        </p>
      </div>
    </DemoFrame>
  );
}

function TableDemo() {
  const rows = [
    { id: "INV-001", amount: 12000, status: "入金済み" },
    { id: "INV-002", amount: 8400, status: "未入金" },
    { id: "INV-003", amount: 32000, status: "入金済み" },
  ];

  return (
    <DemoFrame hint="見出し付きで行と列に並びます">
      <div className="overflow-x-auto rounded-sm border border-rule bg-white">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">請求書の一覧</caption>
          <thead className="border-b border-rule-strong bg-paper">
            <tr>
              <th scope="col" className="px-2 py-1.5 font-bold">番号</th>
              <th scope="col" className="px-2 py-1.5 text-right font-bold">金額</th>
              <th scope="col" className="px-2 py-1.5 font-bold">状態</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-rule last:border-b-0">
                <td className="px-2 py-1.5">{row.id}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {row.amount.toLocaleString()}円
                </td>
                <td className="px-2 py-1.5">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}

function CardDemo() {
  const [saved, setSaved] = useState<string[]>([]);

  return (
    <DemoFrame hint="画像と見出しをひとかたまりに並べます">
      <ul className="grid grid-cols-2 gap-2 rounded-sm border border-rule bg-white p-3">
        {["デザインの基礎", "余白の考え方"].map((title) => (
          <li key={title} className="border border-rule">
            <div className="h-12 bg-paper" aria-hidden="true" />
            <div className="p-2">
              <p className="text-xs font-bold leading-tight">{title}</p>
              <button
                type="button"
                onClick={() =>
                  setSaved((current) =>
                    current.includes(title)
                      ? current.filter((item) => item !== title)
                      : [...current, title],
                  )
                }
                aria-pressed={saved.includes(title)}
                className="focus-ring mt-1 text-[11px] underline underline-offset-2"
              >
                {saved.includes(title) ? "保存済み" : "保存する"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </DemoFrame>
  );
}

function NavbarDemo() {
  return (
    <DemoFrame hint="画面上部に固定される横帯です">
      <div className="rounded-sm border border-rule bg-white">
        <nav aria-label="サンプル" className="flex items-center justify-between gap-2 border-b border-rule px-3 py-2">
          <span className="text-sm font-bold">Acme</span>
          <div className="flex gap-3 text-[11px]">
            {["製品", "料金", "会社"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </nav>
        <div className="space-y-1 p-3">
          <div className="h-2 w-2/3 bg-paper" />
          <div className="h-2 w-full bg-paper" />
          <div className="h-2 w-1/2 bg-paper" />
        </div>
      </div>
    </DemoFrame>
  );
}

function SidebarDemo() {
  const [active, setActive] = useState("概要");
  const menu = ["概要", "メンバー", "請求", "設定"];

  return (
    <DemoFrame hint="画面の横に階層メニューを置きます">
      <div className="flex min-h-40 rounded-sm border border-rule bg-white">
        <nav aria-label="サンプル" className="w-28 border-r border-rule p-2">
          <ul className="space-y-0.5">
            {menu.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  aria-current={active === item ? "page" : undefined}
                  onClick={() => setActive(item)}
                  className={cx(
                    "focus-ring block w-full px-1.5 py-1 text-left text-xs",
                    active === item ? "bg-ink text-paper" : "hover:bg-paper",
                  )}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1 p-3">
          <p className="text-xs font-bold">{active}の内容</p>
          <div className="mt-2 space-y-1">
            <div className="h-2 w-full bg-paper" />
            <div className="h-2 w-4/5 bg-paper" />
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

function BannerDemo() {
  const [visible, setVisible] = useState(true);

  return (
    <DemoFrame hint="閉じるまで残る告知です">
      <div className="rounded-sm border border-rule bg-white">
        {visible ? (
          <div className="flex items-center justify-between gap-2 border-b border-ink bg-ink px-3 py-2 text-paper">
            <p className="text-[11px]">無料トライアルは今月末まで</p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="告知を閉じる"
              className="focus-ring text-[11px] underline underline-offset-2"
            >
              閉じる
            </button>
          </div>
        ) : (
          <div className="border-b border-rule px-3 py-2">
            <button
              type="button"
              onClick={() => setVisible(true)}
              className="focus-ring text-[11px] underline underline-offset-2"
            >
              告知をもう一度出す
            </button>
          </div>
        )}
        <div className="space-y-1 p-3">
          <div className="h-2 w-2/3 bg-paper" />
          <div className="h-2 w-full bg-paper" />
        </div>
      </div>
    </DemoFrame>
  );
}

function AlertDemo() {
  const [variant, setVariant] = useState<"error" | "success" | "info">("error");

  return (
    <DemoFrame hint="重要度は色と記号の両方で示します">
      <div className="rounded-sm border border-rule bg-white p-4">
        <div
          role="alert"
          className={cx(
            "border-l-2 px-2 py-1.5 text-xs",
            variant === "error" && "border-wrong bg-wrong-soft text-wrong",
            variant === "success" && "border-correct bg-correct-soft text-correct",
            variant === "info" && "border-ink bg-paper text-ink-soft",
          )}
        >
          <span className="font-bold">
            {variant === "error" ? "!" : variant === "success" ? "✓" : "i"}
          </span>{" "}
          {variant === "error"
            ? "送信できませんでした。通信状況を確認してください。"
            : variant === "success"
              ? "送信しました。"
              : "入力内容は自動で保存されます。"}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["error", "success", "info"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={variant === item}
              onClick={() => setVariant(item)}
              className={cx(
                "focus-ring border px-2 py-0.5 text-[11px]",
                variant === item ? "border-ink bg-ink text-paper" : "border-rule-strong",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

function EmptyStateDemo() {
  const [items, setItems] = useState<string[]>([]);

  return (
    <DemoFrame hint="0件のときに次の操作を案内します">
      <div className="rounded-sm border border-rule bg-white p-4">
        {items.length === 0 ? (
          <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center">
            <span aria-hidden="true" className="text-2xl text-rule-strong">
              ▢
            </span>
            <p className="text-xs text-muted">保存した記事はまだありません</p>
            <button
              type="button"
              onClick={() => setItems(["新しい記事"])}
              className="focus-ring bg-ink px-3 py-1 text-xs font-bold text-paper"
            >
              記事を書く
            </button>
          </div>
        ) : (
          <div>
            <ul className="space-y-1 text-sm">
              {items.map((item) => (
                <li key={item} className="border-b border-rule pb-1">
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setItems([])}
              className="focus-ring mt-2 text-[11px] underline underline-offset-2"
            >
              すべて消す
            </button>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function SpinnerDemo() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <DemoFrame hint="処理中であることだけを示します">
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-sm border border-rule bg-white p-4">
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-ink"
            />
            <p role="status" className="text-xs text-muted">
              読み込み中
            </p>
          </>
        ) : (
          <p className="text-xs">読み込みが終わりました</p>
        )}
        <button
          type="button"
          onClick={() => setLoading(true)}
          className="focus-ring border border-rule-strong px-2 py-1 text-[11px]"
        >
          もう一度読み込む
        </button>
      </div>
    </DemoFrame>
  );
}

function ToggleButtonDemo() {
  const [active, setActive] = useState(false);

  return (
    <DemoFrame hint="押すたびにオン・オフが切り替わります">
      <div className="rounded-sm border border-rule bg-white p-4">
        <button
          type="button"
          aria-pressed={active}
          onClick={() => setActive((value) => !value)}
          className={cx(
            "focus-ring border px-3 py-1.5 text-sm font-bold",
            active ? "border-ink bg-ink text-paper" : "border-rule-strong",
          )}
        >
          B
        </button>
        <p className="mt-2 text-[11px] text-muted">
          太字: {active ? "オン" : "オフ"}
        </p>
        <p className={cx("mt-1 text-sm", active && "font-bold")}>この文章の書式が変わります</p>
      </div>
    </DemoFrame>
  );
}

function ProgressRingDemo() {
  const [value, setValue] = useState(35);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  return (
    <DemoFrame hint="円弧の長さで進み具合を示します">
      <div className="flex min-h-40 items-center justify-center gap-4 rounded-sm border border-rule bg-white p-4">
        <svg width="56" height="56" viewBox="0 0 56 56" role="img" aria-label={`進捗${value}%`}>
          <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--color-rule)" strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
            transform="rotate(-90 28 28)"
          />
        </svg>
        <div>
          <p className="text-sm font-bold tabular-nums">{value}%</p>
          <button
            type="button"
            onClick={() => setValue((current) => (current >= 100 ? 0 : current + 20))}
            className="focus-ring mt-1 border border-rule-strong px-2 py-0.5 text-[11px]"
          >
            +20%
          </button>
        </div>
      </div>
    </DemoFrame>
  );
}

function ContextMenuDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  return (
    <DemoFrame hint="右クリックした位置にメニューが開きます">
      <div
        className="relative flex min-h-40 items-center justify-center rounded-sm border border-rule bg-white p-4"
        onContextMenu={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        <p className="text-xs text-muted">このあたりで右クリック</p>
        {open && (
          <div
            role="menu"
            className="absolute left-1/2 top-1/2 z-10 w-32 -translate-x-1/4 border border-rule-strong bg-surface py-0.5 shadow-[0_10px_28px_-12px_rgba(22,25,26,0.45)]"
          >
            {["開く", "名前を変更", "削除"].map((item) => (
              <button
                key={item}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLast(item);
                  setOpen(false);
                }}
                className={cx(
                  "focus-ring block w-full px-2 py-1 text-left text-xs hover:bg-paper",
                  item === "削除" && "text-wrong",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        {last && <span className="sr-only">{last}を選びました</span>}
      </div>
    </DemoFrame>
  );
}

function SplitButtonDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("保存");

  return (
    <DemoFrame hint="主操作と、右端の矢印で開く派生メニューに分かれます">
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-sm border border-rule bg-white p-4">
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={() => setLast("保存")}
            className="focus-ring bg-ink px-3 py-1.5 text-xs font-bold text-paper"
          >
            保存
          </button>
          <button
            type="button"
            aria-label="保存のその他の方法"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="focus-ring border-l border-paper/30 bg-ink px-2 py-1.5 text-xs text-paper"
          >
            ▾
          </button>
          {open && (
            <div className="absolute left-0 top-full z-10 mt-0.5 w-40 border border-rule-strong bg-surface py-0.5 shadow-[0_10px_28px_-12px_rgba(22,25,26,0.45)]">
              {["名前を付けて保存", "テンプレートとして保存"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setLast(item);
                    setOpen(false);
                  }}
                  className="focus-ring block w-full px-2 py-1 text-left text-xs hover:bg-paper"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted">直近の操作: {last}</p>
      </div>
    </DemoFrame>
  );
}

function FabDemo() {
  const [count, setCount] = useState(0);

  return (
    <DemoFrame hint="画面の隅に浮かせて置く主操作です">
      <div className="relative min-h-40 rounded-sm border border-rule bg-white p-4">
        <p className="text-xs text-muted">メモ {count}件</p>
        <button
          type="button"
          onClick={() => setCount((value) => value + 1)}
          aria-label="新しいメモを作成"
          className="focus-ring absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-xl text-paper shadow-[0_10px_28px_-12px_rgba(22,25,26,0.45)]"
        >
          ＋
        </button>
      </div>
    </DemoFrame>
  );
}

function RichTextDemo() {
  const [bold, setBold] = useState(false);
  const [heading, setHeading] = useState(false);

  return (
    <DemoFrame hint="書式を付けたままの見た目で編集します">
      <div className="rounded-sm border border-rule bg-white">
        <div className="flex gap-1 border-b border-rule p-1">
          {[
            { label: "B", active: bold, toggle: () => setBold((value) => !value), name: "太字" },
            { label: "H", active: heading, toggle: () => setHeading((value) => !value), name: "見出し" },
          ].map((tool) => (
            <button
              key={tool.name}
              type="button"
              aria-label={tool.name}
              aria-pressed={tool.active}
              onClick={tool.toggle}
              className={cx(
                "focus-ring border px-2 py-0.5 text-xs font-bold",
                tool.active ? "border-ink bg-ink text-paper" : "border-rule-strong",
              )}
            >
              {tool.label}
            </button>
          ))}
        </div>
        <p
          className={cx(
            "p-3",
            heading ? "text-base font-bold" : "text-sm",
            bold && "font-bold",
          )}
        >
          この文章の見た目が、上のボタンで変わります。
        </p>
      </div>
    </DemoFrame>
  );
}

function ColorPickerDemo() {
  const colors = ["#16191a", "#0f6b55", "#a8261d", "#7d5800", "#4b5563"];
  const [selected, setSelected] = useState(colors[0]);

  return (
    <DemoFrame hint="色見本から1つ選びます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <div className="flex gap-1.5">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={selected === color}
              onClick={() => setSelected(color)}
              style={{ backgroundColor: color }}
              className={cx(
                "focus-ring h-7 w-7 border",
                selected === color ? "border-ink ring-2 ring-ink ring-offset-1" : "border-rule",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">選択中: {selected}</p>
        <p className="mt-1 text-sm" style={{ color: selected }}>
          この文字の色が変わります
        </p>
      </div>
    </DemoFrame>
  );
}

function TimelineDemo() {
  const events = [
    { time: "10:02", label: "注文を受け付けました" },
    { time: "10:30", label: "発送しました" },
    { time: "11:15", label: "配達中です" },
  ];

  return (
    <DemoFrame hint="出来事を時系列に、点と線でつなぎます">
      <ol className="rounded-sm border border-rule bg-white p-4">
        {events.map((event, index) => (
          <li key={event.time} className="relative flex gap-2 pb-3 last:pb-0">
            {index < events.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[3px] top-3 h-full w-px bg-rule-strong"
              />
            )}
            <span
              aria-hidden="true"
              className="relative mt-1 h-2 w-2 shrink-0 rounded-full bg-ink"
            />
            <div>
              <p className="text-[11px] text-muted tabular-nums">{event.time}</p>
              <p className="text-xs">{event.label}</p>
            </div>
          </li>
        ))}
      </ol>
    </DemoFrame>
  );
}

function TabBarDemo() {
  const tabs = [
    { id: "home", label: "ホーム", icon: "⌂" },
    { id: "search", label: "検索", icon: "⌕" },
    { id: "settings", label: "設定", icon: "⚙" },
  ];
  const [active, setActive] = useState("home");

  return (
    <DemoFrame hint="画面下に固定し、主要画面を切り替えます">
      <div className="rounded-sm border border-rule bg-white">
        <div className="p-4 text-xs">
          <p className="font-bold">{tabs.find((tab) => tab.id === active)?.label}</p>
          <div className="mt-2 space-y-1">
            <div className="h-2 w-3/4 bg-paper" />
            <div className="h-2 w-full bg-paper" />
          </div>
        </div>
        <div className="flex border-t border-rule">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={active === tab.id ? "page" : undefined}
              onClick={() => setActive(tab.id)}
              className={cx(
                "focus-ring flex-1 py-1.5 text-[11px]",
                active === tab.id ? "font-bold text-ink" : "text-muted",
              )}
            >
              <span aria-hidden="true" className="block text-base leading-none">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

function InlineEditDemo() {
  const [title, setTitle] = useState("請求書を送る");
  const [editing, setEditing] = useState(false);

  return (
    <DemoFrame hint="その場で編集できます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <p className="text-xs text-muted">タスク名</p>
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setEditing(false);
              }
            }}
            className={cx(inputClass, "mt-1")}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="focus-ring mt-1 w-full border border-transparent px-2 py-1 text-left text-sm hover:border-rule-strong"
          >
            {title}
          </button>
        )}
        <p className="mt-2 text-[11px] text-muted">
          {editing ? "Enterで確定します" : "押すとその場で編集できます"}
        </p>
      </div>
    </DemoFrame>
  );
}

const KEY_HINTS: Record<string, { label: string; keys: string[]; note: string }> = {
  escape: { label: "モーダルを閉じる", keys: ["Esc"], note: "開いているものを閉じる" },
  tab: { label: "次の入力欄へ", keys: ["Tab"], note: "フォーカスを前へ進める" },
  "shift-tab": { label: "前の入力欄へ", keys: ["Shift", "Tab"], note: "Tabと逆方向へ戻る" },
  enter: { label: "検索を実行", keys: ["Enter"], note: "確定・送信する" },
  space: { label: "チェックを切り替え", keys: ["Space"], note: "押下の切り替え" },
  "arrow-ud": { label: "項目を上下に選ぶ", keys: ["↑", "↓"], note: "リスト内の移動" },
  "arrow-lr": { label: "タブを左右に切り替え", keys: ["←", "→"], note: "並びの移動" },
  home: { label: "先頭へ戻る", keys: ["Home"], note: "リストの先頭" },
  end: { label: "末尾へ進む", keys: ["End"], note: "リストの末尾" },
  "command-k": { label: "コマンド検索を開く", keys: ["Ctrl", "K"], note: "どこからでも検索" },
};

function KeyDemo({ variant = "escape" }: { variant?: keyof typeof KEY_HINTS }) {
  const hints = KEY_HINTS[variant] ?? KEY_HINTS.escape;

  return (
    <DemoFrame hint="キーを押すと動作を確かめられます">
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-sm border border-rule bg-white p-4">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {hints.keys.map((key) => (
            <kbd
              key={key}
              className="border border-rule-strong bg-paper px-2 py-1 text-xs font-bold shadow-[inset_0_-2px_0_var(--color-rule-strong)]"
            >
              {key}
            </kbd>
          ))}
        </div>
        <p className="text-xs font-bold">{hints.label}</p>
        <p className="text-[11px] text-muted">{hints.note}</p>
      </div>
    </DemoFrame>
  );
}

const keyDemo = (variant: keyof typeof KEY_HINTS) => {
  const Demo = () => <KeyDemo variant={variant} />;
  return Demo;
};

export const EXTRA_DEMOS: Record<string, () => React.JSX.Element> = {
  combobox: ComboboxDemo,
  stepper: StepperDemo,
  chip: ChipDemo,
  badge: BadgeDemo,
  avatar: AvatarDemo,
  segmentedcontrol: SegmentedControlDemo,
  textfield: TextfieldDemo,
  textarea: TextareaDemo,
  searchfield: SearchFieldDemo,
  datepicker: DatepickerDemo,
  rating: RatingDemo,
  dropzone: DropzoneDemo,
  table: TableDemo,
  card: CardDemo,
  navbar: NavbarDemo,
  sidebar: SidebarDemo,
  banner: BannerDemo,
  alert: AlertDemo,
  emptystate: EmptyStateDemo,
  spinner: SpinnerDemo,
  togglebutton: ToggleButtonDemo,
  progressring: ProgressRingDemo,
  contextmenu: ContextMenuDemo,
  splitbutton: SplitButtonDemo,
  fab: FabDemo,
  richtext: RichTextDemo,
  colorpicker: ColorPickerDemo,
  timeline: TimelineDemo,
  tabbar: TabBarDemo,
  inlineedit: InlineEditDemo,
  "key-escape": keyDemo("escape"),
  "key-tab": keyDemo("tab"),
  "key-shift-tab": keyDemo("shift-tab"),
  "key-enter": keyDemo("enter"),
  "key-space": keyDemo("space"),
  "key-arrow-ud": keyDemo("arrow-ud"),
  "key-arrow-lr": keyDemo("arrow-lr"),
  "key-home": keyDemo("home"),
  "key-end": keyDemo("end"),
  "key-command-k": keyDemo("command-k"),
};
