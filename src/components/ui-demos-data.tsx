"use client";

import { Fragment, useEffect, useId, useState } from "react";
import { DemoFrame } from "@/components/ui-demos";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

/** 標本の内側。角丸と影は使わず、罫線だけで区切る。 */
const panelClass = "border border-rule bg-surface p-3";

/* ------------------------------------------------------------------ */
/* 階層の開閉                                                          */
/* ------------------------------------------------------------------ */

type TreeNode = { id: string; label: string; children?: TreeNode[] };

const TREE: TreeNode[] = [
  {
    id: "docs",
    label: "資料",
    children: [
      { id: "plan", label: "企画書.pdf" },
      { id: "budget", label: "予算.xlsx" },
      {
        id: "old",
        label: "旧版",
        children: [
          { id: "old-plan", label: "企画書_v1.pdf" },
          { id: "old-budget", label: "予算_v1.xlsx" },
        ],
      },
    ],
  },
  {
    id: "images",
    label: "画像",
    children: [
      { id: "logo", label: "ロゴ.svg" },
      { id: "shot", label: "画面.png" },
    ],
  },
];

function TreeBranch({
  node,
  depth,
  expanded,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  expanded: string[];
  onToggle: (id: string) => void;
}) {
  const children = node.children ?? [];
  const open = expanded.includes(node.id);

  return (
    <li>
      <div className="flex items-center gap-1" style={{ paddingLeft: depth * 14 }}>
        {children.length > 0 ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${node.label}を${open ? "閉じる" : "開く"}`}
            onClick={() => onToggle(node.id)}
            className="focus-ring flex h-4 w-4 shrink-0 items-center justify-center border border-rule-strong text-[9px] leading-none"
          >
            {open ? "−" : "＋"}
          </button>
        ) : (
          <span aria-hidden="true" className="h-4 w-4 shrink-0" />
        )}
        <span className={cx("text-xs", children.length > 0 ? "font-bold" : "text-ink-soft")}>
          {node.label}
        </span>
      </div>
      {children.length > 0 && open && (
        <ul className="mt-0.5 space-y-0.5">
          {children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TreeViewDemo() {
  const [expanded, setExpanded] = useState<string[]>(["docs"]);

  return (
    <DemoFrame hint="＋と−で中を開閉できます">
      <div className={panelClass}>
        <ul className="space-y-0.5">
          {TREE.map((node) => (
            <TreeBranch
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={(id) =>
                setExpanded((current) =>
                  current.includes(id)
                    ? current.filter((value) => value !== id)
                    : [...current, id],
                )
              }
            />
          ))}
        </ul>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 並べ替えと行選択のある表                                            */
/* ------------------------------------------------------------------ */

const GRID_ROWS = [
  { id: "A-01", name: "ノート", qty: 12, price: 2400 },
  { id: "A-02", name: "ペン", qty: 40, price: 1600 },
  { id: "A-03", name: "ファイル", qty: 7, price: 980 },
  { id: "A-04", name: "はさみ", qty: 21, price: 3150 },
];

type GridKey = "name" | "qty" | "price";

function DataGridDemo() {
  const [sort, setSort] = useState<{ key: GridKey; asc: boolean }>({ key: "qty", asc: false });
  const [picked, setPicked] = useState<string[]>([]);

  const sorted = [...GRID_ROWS].sort((left, right) => {
    const a = left[sort.key];
    const b = right[sort.key];
    const diff =
      typeof a === "number" && typeof b === "number"
        ? a - b
        : String(a).localeCompare(String(b), "ja");
    return sort.asc ? diff : -diff;
  });

  const toggleSort = (key: GridKey) =>
    setSort((current) =>
      current.key === key ? { key, asc: !current.asc } : { key, asc: true },
    );

  const toggleRow = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const columns: Array<{ key: GridKey; label: string; align: string }> = [
    { key: "name", label: "品名", align: "text-left" },
    { key: "qty", label: "数量", align: "text-right" },
    { key: "price", label: "金額", align: "text-right" },
  ];

  return (
    <DemoFrame hint="見出しで並べ替え、行を押すと選択できます">
      <div className="border border-rule bg-surface">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">商品の一覧</caption>
          <thead className="border-b border-rule-strong bg-paper">
            <tr>
              <th scope="col" className="w-6 px-1 py-1" />
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sort.key === column.key ? (sort.asc ? "ascending" : "descending") : "none"
                  }
                  className={cx("px-1 py-1 font-bold", column.align)}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="focus-ring inline-flex items-center gap-0.5"
                  >
                    {column.label}
                    <span aria-hidden="true" className="text-[8px] text-muted">
                      {sort.key === column.key ? (sort.asc ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const selected = picked.includes(row.id);
              return (
                <tr
                  key={row.id}
                  onClick={() => toggleRow(row.id)}
                  className={cx(
                    "cursor-pointer border-b border-rule last:border-b-0",
                    selected ? "bg-paper" : "hover:bg-paper",
                  )}
                >
                  <td className="px-1 py-1">
                    <button
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${row.name}を選ぶ`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleRow(row.id);
                      }}
                      className="focus-ring flex h-3.5 w-3.5 items-center justify-center border border-rule-strong text-[8px] leading-none"
                    >
                      {selected ? "✓" : ""}
                    </button>
                  </td>
                  <td className="px-1 py-1">{row.name}</td>
                  <td className="px-1 py-1 text-right tabular-nums">{row.qty}</td>
                  <td className="px-1 py-1 text-right tabular-nums">
                    {row.price.toLocaleString()}円
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="border-t border-rule px-2 py-1 text-[10px] text-muted">
          選択中: {picked.length}行
        </p>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 量の比較                                                            */
/* ------------------------------------------------------------------ */

const BARS = [
  { label: "4月", value: 42 },
  { label: "5月", value: 58 },
  { label: "6月", value: 35 },
  { label: "7月", value: 71 },
  { label: "8月", value: 64 },
];

function BarChartDemo() {
  const [active, setActive] = useState(3);
  const max = Math.max(...BARS.map((bar) => bar.value));

  return (
    <DemoFrame hint="各列を押すと、その月の値を読めます">
      <div className={panelClass}>
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] text-muted">月別の売上（万円）</p>
          <p className="instrument text-sm font-semibold">{BARS[active].value}</p>
        </div>
        <div className="mt-2 flex h-24 items-end gap-1.5 border-b border-rule-strong">
          {BARS.map((bar, index) => (
            <button
              key={bar.label}
              type="button"
              aria-pressed={active === index}
              aria-label={`${bar.label} ${bar.value}万円`}
              onClick={() => setActive(index)}
              style={{ height: `${(bar.value / max) * 100}%` }}
              className={cx(
                "focus-ring flex-1 border border-b-0",
                active === index
                  ? "border-ink bg-ink"
                  : "border-rule-strong bg-rule-strong/60 hover:bg-rule-strong",
              )}
            />
          ))}
        </div>
        <div className="mt-1 flex gap-1.5">
          {BARS.map((bar, index) => (
            <span
              key={bar.label}
              className={cx(
                "flex-1 text-center text-[9px]",
                active === index ? "font-bold text-ink" : "text-muted",
              )}
            >
              {bar.label}
            </span>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 時間に沿った変化                                                    */
/* ------------------------------------------------------------------ */

const LINE_VALUES = [12, 18, 15, 26, 22, 31, 28];

function LineChartDemo() {
  const [active, setActive] = useState(5);
  const max = 36;
  const stepX = 200 / (LINE_VALUES.length - 1);
  const points = LINE_VALUES.map((value, index) => ({
    x: 12 + index * stepX,
    y: 84 - (value / max) * 68,
  }));
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <DemoFrame hint="点を押すと、その日の値を読めます">
      <div className={panelClass}>
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] text-muted">日ごとのアクセス数</p>
          <p className="instrument text-sm font-semibold">{LINE_VALUES[active]}</p>
        </div>
        <svg
          viewBox="0 0 224 96"
          className="mt-1 h-24 w-full"
          role="group"
          aria-label="日ごとの推移"
        >
          <line x1="12" y1="84" x2="212" y2="84" stroke="var(--color-rule)" strokeWidth="1" />
          <polyline points={polyline} fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
          {points.map((point, index) => (
            <g
              key={index}
              role="button"
              tabIndex={0}
              aria-label={`${index + 1}日目 ${LINE_VALUES[index]}`}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActive(index);
                }
              }}
              className="focus-ring cursor-pointer"
            >
              <circle cx={point.x} cy={point.y} r="9" fill="transparent" />
              <circle
                cx={point.x}
                cy={point.y}
                r={active === index ? 3.5 : 2}
                fill={active === index ? "var(--color-ink)" : "var(--color-surface)"}
                stroke="var(--color-ink)"
                strokeWidth="1.2"
              />
            </g>
          ))}
        </svg>
        <div className="mt-1 flex justify-between text-[9px] text-muted">
          <span>1日目</span>
          <span>{LINE_VALUES.length}日目</span>
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 構成比                                                              */
/* ------------------------------------------------------------------ */

const DONUT_SEGMENTS = [
  { id: "search", label: "検索", value: 42, color: "var(--color-ink)" },
  { id: "direct", label: "直接", value: 28, color: "var(--color-correct)" },
  { id: "referral", label: "紹介", value: 18, color: "var(--color-timeout)" },
  { id: "other", label: "その他", value: 12, color: "var(--color-rule-strong)" },
];

function DonutDemo() {
  const [active, setActive] = useState(0);
  const total = DONUT_SEGMENTS.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  // 各弧の開始位置は、手前までの割合を足して求める（描画中に変数を書き換えない）。
  const arcs = DONUT_SEGMENTS.map((segment, index) => {
    const before = DONUT_SEGMENTS.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    return {
      ...segment,
      length: (segment.value / total) * circumference,
      offset: (before / total) * circumference,
    };
  });
  const current = DONUT_SEGMENTS[active];

  return (
    <DemoFrame hint="輪を押すと、その内訳の割合が出ます">
      <div className={cx(panelClass, "flex items-center gap-4")}>
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full" role="group" aria-label="内訳の割合">
            {arcs.map((arc, index) => (
              <circle
                key={arc.id}
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={active === index ? 12 : 9}
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                strokeDashoffset={-arc.offset}
                transform="rotate(-90 40 40)"
                role="button"
                tabIndex={0}
                aria-label={`${arc.label} ${arc.value}%`}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActive(index);
                  }
                }}
                className="focus-ring cursor-pointer"
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="instrument text-sm font-semibold leading-none">{current.value}%</span>
            <span className="mt-0.5 text-[9px] text-muted">{current.label}</span>
          </div>
        </div>
        <ul className="space-y-1 text-[10px]">
          {DONUT_SEGMENTS.map((segment, index) => (
            <li key={segment.id} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 border border-rule-strong"
                style={{ backgroundColor: segment.color }}
              />
              <span className={active === index ? "font-bold" : "text-ink-soft"}>
                {segment.label}
              </span>
              <span className="tabular-nums text-muted">{segment.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 上限に対する現在値                                                  */
/* ------------------------------------------------------------------ */

function GaugeDemo() {
  const [value, setValue] = useState(62);
  const radius = 44;
  const arcLength = Math.PI * radius;
  const angle = Math.PI * (1 - value / 100);
  const needleX = 60 + 34 * Math.cos(angle);
  const needleY = 60 - 34 * Math.sin(angle);
  const tone = value >= 80 ? "var(--color-wrong)" : "var(--color-ink)";

  return (
    <DemoFrame hint="つまみを動かすと弧と針が一緒に動きます">
      <div className={panelClass}>
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] text-muted">保存領域の使用量</p>
          <p className="instrument text-sm font-semibold">{value}%</p>
        </div>
        <svg
          viewBox="0 0 120 72"
          className="mt-1 h-20 w-full"
          role="img"
          aria-label={`使用量 ${value}%`}
        >
          <path
            d="M 16 60 A 44 44 0 0 1 104 60"
            fill="none"
            stroke="var(--color-rule)"
            strokeWidth="8"
          />
          <path
            d="M 16 60 A 44 44 0 0 1 104 60"
            fill="none"
            stroke={tone}
            strokeWidth="8"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength * (1 - value / 100)}
          />
          <line
            x1="60"
            y1="60"
            x2={needleX}
            y2={needleY}
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <circle cx="60" cy="60" r="3" fill="var(--color-ink)" />
        </svg>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-label="使用量"
          className="mt-1 h-1.5 w-full cursor-pointer accent-ink"
        />
        <p className="mt-1 text-[10px] text-muted">
          {value >= 80 ? "上限に近づいています" : "まだ余裕があります"}
        </p>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 格子の濃淡                                                          */
/* ------------------------------------------------------------------ */

const HEAT_DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const HEAT_HOURS = ["9時", "12時", "15時", "18時"];
const HEAT_VALUES = [
  [1, 2, 2, 3, 3, 1, 0],
  [3, 4, 3, 4, 4, 2, 1],
  [2, 3, 4, 3, 3, 2, 1],
  [1, 2, 3, 2, 2, 1, 0],
];
const HEAT_LEVELS = ["bg-surface", "bg-ink/10", "bg-ink/25", "bg-ink/45", "bg-ink/70"];

function HeatmapDemo() {
  const [active, setActive] = useState<{ row: number; col: number }>({ row: 1, col: 3 });

  return (
    <DemoFrame hint="升目を押すと、その組み合わせの値が出ます">
      <div className={panelClass}>
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] text-muted">時間帯ごとの利用数</p>
          <p className="instrument text-sm font-semibold">
            {HEAT_VALUES[active.row][active.col]}
          </p>
        </div>
        <div
          className="mt-2 grid gap-1"
          style={{ gridTemplateColumns: "1.75rem repeat(7, minmax(0, 1fr))" }}
        >
          <span aria-hidden="true" />
          {HEAT_DAYS.map((day) => (
            <span key={day} className="text-center text-[9px] text-muted">
              {day}
            </span>
          ))}
          {HEAT_HOURS.map((hour, row) => (
            <Fragment key={hour}>
              <span className="text-[9px] leading-6 text-muted">{hour}</span>
              {HEAT_DAYS.map((day, col) => {
                const level = HEAT_VALUES[row][col];
                const selected = active.row === row && active.col === col;
                return (
                  <button
                    key={`${hour}-${day}`}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${day}曜${hour} ${level}`}
                    onClick={() => setActive({ row, col })}
                    className={cx(
                      "focus-ring h-6 border",
                      HEAT_LEVELS[level],
                      selected ? "border-ink ring-1 ring-ink" : "border-rule",
                    )}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 行内の小さな推移                                                    */
/* ------------------------------------------------------------------ */

const SPARK_ROWS = [
  { id: "a", label: "商品A", value: 128, trend: [3, 5, 4, 6, 7, 6, 8] },
  { id: "b", label: "商品B", value: 96, trend: [6, 5, 5, 4, 4, 3, 3] },
  { id: "c", label: "商品C", value: 74, trend: [2, 3, 5, 4, 6, 7, 7] },
];

function Sparkline({ values, active }: { values: number[]; active: boolean }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 60;
      const y = 18 - ((value - min) / span) * 16;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="60" height="20" viewBox="0 0 60 20" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={active ? "var(--color-ink)" : "var(--color-rule-strong)"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SparklineDemo() {
  const [active, setActive] = useState("a");

  return (
    <DemoFrame hint="行を押すと、その行の推移が強調されます">
      <div className="border border-rule bg-surface">
        <ul className="divide-y divide-rule">
          {SPARK_ROWS.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                aria-pressed={active === row.id}
                onClick={() => setActive(row.id)}
                className={cx(
                  "focus-ring flex w-full items-center gap-2 px-2 py-1.5 text-left",
                  active === row.id ? "bg-paper" : "hover:bg-paper",
                )}
              >
                <span className="flex-1 text-[11px]">{row.label}</span>
                <Sparkline values={row.trend} active={active === row.id} />
                <span className="w-10 text-right text-[11px] tabular-nums">{row.value}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-rule px-2 py-1 text-[10px] text-muted">
          直近7日の推移を添えています
        </p>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 色と項目名の対応                                                    */
/* ------------------------------------------------------------------ */

const LEGEND_SERIES = [
  { id: "new", label: "新規", color: "var(--color-ink)", values: [12, 18, 15, 22, 26] },
  { id: "keep", label: "継続", color: "var(--color-correct)", values: [8, 10, 14, 13, 17] },
  { id: "churn", label: "解約", color: "var(--color-timeout)", values: [4, 3, 6, 5, 4] },
];

function LegendDemo() {
  const [hidden, setHidden] = useState<string[]>([]);
  const max = 30;
  const stepX = 180 / 4;

  return (
    <DemoFrame hint="項目を押すと、その線の表示が切り替わります">
      <div className={panelClass}>
        <svg viewBox="0 0 200 80" className="h-20 w-full" role="img" aria-label="3つの系列の推移">
          <line x1="10" y1="70" x2="190" y2="70" stroke="var(--color-rule)" strokeWidth="1" />
          {LEGEND_SERIES.filter((series) => !hidden.includes(series.id)).map((series) => (
            <polyline
              key={series.id}
              fill="none"
              stroke={series.color}
              strokeWidth="1.5"
              points={series.values
                .map((value, index) => `${10 + index * stepX},${70 - (value / max) * 60}`)
                .join(" ")}
            />
          ))}
        </svg>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {LEGEND_SERIES.map((series) => {
            const visible = !hidden.includes(series.id);
            return (
              <li key={series.id}>
                <button
                  type="button"
                  aria-pressed={visible}
                  onClick={() =>
                    setHidden((current) =>
                      current.includes(series.id)
                        ? current.filter((value) => value !== series.id)
                        : [...current, series.id],
                    )
                  }
                  className={cx(
                    "focus-ring flex items-center gap-1 text-[10px]",
                    visible ? "text-ink" : "text-muted line-through",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 border border-rule-strong"
                    style={{ backgroundColor: visible ? series.color : "transparent" }}
                  />
                  {series.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 条件で絞り込む行                                                    */
/* ------------------------------------------------------------------ */

const FILTER_ITEMS = [
  { id: "inv-4", name: "請求書 4月分", status: "未処理" },
  { id: "inv-5", name: "請求書 5月分", status: "処理済み" },
  { id: "est-6", name: "見積書 6月分", status: "未処理" },
  { id: "rec-6", name: "領収書 6月分", status: "処理済み" },
];

function FilterBarDemo() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("すべて");
  const id = useId();
  const filtered = FILTER_ITEMS.filter(
    (item) => item.name.includes(query) && (status === "すべて" || item.status === status),
  );

  return (
    <DemoFrame hint="条件を変えると下の一覧が絞り込まれます">
      <div className="border border-rule bg-surface">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-rule bg-paper px-2 py-1.5">
          <label htmlFor={id} className="sr-only">
            名前で絞り込む
          </label>
          <input
            id={id}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="名前で絞り込む"
            className="focus-ring min-w-0 flex-1 border border-rule-strong bg-surface px-1.5 py-1 text-[11px]"
          />
          <label htmlFor={`${id}-status`} className="sr-only">
            状態で絞り込む
          </label>
          <select
            id={`${id}-status`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="focus-ring border border-rule-strong bg-surface px-1 py-1 text-[11px]"
          >
            {["すべて", "未処理", "処理済み"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("すべて");
            }}
            className="focus-ring border border-rule-strong px-1.5 py-1 text-[10px]"
          >
            解除
          </button>
        </div>
        <ul className="divide-y divide-rule">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 px-2 py-1 text-[11px]"
              >
                <span>{item.name}</span>
                <span className="text-muted">{item.status}</span>
              </li>
            ))
          ) : (
            <li className="px-2 py-2 text-[11px] text-muted">該当なし</li>
          )}
        </ul>
        <p className="border-t border-rule px-2 py-1 text-[10px] text-muted">
          {filtered.length}件 / {FILTER_ITEMS.length}件
        </p>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 画面上部の帯                                                        */
/* ------------------------------------------------------------------ */

function AppBarDemo() {
  const [screen, setScreen] = useState<"list" | "detail">("list");

  return (
    <DemoFrame hint="上部の帯は残したまま、下の内容だけが切り替わります">
      <div className="border border-rule bg-surface">
        <div className="flex items-center gap-2 border-b border-ink bg-ink px-2 py-1.5 text-paper">
          {screen === "detail" ? (
            <button
              type="button"
              onClick={() => setScreen("list")}
              aria-label="一覧へ戻る"
              className="focus-ring px-1 text-xs leading-none"
            >
              ←
            </button>
          ) : (
            <span aria-hidden="true" className="px-1 text-xs leading-none">
              ≡
            </span>
          )}
          <span className="text-[11px] font-bold">
            {screen === "list" ? "お知らせ" : "お知らせの詳細"}
          </span>
          <span className="ml-auto text-[10px] tabular-nums">3</span>
        </div>
        <div className="h-28 overflow-y-auto">
          {screen === "list" ? (
            <ul className="divide-y divide-rule">
              {["メンテナンスのお知らせ", "料金改定のお知らせ", "新機能の追加"].map((title) => (
                <li key={title}>
                  <button
                    type="button"
                    onClick={() => setScreen("detail")}
                    className="focus-ring block w-full px-2 py-1.5 text-left text-[11px] hover:bg-paper"
                  >
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-1 p-2">
              <p className="text-[11px] font-bold">メンテナンスのお知らせ</p>
              <p className="text-[10px] leading-relaxed text-ink-soft">
                11月20日の2時から4時まで、一部の機能を停止します。
              </p>
            </div>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* ページ末尾の領域                                                    */
/* ------------------------------------------------------------------ */

function FooterDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  const links = ["利用規約", "プライバシー", "会社概要", "お問い合わせ"];

  return (
    <DemoFrame hint="本文の下に、補助のリンクがまとまります">
      <div className="flex min-h-40 flex-col border border-rule bg-surface">
        <div className="flex-1 p-3">
          <p className="text-[11px] font-bold">料金プラン</p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">
            月ごとの利用量に応じて、3つのプランから選べます。
          </p>
          <p className="mt-2 text-[10px] text-muted">
            {picked ? `選択中: ${picked}` : "下のリンクを押すと、ここに表示されます"}
          </p>
        </div>
        <div className="border-t border-rule px-3 py-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {links.map((link) => (
              <button
                key={link}
                type="button"
                aria-pressed={picked === link}
                onClick={() => setPicked(link)}
                className={cx(
                  "focus-ring text-[10px] underline underline-offset-2",
                  picked === link ? "text-ink" : "text-muted",
                )}
              >
                {link}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[9px] text-muted">© 2026 Acme</p>
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 冒頭の大きな領域                                                    */
/* ------------------------------------------------------------------ */

function HeroDemo() {
  const [started, setStarted] = useState(false);

  return (
    <DemoFrame hint="冒頭の大きな見出しと、主な操作をまとめます">
      <div className="border border-rule bg-surface">
        <div className="border-b border-rule px-4 py-5">
          <p className="text-[10px] text-muted">在庫管理</p>
          <p className="mt-1 text-lg font-bold leading-tight">入荷と出荷の一覧</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
            倉庫ごとの残数を並べ、足りない品だけを絞り込めます。
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="focus-ring mt-3 bg-ink px-3 py-1.5 text-[11px] font-bold text-paper"
          >
            {started ? "開いています" : "はじめる"}
          </button>
          {started && <p className="mt-1 text-[10px] text-correct">在庫一覧を開きました</p>}
        </div>
        <div className="space-y-1 p-3">
          <div className="h-2 w-2/3 bg-paper" />
          <div className="h-2 w-full bg-paper" />
          <div className="h-2 w-1/2 bg-paper" />
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* まとまりの境目                                                      */
/* ------------------------------------------------------------------ */

const DIVIDER_GROUPS = [
  { id: "display", label: "表示", rows: ["文字を大きくする", "行間を広げる"] },
  { id: "notify", label: "通知", rows: ["メールで受け取る", "アプリ内で受け取る"] },
  { id: "save", label: "保存", rows: ["自動で保存する"] },
];

function DividerDemo() {
  const [showLines, setShowLines] = useState(true);
  const [checked, setChecked] = useState<string[]>(["文字を大きくする"]);

  const toggle = (row: string) =>
    setChecked((current) =>
      current.includes(row) ? current.filter((value) => value !== row) : [...current, row],
    );

  return (
    <DemoFrame hint="まとまりの境目を罫線で分けるかどうかを切り替えられます">
      <div className={panelClass}>
        {DIVIDER_GROUPS.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && showLines && <hr className="my-2 border-t border-rule" />}
            {index > 0 && !showLines && <div className="h-2" />}
            <p className="text-[10px] font-bold text-muted">{group.label}</p>
            <ul className="mt-1 space-y-1">
              {group.rows.map((row) => (
                <li key={row}>
                  <button
                    type="button"
                    aria-pressed={checked.includes(row)}
                    onClick={() => toggle(row)}
                    className="focus-ring flex w-full items-center gap-1.5 text-left text-[11px]"
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "flex h-3.5 w-3.5 shrink-0 items-center justify-center border text-[8px] leading-none",
                        checked.includes(row)
                          ? "border-ink bg-ink text-paper"
                          : "border-rule-strong",
                      )}
                    >
                      {checked.includes(row) ? "✓" : ""}
                    </span>
                    {row}
                  </button>
                </li>
              ))}
            </ul>
          </Fragment>
        ))}
        <button
          type="button"
          onClick={() => setShowLines((value) => !value)}
          aria-pressed={showLines}
          className="focus-ring mt-2 border border-rule-strong px-2 py-0.5 text-[10px]"
        >
          {showLines ? "線を消す" : "線を出す"}
        </button>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* スクロールしても残る見出し                                          */
/* ------------------------------------------------------------------ */

const STICKY_ROWS = [
  { id: "s1", name: "ノート A5", qty: 12 },
  { id: "s2", name: "ノート B5", qty: 8 },
  { id: "s3", name: "ペン 黒", qty: 40 },
  { id: "s4", name: "ペン 赤", qty: 26 },
  { id: "s5", name: "ファイル 青", qty: 7 },
  { id: "s6", name: "ファイル 緑", qty: 15 },
  { id: "s7", name: "はさみ", qty: 21 },
  { id: "s8", name: "のり", qty: 33 },
];

function StickyHeaderDemo() {
  const [picked, setPicked] = useState("s3");

  return (
    <DemoFrame hint="下までスクロールしても見出しが上に残ります">
      <div className="border border-rule bg-surface">
        <div className="h-32 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-rule-strong bg-paper px-2 py-1 text-[10px] font-bold">
            <span className="flex-1">品名</span>
            <span className="w-8 text-right">数</span>
          </div>
          <ul className="divide-y divide-rule">
            {STICKY_ROWS.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  aria-pressed={picked === row.id}
                  onClick={() => setPicked(row.id)}
                  className={cx(
                    "focus-ring flex w-full items-center gap-2 px-2 py-1 text-left text-[11px]",
                    picked === row.id ? "bg-paper font-bold" : "hover:bg-paper",
                  )}
                >
                  <span className="flex-1">{row.name}</span>
                  <span className="w-8 text-right tabular-nums">{row.qty}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="border-t border-rule px-2 py-1 text-[10px] text-muted">
          選択中: {STICKY_ROWS.find((row) => row.id === picked)?.name ?? "なし"}
        </p>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 整形した文字列                                                      */
/* ------------------------------------------------------------------ */

const CODE_SAMPLE = `const total = items.reduce(
  (sum, item) => sum + item.price,
  0,
);

console.log(total);`;

function CodeBlockDemo() {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    // 安全でないコンテキストでは clipboard が無いので、失敗しても表示だけ切り替える。
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(CODE_SAMPLE).catch(() => undefined);
    }
    setCopied(true);
  };

  return (
    <DemoFrame hint="コピーと折り返しの切り替えができます">
      <div className="border border-rule bg-surface">
        <div className="flex items-center justify-between gap-2 border-b border-rule px-2 py-1">
          <span className="text-[10px] text-muted">example.ts</span>
          <div className="flex gap-1">
            <button
              type="button"
              aria-pressed={wrap}
              onClick={() => setWrap((value) => !value)}
              className="focus-ring border border-rule-strong px-1.5 py-0.5 text-[10px]"
            >
              {wrap ? "折り返さない" : "折り返す"}
            </button>
            <button
              type="button"
              onClick={copy}
              className="focus-ring border border-rule-strong px-1.5 py-0.5 text-[10px]"
            >
              {copied ? "コピーしました" : "コピー"}
            </button>
          </div>
        </div>
        <div
          className={cx(
            "p-2 font-mono text-[10px] leading-relaxed",
            wrap ? "" : "overflow-x-auto",
          )}
        >
          {CODE_SAMPLE.split("\n").map((line, index) => (
            <div key={index} className="flex gap-2">
              <span className="w-4 shrink-0 select-none text-right text-muted">{index + 1}</span>
              <span
                className={cx(
                  "min-w-0",
                  wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre",
                )}
              >
                {line === "" ? " " : line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 押すキーの形                                                        */
/* ------------------------------------------------------------------ */

const KBD_SHORTCUTS = [
  { id: "search", label: "検索を開く", keys: ["Ctrl", "K"] },
  { id: "save", label: "保存する", keys: ["Ctrl", "S"] },
  { id: "undo", label: "元に戻す", keys: ["Ctrl", "Z"] },
];

function KbdDemo() {
  const [active, setActive] = useState("search");

  return (
    <DemoFrame hint="行を押すと、そのキーが押された見た目になります">
      <div className={panelClass}>
        <ul className="space-y-1">
          {KBD_SHORTCUTS.map((shortcut) => {
            const selected = active === shortcut.id;
            return (
              <li key={shortcut.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActive(shortcut.id)}
                  className={cx(
                    "focus-ring flex w-full items-center justify-between gap-2 border px-2 py-1 text-left",
                    selected ? "border-ink bg-paper" : "border-transparent hover:border-rule",
                  )}
                >
                  <span className="text-[11px]">{shortcut.label}</span>
                  <span className="flex items-center gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className={cx(
                          "border px-1.5 py-0.5 text-[10px] font-bold",
                          selected
                            ? "border-ink bg-ink text-paper"
                            : "border-rule-strong bg-paper text-ink shadow-[inset_0_-2px_0_var(--color-rule-strong)]",
                        )}
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[10px] text-muted">
          選択中: {KBD_SHORTCUTS.find((shortcut) => shortcut.id === active)?.label}
        </p>
      </div>
    </DemoFrame>
  );
}

export const DATA_DEMOS: Record<string, () => React.JSX.Element> = {
  treeview: TreeViewDemo,
  datagrid: DataGridDemo,
  barchart: BarChartDemo,
  linechart: LineChartDemo,
  donut: DonutDemo,
  gauge: GaugeDemo,
  heatmap: HeatmapDemo,
  sparkline: SparklineDemo,
  legend: LegendDemo,
  filterbar: FilterBarDemo,
  appbar: AppBarDemo,
  footer: FooterDemo,
  hero: HeroDemo,
  divider: DividerDemo,
  stickyheader: StickyHeaderDemo,
  codeblock: CodeBlockDemo,
  kbd: KbdDemo,
};
