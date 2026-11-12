"use client";

import { useEffect, useId, useRef, useState } from "react";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

/**
 * デモ共通の枠。実際のUIを触れるようにしつつ、操作してもタイマーは止めない。
 * 出題中に答えが漏れないよう、デモの見出しにはUI名称を出さない。
 */
export function DemoFrame({
  hint,
  children,
  className,
}: {
  hint: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex h-full flex-col gap-2", className)}>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
      <p className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-500">
        <span
          className="mt-0.5 inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-700"
          aria-hidden="true"
        >
          i
        </span>
        <span>{hint}</span>
      </p>
    </div>
  );
}

function AccordionDemo() {
  const items = [
    { id: "design", label: "デザイン", body: "色・余白・タイポグラフィの基本セット。" },
    { id: "motion", label: "モーション", body: "状態変化を伝える短いアニメーション。" },
    { id: "a11y", label: "アクセシビリティ", body: "読み上げとキーボード操作への配慮。" },
  ];
  const [openId, setOpenId] = useState<string | null>("design");

  return (
    <DemoFrame hint="見出しをタップすると開閉します">
      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div key={item.id}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`accordion-panel-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="focus-ring flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50"
              >
                {item.label}
                <span aria-hidden="true" className={cx("transition-transform", open && "rotate-180")}>
                  ▾
                </span>
              </button>
              <div
                id={`accordion-panel-${item.id}`}
                hidden={!open}
                className="px-4 pb-3 text-sm text-slate-600"
              >
                {item.body}
              </div>
            </div>
          );
        })}
      </div>
    </DemoFrame>
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    openButtonRef.current?.focus();
  };

  return (
    <DemoFrame hint="開いたら背景は操作できません">
      <div className="relative min-h-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">この画面の上に重なって表示されます。</p>
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          ダイアログを開く
        </button>
        {open && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-900/50 p-4"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                close();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-demo-title"
              className="w-full max-w-xs rounded-xl bg-white p-4 shadow-xl"
            >
              <h3 id="modal-demo-title" className="text-sm font-bold">
                変更を保存しますか？
              </h3>
              <p className="mt-1 text-xs text-slate-600">保存すると元に戻せません。</p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="focus-ring rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoFrame hint="端のメニューを開いてみましょう">
      <div className="relative min-h-44 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="p-4">
          <p className="text-sm text-slate-600">左端からパネルが出てきます。</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
            aria-expanded={open}
            aria-controls="drawer-demo-panel"
          >
            <span aria-hidden="true">☰</span> メニュー
          </button>
        </div>
        {open && (
          <div className="absolute inset-0">
            <button
              type="button"
              aria-label="メニューを閉じる"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full bg-slate-900/40"
            />
            <div
              id="drawer-demo-panel"
              className="absolute inset-y-0 left-0 flex w-48 flex-col gap-1 bg-white p-3 shadow-xl"
            >
              <p className="px-2 pb-1 text-xs font-semibold text-slate-500">メニュー</p>
              {["ホーム", "学習履歴", "設定"].map((label) => (
                <span key={label} className="rounded-lg px-2 py-1.5 text-sm hover:bg-slate-100">
                  {label}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring mt-auto rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function ToastDemo() {
  const [visible, setVisible] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <DemoFrame hint="短時間で自動的に消えます">
      <div className="relative min-h-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">操作を止めずに結果だけ知らせます。</p>
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="focus-ring mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          保存する
        </button>
        <div aria-live="polite" className="pointer-events-none absolute inset-x-3 top-3">
          {visible && (
            <div
              id={id}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg"
            >
              保存しました
            </div>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}

function SnackbarDemo() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("項目を削除しました");

  return (
    <DemoFrame hint="通知の中のボタンを押せます">
      <div className="relative min-h-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">{message}</p>
        <button
          type="button"
          onClick={() => {
            setMessage("項目を削除しました");
            setVisible(true);
          }}
          className="focus-ring mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
        >
          削除する
        </button>
        {visible && (
          <div
            role="status"
            className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg"
          >
            <span>項目を削除しました</span>
            <button
              type="button"
              onClick={() => {
                setMessage("削除を取り消しました");
                setVisible(false);
              }}
              className="focus-ring rounded px-2 py-1 font-bold text-amber-300"
            >
              元に戻す
            </button>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function TooltipDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <DemoFrame hint="ボタンに触れると説明が出ます">
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
            onClick={() => setVisible((value) => !value)}
            aria-describedby="tooltip-demo"
            className="focus-ring rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            ?
          </button>
          {visible && (
            <div
              id="tooltip-demo"
              role="tooltip"
              className="absolute bottom-full left-1/2 mb-2 w-40 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-center text-xs text-white"
            >
              短い説明だけを表示します
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">操作ボタンは含みません</p>
      </div>
    </DemoFrame>
  );
}

function PopoverDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoFrame hint="ボタンの近くに操作できるパネルが開きます">
      <div className="relative flex min-h-44 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="popover-demo"
          className="focus-ring rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          {open ? "パネルを閉じる" : "パネルを開く"}
        </button>
        {open && (
          <div
            id="popover-demo"
            className="absolute top-14 z-10 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
          >
            <p className="text-xs font-semibold text-slate-500">表示設定</p>
            <label className="mt-2 flex items-center justify-between gap-2 text-sm">
              通知
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
            </label>
            <label className="mt-1 flex items-center justify-between gap-2 text-sm">
              自動再生
              <input type="checkbox" className="h-4 w-4 accent-indigo-600" />
            </label>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function TabsDemo() {
  const tabs = [
    { id: "overview", label: "概要", body: "全体像を1画面で把握できます。" },
    { id: "spec", label: "仕様", body: "項目ごとの細かな条件を確認できます。" },
    { id: "log", label: "履歴", body: "変更の履歴を新しい順に並べます。" },
  ];
  const [active, setActive] = useState(tabs[0].id);
  const baseId = useId();
  const panel = tabs.find((tab) => tab.id === active)!;

  return (
    <DemoFrame hint="見出しを押すと中身が切り替わります">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div
          role="tablist"
          aria-label="デモ"
          className="flex gap-1 rounded-lg bg-slate-100 p-1"
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
              return;
            }
            event.preventDefault();
            const currentIndex = tabs.findIndex((tab) => tab.id === active);
            const step = event.key === "ArrowRight" ? 1 : -1;
            const nextIndex = (currentIndex + step + tabs.length) % tabs.length;
            setActive(tabs[nextIndex].id);
            document.getElementById(`${baseId}-${tabs[nextIndex].id}-tab`)?.focus();
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`${baseId}-${tab.id}-tab`}
              role="tab"
              type="button"
              aria-selected={active === tab.id}
              aria-controls={`${baseId}-${tab.id}-panel`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={cx(
                "focus-ring flex-1 rounded-md px-2 py-1.5 text-xs font-semibold",
                active === tab.id ? "bg-white text-brand-700 shadow-sm" : "text-slate-600",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          id={`${baseId}-${panel.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${panel.id}-tab`}
          className="px-1 py-3 text-sm text-slate-600"
        >
          {panel.body}
        </div>
      </div>
    </DemoFrame>
  );
}

function CarouselDemo() {
  const slides = [
    { title: "1 / 3", body: "スライドして次のカードへ", tone: "bg-indigo-100 text-indigo-900" },
    { title: "2 / 3", body: "左右のボタンで移動できます", tone: "bg-emerald-100 text-emerald-900" },
    { title: "3 / 3", body: "最後まで来たら先頭へ戻ります", tone: "bg-amber-100 text-amber-900" },
  ];
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return (
    <DemoFrame hint="矢印で画像を切り替えます">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div
          className={cx("rounded-lg p-6 text-center transition-colors", slide.tone)}
          aria-live="polite"
        >
          <p className="text-xs font-semibold">{slide.title}</p>
          <p className="mt-2 text-sm font-medium">{slide.body}</p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndex((value) => (value - 1 + slides.length) % slides.length)}
            className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
          >
            ← 前へ
          </button>
          <div className="flex gap-1" aria-hidden="true">
            {slides.map((item, i) => (
              <span
                key={item.title}
                className={cx(
                  "h-1.5 w-1.5 rounded-full",
                  i === index ? "bg-brand-600" : "bg-slate-300",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((value) => (value + 1) % slides.length)}
            className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
          >
            次へ →
          </button>
        </div>
      </div>
    </DemoFrame>
  );
}

function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  const options = ["写真を撮る", "ライブラリから選ぶ", "ファイルを選ぶ"];

  return (
    <DemoFrame hint="画面下から選択肢が現れます">
      <div className="relative min-h-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">スマホでよく使われる選択UIです。</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          画像を追加
        </button>
        {open && (
          <div className="absolute inset-0">
            <button
              type="button"
              aria-label="閉じる"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full bg-slate-900/40"
            />
            <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-3 shadow-2xl">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" />
              <div className="flex flex-col">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function DropdownDemo() {
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <DemoFrame hint="項目を選ぶとその操作が実行されます">
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="focus-ring rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
          >
            操作 ▾
          </button>
          {open && (
            <div
              role="menu"
              className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
            >
              {["編集", "複製", "削除"].map((action) => (
                <button
                  key={action}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setLastAction(action);
                    setOpen(false);
                  }}
                  className="focus-ring block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500" aria-live="polite">
          {lastAction ? `「${lastAction}」を実行しました` : "まだ操作していません"}
        </p>
      </div>
    </DemoFrame>
  );
}

function SelectDemo() {
  const [value, setValue] = useState("medium");

  return (
    <DemoFrame hint="選んだ値が欄に残ります">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label htmlFor="demo-select" className="text-xs font-semibold text-slate-600">
          通知の頻度
        </label>
        <select
          id="demo-select"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="focus-ring mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="high">毎日</option>
          <option value="medium">週に1回</option>
          <option value="low">月に1回</option>
          <option value="off">受け取らない</option>
        </select>
        <p className="mt-2 text-xs text-slate-500">現在の設定: {value}</p>
      </div>
    </DemoFrame>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = useState<string[]>(["email"]);

  const toggle = (id: string) =>
    setChecked((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <DemoFrame hint="いくつでも同時に選べます">
      <fieldset className="rounded-xl border border-slate-200 bg-white p-4">
        <legend className="px-1 text-xs font-semibold text-slate-600">通知の種類</legend>
        <div className="mt-1 space-y-2">
          {[
            { id: "email", label: "メール" },
            { id: "push", label: "プッシュ通知" },
            { id: "sms", label: "SMS" },
          ].map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked.includes(option.id)}
                onChange={() => toggle(option.id)}
                className="h-4 w-4 accent-indigo-600"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">選択中: {checked.length}件</p>
      </fieldset>
    </DemoFrame>
  );
}

function RadioDemo() {
  const [value, setValue] = useState("standard");

  return (
    <DemoFrame hint="別の項目を選ぶと前の選択は外れます">
      <fieldset className="rounded-xl border border-slate-200 bg-white p-4">
        <legend className="px-1 text-xs font-semibold text-slate-600">配送方法</legend>
        <div className="mt-1 space-y-2">
          {[
            { id: "standard", label: "通常配送（無料）" },
            { id: "express", label: "速達（+500円）" },
            { id: "pickup", label: "店舗受け取り" },
          ].map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="shipping-demo"
                value={option.id}
                checked={value === option.id}
                onChange={() => setValue(option.id)}
                className="h-4 w-4 accent-indigo-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </DemoFrame>
  );
}

function ToggleSwitchDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <DemoFrame hint="つまみを動かして切り替えます">
      <div className="flex min-h-44 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <span className="text-sm">
          <span className="block font-semibold">自動保存</span>
          <span className="text-xs text-slate-500">{enabled ? "オン" : "オフ"}</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="自動保存"
          onClick={() => setEnabled((value) => !value)}
          className={cx(
            "focus-ring relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            enabled ? "bg-emerald-600" : "bg-slate-300",
          )}
        >
          <span
            className={cx(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>
    </DemoFrame>
  );
}

function SliderDemo() {
  const [value, setValue] = useState(40);

  return (
    <DemoFrame hint="つまみをドラッグして値を変えます">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label htmlFor="demo-slider" className="flex items-center justify-between text-xs font-semibold text-slate-600">
          音量
          <span className="tabular-nums text-slate-900">{value}</span>
        </label>
        <input
          id="demo-slider"
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="mt-3 h-2 w-full cursor-pointer accent-indigo-600"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </DemoFrame>
  );
}

function ProgressBarDemo() {
  const [value, setValue] = useState(30);

  return (
    <DemoFrame hint="進捗を押して値を進められます">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>アップロード中</span>
          <span className="tabular-nums">{value}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-label="アップロードの進捗"
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width]"
            style={{ width: `${value}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => setValue((current) => Math.min(100, current + 10))}
          className="focus-ring mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
        >
          +10%
        </button>
      </div>
    </DemoFrame>
  );
}

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  const id = useId();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <DemoFrame hint="読み込み終わると本物の内容に変わります">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {loading ? (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            <span className="sr-only">読み込み中</span>
            <div className={cx("h-4 w-2/3 animate-pulse rounded bg-slate-200")} />
            <div className={cx("h-3 w-full animate-pulse rounded bg-slate-200")} />
            <div className={cx("h-3 w-5/6 animate-pulse rounded bg-slate-200")} />
            <div className={cx("h-20 w-full animate-pulse rounded bg-slate-200")} />
          </div>
        ) : (
          <div>
            <p id={id} className="text-sm font-semibold">
              記事のタイトルが入ります
            </p>
            <p className="mt-1 text-xs text-slate-600">
              読み込みが終わると、灰色の枠が本来の内容に置き換わります。
            </p>
            <div className="mt-2 h-16 rounded-lg bg-brand-50" aria-hidden="true" />
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function BreadcrumbDemo() {
  const [current, setCurrent] = useState(2);
  const trail = ["ホーム", "製品", "詳細", "仕様"];

  return (
    <DemoFrame hint="途中の項目を押すとその階層に戻ります">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <nav aria-label="階層">
          <ol className="flex flex-wrap items-center gap-1 text-xs">
            {trail.map((label, index) => {
              const active = index === current;
              return (
                <li key={label} className="flex items-center gap-1">
                  {index > 0 && (
                    <span aria-hidden="true" className="text-slate-400">
                      /
                    </span>
                  )}
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setCurrent(index)}
                    className={cx(
                      "focus-ring rounded px-1 py-0.5",
                      active ? "font-bold text-slate-900" : "text-brand-700 hover:underline",
                    )}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <p className="mt-3 text-sm text-slate-600">現在の階層: {trail[current]}</p>
      </div>
    </DemoFrame>
  );
}

function PaginationDemo() {
  const total = 5;
  const [page, setPage] = useState(1);

  return (
    <DemoFrame hint="番号を押してページを移動します">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600" aria-live="polite">
          {page} / {total} ページ目を表示中
        </p>
        <nav aria-label="移動" className="mt-3 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className="focus-ring rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold disabled:opacity-40"
          >
            前へ
          </button>
          {Array.from({ length: total }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              type="button"
              aria-current={page === number ? "page" : undefined}
              onClick={() => setPage(number)}
              className={cx(
                "focus-ring min-w-8 rounded-lg border px-2 py-1 text-xs font-semibold",
                page === number
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 text-slate-700",
              )}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(total, value + 1))}
            disabled={page === total}
            className="focus-ring rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold disabled:opacity-40"
          >
            次へ
          </button>
        </nav>
      </div>
    </DemoFrame>
  );
}

const DEMOS: Record<string, () => React.JSX.Element> = {
  accordion: AccordionDemo,
  modal: ModalDemo,
  drawer: DrawerDemo,
  toast: ToastDemo,
  snackbar: SnackbarDemo,
  tooltip: TooltipDemo,
  popover: PopoverDemo,
  tabs: TabsDemo,
  carousel: CarouselDemo,
  bottomsheet: BottomSheetDemo,
  dropdown: DropdownDemo,
  select: SelectDemo,
  checkbox: CheckboxDemo,
  radio: RadioDemo,
  toggleswitch: ToggleSwitchDemo,
  slider: SliderDemo,
  progressbar: ProgressBarDemo,
  skeleton: SkeletonDemo,
  breadcrumb: BreadcrumbDemo,
  pagination: PaginationDemo,
};

export function UiDemo({ demoType }: { demoType: string }) {
  const Demo = DEMOS[demoType];
  if (!Demo) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        このデモは準備中です。
      </p>
    );
  }
  // keyで毎問の状態をリセットする。
  return <Demo />;
}
