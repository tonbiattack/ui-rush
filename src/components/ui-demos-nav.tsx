"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DemoFrame } from "@/components/ui-demos";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const inputClass =
  "focus-ring w-full rounded-sm border border-rule-strong bg-surface px-2 py-1.5 text-sm";

/** 検索窓に打ち込むと候補が絞り込まれ、選ぶとその操作が走る。 */
function QuickFindDemo() {
  const actions = ["新しいファイル", "設定を開く", "配色を切り替える", "ログアウト"];
  const [query, setQuery] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const filtered = actions.filter((action) => action.includes(query));
  const id = useId();

  const run = (action: string) => {
    setLast(action);
    setQuery("");
  };

  return (
    <DemoFrame hint="文字を打つと候補が絞り込まれ、選ぶと実行されます">
      <div className="border border-rule-strong bg-surface">
        <div className="flex items-center gap-1.5 border-b border-rule px-2">
          <span aria-hidden="true" className="text-muted">
            ⌕
          </span>
          <input
            id={id}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filtered.length > 0) {
                run(filtered[0]);
              }
            }}
            placeholder="やりたいことを打ち込む"
            aria-label="操作を検索"
            className="w-full bg-transparent py-1.5 text-sm outline-none"
          />
        </div>
        <ul className="max-h-28 overflow-auto py-0.5">
          {filtered.length > 0 ? (
            filtered.map((action) => (
              <li key={action}>
                <button
                  type="button"
                  onClick={() => run(action)}
                  className="focus-ring block w-full px-2 py-1 text-left text-xs hover:bg-paper"
                >
                  {action}
                </button>
              </li>
            ))
          ) : (
            <li className="px-2 py-1 text-xs text-muted">該当なし</li>
          )}
        </ul>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          実行: {last ?? "なし"}
        </p>
      </div>
    </DemoFrame>
  );
}

/** 見出しに触れると、複数列の一覧が下に開く。 */
function WideMenuDemo() {
  const groups = [
    { title: "はじめる", links: ["概要", "導入の流れ", "料金表"] },
    { title: "機能", links: ["一覧", "検索", "連携"] },
    { title: "サポート", links: ["よくある質問", "問い合わせ", "お知らせ"] },
  ];
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  return (
    <DemoFrame hint="見出しにカーソルを合わせると、複数列の一覧が開きます">
      <div
        className="relative border border-rule bg-surface"
        onMouseLeave={() => setOpen(false)}
      >
        <nav aria-label="サンプル" className="flex items-center gap-1 border-b border-rule px-2 py-1.5">
          <button
            type="button"
            aria-expanded={open}
            onMouseEnter={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen((value) => !value)}
            className={cx(
              "focus-ring px-2 py-0.5 text-xs font-bold",
              open ? "bg-ink text-paper" : "hover:bg-paper",
            )}
          >
            製品
          </button>
          {["料金", "会社"].map((label) => (
            <span key={label} className="px-2 py-0.5 text-xs text-ink-soft">
              {label}
            </span>
          ))}
        </nav>
        {open && (
          <div className="grid grid-cols-3 gap-2 border-b border-rule bg-paper p-2">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="border-b border-rule pb-0.5 text-[10px] font-bold text-muted">
                  {group.title}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {group.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => {
                          setLast(link);
                          setOpen(false);
                        }}
                        className="focus-ring block w-full px-1 py-0.5 text-left text-[11px] hover:bg-surface"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-1 p-3">
          <div className="h-2 w-2/3 bg-paper" />
          <div className="h-2 w-full bg-paper" />
        </div>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          直近の選択: {last ?? "なし"}
        </p>
      </div>
    </DemoFrame>
  );
}

/** 横並びの見出しを押すと、その項目の一覧が開く。 */
function MenuRowDemo() {
  const menus = [
    { label: "ファイル", items: ["新規作成", "開く", "保存"] },
    { label: "編集", items: ["元に戻す", "やり直す", "すべて選択"] },
    { label: "表示", items: ["拡大", "縮小", "全画面"] },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [last, setLast] = useState<string | null>(null);

  return (
    <DemoFrame hint="見出しを押すと、その項目の一覧が開きます">
      <div className="relative border border-rule bg-surface">
        <div role="group" aria-label="サンプル" className="flex border-b border-rule">
          {menus.map((menu, index) => (
            <button
              key={menu.label}
              type="button"
              aria-expanded={openIndex === index}
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              className={cx(
                "focus-ring px-2.5 py-1.5 text-xs",
                openIndex === index ? "bg-ink text-paper" : "hover:bg-paper",
              )}
            >
              {menu.label}
            </button>
          ))}
        </div>
        {openIndex !== null && (
          <div className="border-b border-rule bg-paper py-0.5">
            {menus[openIndex].items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setLast(item);
                  setOpenIndex(null);
                }}
                className="focus-ring block w-full px-3 py-1 text-left text-xs hover:bg-surface"
              >
                {item}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-1 p-3">
          <div className="h-2 w-3/4 bg-paper" />
          <div className="h-2 w-full bg-paper" />
        </div>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          直近の選択: {last ?? "なし"}
        </p>
      </div>
    </DemoFrame>
  );
}

/** アイコンを横に並べ、1回の押下で操作が走る。 */
function IconBarDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const tools = [
    { label: "太字", glyph: "B", active: bold, toggle: () => setBold((value) => !value) },
    { label: "斜体", glyph: "I", active: italic, toggle: () => setItalic((value) => !value) },
    { label: "下線", glyph: "U", active: underline, toggle: () => setUnderline((value) => !value) },
  ];

  return (
    <DemoFrame hint="アイコンを押すと、その操作がすぐ実行されます">
      <div className="border border-rule bg-surface">
        <div className="flex items-center gap-0.5 border-b border-rule p-1">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              aria-label={tool.label}
              aria-pressed={tool.active}
              onClick={() => {
                tool.toggle();
                setLast(tool.label);
              }}
              className={cx(
                "focus-ring h-7 w-7 border text-xs font-bold",
                tool.active ? "border-ink bg-ink text-paper" : "border-transparent hover:border-rule-strong",
              )}
            >
              {tool.glyph}
            </button>
          ))}
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-rule-strong" />
          {[
            { label: "元に戻す", glyph: "↶" },
            { label: "やり直す", glyph: "↷" },
          ].map((tool) => (
            <button
              key={tool.label}
              type="button"
              aria-label={tool.label}
              onClick={() => setLast(tool.label)}
              className="focus-ring h-7 w-7 border border-transparent text-sm hover:border-rule-strong"
            >
              {tool.glyph}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setLast("保存")}
            className="focus-ring ml-auto border border-rule-strong px-2 py-0.5 text-[11px] font-bold hover:bg-paper"
          >
            保存
          </button>
        </div>
        <p
          className={cx(
            "p-3 text-sm",
            bold && "font-bold",
            italic && "italic",
            underline && "underline",
          )}
        >
          この文章の見た目が、上のアイコンで変わります。
        </p>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          直近の操作: {last ?? "なし"}
        </p>
      </div>
    </DemoFrame>
  );
}

/** 深くスクロールしたときだけ現れ、押すと上へ戻る。 */
function ScrollTopDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  return (
    <DemoFrame hint="下までスクロールするとボタンが現れます">
      <div className="relative border border-rule bg-surface">
        <div
          ref={boxRef}
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 40)}
          className="h-40 overflow-auto p-3"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <p key={index} className="mb-2 text-xs leading-relaxed text-ink-soft">
              {index + 1}行目。長い本文が続くほど、位置を戻す手段が要ります。
            </p>
          ))}
        </div>
        {scrolled && (
          <button
            type="button"
            aria-label="上へ移動"
            onClick={() => boxRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            className="focus-ring absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center border border-ink bg-ink text-sm text-paper"
          >
            ↑
          </button>
        )}
      </div>
    </DemoFrame>
  );
}

/** Tabで最初に現れ、押すと本文の位置へ移る。 */
function JumpLinkDemo() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [jumped, setJumped] = useState(false);
  const rawId = useId();
  const mainId = `jump-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <DemoFrame hint="Tabキーで最初に現れ、押すと本文の位置へ移ります">
      <div className="relative overflow-hidden border border-rule bg-surface">
        <a
          href={`#${mainId}`}
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
            setJumped(true);
          }}
          className="focus-ring absolute left-0 top-0 z-10 -translate-y-full border border-ink bg-ink px-2 py-1 text-xs font-bold text-paper focus:translate-y-0"
        >
          本文へ移る
        </a>
        <nav aria-label="サンプル" className="flex gap-3 border-b border-rule px-3 py-1.5 text-[11px] text-ink-soft">
          {["ホーム", "製品", "料金", "会社"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </nav>
        <div
          id={mainId}
          ref={mainRef}
          tabIndex={-1}
          className={cx("p-3", jumped && "bg-paper")}
        >
          <p className="text-xs font-bold">本文の見出し</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            繰り返し並ぶ案内を飛ばして、ここから読み始められます。
          </p>
        </div>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          {jumped ? "本文の位置へ移りました" : "Tabキーを押すとリンクが現れます"}
        </p>
      </div>
    </DemoFrame>
  );
}

/** 末尾のボタンで続きを読み込む。 */
function MoreItemsDemo() {
  const all = Array.from({ length: 12 }, (_, index) => `記事 ${index + 1}`);
  const [count, setCount] = useState(3);
  const visible = all.slice(0, count);
  const done = count >= all.length;

  return (
    <DemoFrame hint="押すたびに続きが読み込まれます">
      <div className="border border-rule bg-surface">
        <ul className="divide-y divide-rule">
          {visible.map((item) => (
            <li key={item} className="px-3 py-1.5 text-xs">
              {item}
            </li>
          ))}
        </ul>
        <div className="border-t border-rule p-2 text-center">
          <button
            type="button"
            disabled={done}
            onClick={() => setCount((current) => Math.min(all.length, current + 3))}
            className="focus-ring border border-rule-strong px-3 py-1 text-[11px] font-bold disabled:opacity-40"
          >
            {done ? "すべて表示済み" : "残りを表示"}
          </button>
        </div>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          {visible.length} / {all.length}件を表示中
        </p>
      </div>
    </DemoFrame>
  );
}

/** 点を押すと、その位置の内容に切り替わる。 */
function SlideDotsDemo() {
  const slides = [
    { title: "1枚目", body: "点の並びが現在位置を示します。" },
    { title: "2枚目", body: "押すとその位置へ移ります。" },
    { title: "3枚目", body: "何枚あるかも点の数で分かります。" },
  ];
  const [index, setIndex] = useState(0);

  return (
    <DemoFrame hint="点を押すと、その位置の内容に切り替わります">
      <div className="border border-rule bg-surface">
        <div className="p-4 text-center" aria-live="polite">
          <p className="text-xs font-bold">{slides[index].title}</p>
          <p className="mt-1 text-[11px] text-muted">{slides[index].body}</p>
        </div>
        <div className="flex items-center justify-center gap-1.5 border-t border-rule py-2">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`${dotIndex + 1}枚目を表示`}
              aria-current={index === dotIndex ? "true" : undefined}
              onClick={() => setIndex(dotIndex)}
              className={cx(
                "focus-ring h-2.5 w-2.5 rounded-full border",
                index === dotIndex ? "border-ink bg-ink" : "border-rule-strong bg-surface",
              )}
            />
          ))}
        </div>
        <p role="status" className="border-t border-rule px-2 py-1 text-center text-[11px] text-muted">
          {index + 1} / {slides.length}
        </p>
      </div>
    </DemoFrame>
  );
}

/** 見出しの一覧から、同じ枠内の各節へ飛ぶ。 */
function SectionLinksDemo() {
  const sections = [
    { key: "a", title: "1. 目的", body: "この文書で決めたいことを書きます。" },
    { key: "b", title: "2. 前提", body: "判断の土台になる条件を書きます。" },
    { key: "c", title: "3. 手順", body: "実際の進め方を順に書きます。" },
    { key: "d", title: "4. 補足", body: "本文から外した細かい話を書きます。" },
  ];
  const boxRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [active, setActive] = useState("a");

  const go = (key: string) => {
    const box = boxRef.current;
    const target = sectionRefs.current[key];
    if (!box || !target) {
      return;
    }
    box.scrollTop = target.offsetTop;
    setActive(key);
  };

  return (
    <DemoFrame hint="項目を押すと、その見出しの位置へ移動します">
      <div className="border border-rule bg-surface">
        <ul className="flex flex-wrap gap-x-3 gap-y-1 border-b border-rule px-2 py-1.5">
          {sections.map((section) => (
            <li key={section.key}>
              <button
                type="button"
                aria-current={active === section.key ? "true" : undefined}
                onClick={() => go(section.key)}
                className={cx(
                  "focus-ring text-[11px]",
                  active === section.key ? "font-bold underline underline-offset-2" : "text-ink-soft",
                )}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
        <div ref={boxRef} className="relative h-32 overflow-auto p-3">
          {sections.map((section) => (
            <div
              key={section.key}
              ref={(node) => {
                sectionRefs.current[section.key] = node;
              }}
              className="mb-3 last:mb-0"
            >
              <p className="text-xs font-bold">{section.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

/** 読み進めた量を、上部の細いバーで示す。 */
function ScrollGaugeDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  return (
    <DemoFrame hint="読み進めると、上のバーが伸びます">
      <div className="border border-rule bg-surface">
        <div className="h-1 bg-rule">
          <div
            className="h-full bg-ink transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          ref={boxRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            const max = element.scrollHeight - element.clientHeight;
            setProgress(max > 0 ? Math.round((element.scrollTop / max) * 100) : 0);
          }}
          className="h-36 overflow-auto p-3"
        >
          {Array.from({ length: 10 }, (_, index) => (
            <p key={index} className="mb-2 text-xs leading-relaxed text-ink-soft">
              {index + 1}行目。読み進めた割合が上のバーに反映されます。
            </p>
          ))}
        </div>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          {progress}% まで読み進めました
        </p>
      </div>
    </DemoFrame>
  );
}

/** 一覧を下へなぞって離すと、最新を取り直す。 */
function DragDownDemo() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [stamp, setStamp] = useState("10:02");
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!refreshing) {
      return;
    }
    const timer = window.setTimeout(() => {
      setRefreshing(false);
      setStamp(
        new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      );
    }, 900);
    return () => window.clearTimeout(timer);
  }, [refreshing]);

  const finish = () => {
    if (startY.current === null) {
      return;
    }
    startY.current = null;
    if (pull >= 40) {
      setRefreshing(true);
    }
    setPull(0);
  };

  return (
    <DemoFrame hint="一覧を下へなぞって離すと、最新を取り直します">
      <div
        className="touch-none select-none overflow-hidden border border-rule bg-surface"
        onPointerDown={(event) => {
          if (refreshing) {
            return;
          }
          startY.current = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (startY.current === null) {
            return;
          }
          setPull(Math.max(0, Math.min(56, event.clientY - startY.current)));
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        <div
          className="flex items-center justify-center overflow-hidden text-[11px] text-muted"
          style={{ height: refreshing ? 28 : Math.max(0, pull) }}
        >
          {refreshing ? "取り直しています" : pull >= 40 ? "離すと取り直します" : pull > 0 ? "下へなぞる" : ""}
        </div>
        <ul className="divide-y divide-rule border-t border-rule">
          {["お知らせ 1", "お知らせ 2", "お知らせ 3"].map((item) => (
            <li key={item} className="px-3 py-1.5 text-xs">
              {item}
            </li>
          ))}
        </ul>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          最終取得: {stamp}
        </p>
      </div>
    </DemoFrame>
  );
}

/** 失敗した理由と、次にできることを並べて出す。 */
function FailureTextDemo() {
  const [value, setValue] = useState("");
  const [failed, setFailed] = useState(false);
  const id = useId();

  return (
    <DemoFrame hint="失敗したときに、理由と次の操作が出ます">
      <div className="border border-rule bg-surface p-3">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          宛先
        </label>
        <input
          id={id}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setFailed(false);
          }}
          placeholder="name@example.com"
          className={cx(inputClass, "mt-1")}
        />
        <button
          type="button"
          onClick={() => setFailed(!value.includes("@"))}
          className="focus-ring mt-2 border border-ink bg-ink px-3 py-1 text-xs font-bold text-paper"
        >
          送信する
        </button>
        {failed && (
          <div role="alert" className="mt-2 border-l-2 border-wrong bg-wrong-soft px-2 py-1.5">
            <p className="text-xs font-bold text-wrong">送信できませんでした</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-wrong">
              宛先に @ が含まれていません。入力し直してから、もう一度送信してください。
            </p>
            <button
              type="button"
              onClick={() => setFailed(false)}
              className="focus-ring mt-1 text-[11px] font-bold text-wrong underline underline-offset-2"
            >
              もう一度送信する
            </button>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

/** 本文から目立たせたい内容を、枠と色で囲む。 */
function HighlightBlockDemo() {
  const tones = [
    { key: "important", label: "重要", body: "この設定を変えると、請求額が変わります。" },
    { key: "reference", label: "参考", body: "同じ内容は、設定画面からも確認できます。" },
    { key: "premise", label: "前提", body: "この手順は、管理者の権限がある場合だけ使えます。" },
  ] as const;
  const [tone, setTone] = useState<(typeof tones)[number]["key"]>("important");
  const current = tones.find((item) => item.key === tone) ?? tones[0];

  return (
    <DemoFrame hint="枠と色で、本文から目立たせたい内容を囲みます">
      <div className="border border-rule bg-surface p-3">
        <p className="text-xs leading-relaxed text-ink-soft">
          本文はそのまま流れ、目立たせたい部分だけを枠で囲みます。
        </p>
        <div
          className={cx(
            "mt-2 border-l-2 px-2 py-1.5",
            tone === "important" && "border-wrong bg-wrong-soft",
            tone === "reference" && "border-timeout bg-timeout-soft",
            tone === "premise" && "border-correct bg-correct-soft",
          )}
        >
          <p
            className={cx(
              "text-[11px] font-bold",
              tone === "important" && "text-wrong",
              tone === "reference" && "text-timeout",
              tone === "premise" && "text-correct",
            )}
          >
            {current.label}
          </p>
          <p
            className={cx(
              "mt-0.5 text-[11px] leading-relaxed",
              tone === "important" && "text-wrong",
              tone === "reference" && "text-timeout",
              tone === "premise" && "text-correct",
            )}
          >
            {current.body}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tones.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={tone === item.key}
              onClick={() => setTone(item.key)}
              className={cx(
                "focus-ring border px-2 py-0.5 text-[11px]",
                tone === item.key ? "border-ink bg-ink text-paper" : "border-rule-strong",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}

/** 締切までの残りを、減っていく数字で見せる。 */
function RemainingTimeDemo() {
  const [remaining, setRemaining] = useState(10);
  const [running, setRunning] = useState(false);
  const active = running && remaining > 0;

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <DemoFrame hint="開始を押すと、数字が1秒ずつ減っていきます">
      <div className="border border-rule bg-surface p-3 text-center">
        <p className="text-[11px] text-muted">受付の終了まで</p>
        <p
          className={cx(
            "instrument mt-1 text-4xl font-semibold leading-none",
            remaining <= 3 && remaining > 0 && "text-wrong",
            remaining === 0 && "text-muted",
          )}
          role="timer"
        >
          {minutes}:{String(seconds).padStart(2, "0")}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          {remaining === 0 ? "受付は終了しました" : active ? "減っています" : "停止中"}
        </p>
        <div className="mt-2 flex justify-center gap-1.5">
          <button
            type="button"
            disabled={active || remaining === 0}
            onClick={() => setRunning(true)}
            className="focus-ring border border-ink bg-ink px-3 py-1 text-[11px] font-bold text-paper disabled:opacity-40"
          >
            開始
          </button>
          <button
            type="button"
            disabled={!active}
            onClick={() => setRunning(false)}
            className="focus-ring border border-rule-strong px-3 py-1 text-[11px] disabled:opacity-40"
          >
            停止
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemaining(10);
            }}
            className="focus-ring border border-rule-strong px-3 py-1 text-[11px]"
          >
            戻す
          </button>
        </div>
      </div>
    </DemoFrame>
  );
}

/** 画面を覆わず、上部の細い帯だけで待ちを伝える。 */
function ThinLoadBarDemo() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const active = running && progress < 100;

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(100, value + 12));
    }, 120);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <DemoFrame hint="画面を覆わず、上部の細い帯で読み込み中を示します">
      <div className="border border-rule bg-surface">
        <div className="h-0.5 bg-rule">
          <div
            className="h-full bg-ink transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="p-3">
          <p className="text-xs font-bold">画面の見出し</p>
          <div className="mt-2 space-y-1">
            <div className="h-2 w-2/3 bg-paper" />
            <div className="h-2 w-full bg-paper" />
            <div className="h-2 w-1/2 bg-paper" />
          </div>
          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setRunning(true);
            }}
            className="focus-ring mt-3 border border-rule-strong px-2 py-1 text-[11px]"
          >
            画面を切り替える
          </button>
        </div>
        <p role="status" className="border-t border-rule px-2 py-1 text-[11px] text-muted">
          {active ? "読み込み中" : progress >= 100 ? "読み込みが終わりました" : "待機中"}
        </p>
      </div>
    </DemoFrame>
  );
}

/** 関係する欄のすぐ下に、その欄だけの案内を出す。 */
function FieldNoticeDemo() {
  const [value, setValue] = useState("");
  const id = useId();
  const invalid = value.length > 0 && !value.includes("@");

  return (
    <DemoFrame hint="欄のすぐ下に、その欄だけの案内が出ます">
      <div className="border border-rule bg-surface p-3">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          連絡先
        </label>
        <input
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="name@example.com"
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-notice` : undefined}
          className={cx(inputClass, "mt-1", invalid && "border-wrong")}
        />
        {invalid && (
          <p
            id={`${id}-notice`}
            role="alert"
            className="mt-1 border-l-2 border-wrong bg-wrong-soft px-2 py-1 text-[11px] leading-relaxed text-wrong"
          >
            この欄だけの案内です。@ を含む形で入力してください。
          </p>
        )}
        <p className="mt-2 text-[11px] text-muted">
          画面全体ではなく、関係する場所のそばに出ます。
        </p>
      </div>
    </DemoFrame>
  );
}

export const NAV_DEMOS: Record<string, () => React.JSX.Element> = {
  commandpalette: QuickFindDemo,
  megamenu: WideMenuDemo,
  menubar: MenuRowDemo,
  toolbar: IconBarDemo,
  backtotop: ScrollTopDemo,
  skiplink: JumpLinkDemo,
  loadmore: MoreItemsDemo,
  dotindicator: SlideDotsDemo,
  anchorlinks: SectionLinksDemo,
  progressnav: ScrollGaugeDemo,
  pulltorefresh: DragDownDemo,
  errormessage: FailureTextDemo,
  callout: HighlightBlockDemo,
  countdown: RemainingTimeDemo,
  loadingbar: ThinLoadBarDemo,
  inlinealert: FieldNoticeDemo,
};
