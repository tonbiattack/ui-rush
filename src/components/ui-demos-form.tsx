"use client";

import { useId, useRef, useState } from "react";
import { DemoFrame } from "@/components/ui-demos";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const inputClass =
  "focus-ring w-full rounded-sm border border-rule-strong bg-surface px-2 py-1.5 text-sm";

const fieldClass =
  "focus-ring rounded-sm border border-rule-strong bg-surface px-2 py-1.5 text-sm";

const overlayShadow = "shadow-[0_10px_28px_-12px_rgba(22,25,26,0.45)]";

function MultiSelectDemo() {
  const options = ["月曜", "火曜", "水曜", "木曜", "金曜"];
  const [selected, setSelected] = useState<string[]>(["火曜", "木曜"]);
  const [open, setOpen] = useState(false);

  const toggle = (option: string) =>
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );

  return (
    <DemoFrame hint="欄を押すと一覧が開き、いくつでも選べます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <p className="text-xs font-bold text-ink-soft">参加できる曜日</p>
        <div className="mt-1">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="focus-ring flex w-full items-center justify-between gap-2 border border-rule-strong bg-surface px-2 py-1.5 text-left text-sm"
          >
            <span className={cx(selected.length === 0 && "text-muted")}>
              {selected.length === 0 ? "選んでください" : selected.join("・")}
            </span>
            <span aria-hidden="true" className="text-[10px] text-muted">
              ▾
            </span>
          </button>
          {open && (
            <ul className="mt-1 border border-rule-strong bg-surface">
              {options.map((option) => {
                const active = selected.includes(option);
                return (
                  <li key={option} className="border-b border-rule last:border-b-0">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(option)}
                      className="focus-ring flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-paper"
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          "flex h-3.5 w-3.5 shrink-0 items-center justify-center border text-[9px] leading-none",
                          active ? "border-ink bg-ink text-paper" : "border-rule-strong",
                        )}
                      >
                        {active ? "✓" : ""}
                      </span>
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {selected.length === 0 ? "まだ選ばれていません" : `${selected.length}件を選択中`}
        </p>
      </div>
    </DemoFrame>
  );
}

function TagsInputDemo() {
  const [tags, setTags] = useState(["請求", "至急"]);
  const [draft, setDraft] = useState("");
  const id = useId();

  const commit = () => {
    const value = draft.trim();
    if (value === "") {
      return;
    }
    setTags((current) => (current.includes(value) ? current : [...current, value]));
    setDraft("");
  };

  return (
    <DemoFrame hint="文字を入れて Enter を押すと、左に並びます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          キーワード
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 border border-rule-strong bg-surface p-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 border border-rule-strong bg-paper px-1.5 py-0.5 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                aria-label={`${tag}を外す`}
                className="focus-ring text-muted hover:text-wrong"
              >
                ×
              </button>
            </span>
          ))}
          <input
            id={id}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
            }}
            placeholder="入力して Enter"
            className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
          />
        </div>
        <p className="mt-2 text-[11px] text-muted">{tags.length}件を追加済みです</p>
      </div>
    </DemoFrame>
  );
}

const OTP_LENGTH = 6;
const OTP_POSITIONS = Array.from({ length: OTP_LENGTH }, (_, index) => index);

function OtpInputDemo() {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const code = digits.join("");
  const complete = digits.every((digit) => digit !== "");

  const write = (index: number, raw: string) => {
    const value = raw.replace(/[^0-9]/g, "").slice(-1);
    setDigits((current) => current.map((digit, i) => (i === index ? value : digit)));
    if (value !== "" && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  return (
    <DemoFrame hint="1桁ずつ入れると、次の欄へ自動で移ります">
      <div className="rounded-sm border border-rule bg-white p-4">
        <p className="text-xs font-bold text-ink-soft">確認コード</p>
        <div className="mt-2 flex gap-1.5">
          {OTP_POSITIONS.map((index) => (
            <input
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              value={digits[index]}
              inputMode="numeric"
              maxLength={1}
              aria-label={`${index + 1}桁目`}
              onChange={(event) => write(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && digits[index] === "" && index > 0) {
                  event.preventDefault();
                  setDigits((current) =>
                    current.map((value, i) => (i === index - 1 ? "" : value)),
                  );
                  refs.current[index - 1]?.focus();
                }
              }}
              className="focus-ring h-10 w-8 border border-rule-strong bg-surface text-center text-base font-bold tabular-nums"
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {complete
            ? `入力済み: ${code}`
            : `あと${digits.filter((digit) => digit === "").length}桁`}
        </p>
      </div>
    </DemoFrame>
  );
}

function PasswordFieldDemo() {
  const [value, setValue] = useState("sample-2026");
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <DemoFrame hint="右端のボタンで伏せ字を切り替えます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          合言葉
        </label>
        <div className="mt-1 flex items-stretch border border-rule-strong bg-surface">
          <input
            id={id}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="focus-ring w-full bg-transparent px-2 py-1.5 text-sm outline-none"
          />
          <button
            type="button"
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
            className="focus-ring shrink-0 border-l border-rule-strong px-2 text-[11px] font-bold"
          >
            {visible ? "隠す" : "表示"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {visible ? "入力した文字がそのまま見えています" : "文字は伏せ字で表示されています"}
        </p>
      </div>
    </DemoFrame>
  );
}

function NumberInputDemo() {
  const [draft, setDraft] = useState("3");
  const id = useId();
  const clamp = (next: number) => Math.min(20, Math.max(1, next));

  return (
    <DemoFrame hint="−と＋、または直接打ち込んで変えられます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          数量
        </label>
        <div className="mt-1 inline-flex items-stretch border border-rule-strong">
          <button
            type="button"
            aria-label="1減らす"
            onClick={() => setDraft(String(clamp((Number(draft) || 1) - 1)))}
            className="focus-ring px-3 py-1.5 text-sm font-bold hover:bg-paper"
          >
            −
          </button>
          <input
            id={id}
            type="number"
            min={1}
            max={20}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => setDraft(String(clamp(Number(draft) || 1)))}
            className="focus-ring w-14 border-x border-rule-strong bg-surface py-1.5 text-center text-sm font-bold tabular-nums outline-none"
          />
          <button
            type="button"
            aria-label="1増やす"
            onClick={() => setDraft(String(clamp((Number(draft) || 1) + 1)))}
            className="focus-ring px-3 py-1.5 text-sm font-bold hover:bg-paper"
          >
            ＋
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          1〜20の範囲で選べます。欄から外れると範囲に収まります。
        </p>
      </div>
    </DemoFrame>
  );
}

function TimeSelectDemo() {
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("30");
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <DemoFrame hint="時と分を別々に選びます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <p className="text-xs font-bold text-ink-soft">出発する時間</p>
        <div className="mt-2 flex items-center gap-1.5">
          <select
            aria-label="時"
            value={hour}
            onChange={(event) => setHour(event.target.value)}
            className={fieldClass}
          >
            {hours.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className="text-sm font-bold">
            :
          </span>
          <select
            aria-label="分"
            value={minute}
            onChange={(event) => setMinute(event.target.value)}
            className={fieldClass}
          >
            {minutes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          出発は {hour}:{minute} です
        </p>
      </div>
    </DemoFrame>
  );
}

function RangePickerDemo() {
  const [start, setStart] = useState("2026-11-18");
  const [end, setEnd] = useState("2026-11-22");
  const id = useId();
  const startTime = Date.parse(start);
  const endTime = Date.parse(end);
  const valid =
    Number.isFinite(startTime) && Number.isFinite(endTime) && endTime >= startTime;
  const nights = valid ? Math.round((endTime - startTime) / 86_400_000) : 0;

  return (
    <DemoFrame hint="開始と終了を選ぶと日数が出ます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor={`${id}-start`} className="block text-xs font-bold text-ink-soft">
              開始
            </label>
            <input
              id={`${id}-start`}
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={cx(fieldClass, "mt-1")}
            />
          </div>
          <div>
            <label htmlFor={`${id}-end`} className="block text-xs font-bold text-ink-soft">
              終了
            </label>
            <input
              id={`${id}-end`}
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className={cx(fieldClass, "mt-1")}
            />
          </div>
        </div>
        <p className={cx("mt-2 text-[11px]", valid ? "text-muted" : "text-wrong")}>
          {valid
            ? `${nights + 1}日間（${nights}泊）`
            : "終了が開始より前になっています"}
        </p>
      </div>
    </DemoFrame>
  );
}

function FileUploadDemo() {
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DemoFrame hint="押して選ぶと、選んだ資料が下に並びます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <p className="text-xs font-bold text-ink-soft">添付する資料</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="focus-ring mt-2 inline-flex items-center gap-1.5 border border-rule-strong px-3 py-1.5 text-xs font-bold hover:bg-paper"
        >
          <span aria-hidden="true">＋</span> 資料を選ぶ
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            const list = event.target.files;
            const picked = list
              ? Array.from(list).map((file) => ({ name: file.name, size: file.size }))
              : [];
            setFiles((current) => [...current, ...picked]);
            event.target.value = "";
          }}
        />
        {files.length === 0 ? (
          <p className="mt-2 text-[11px] text-muted">まだ選ばれていません</p>
        ) : (
          <ul className="mt-2 divide-y divide-rule border border-rule">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 px-2 py-1 text-xs"
              >
                <span className="truncate">{file.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[11px] tabular-nums text-muted">
                    {Math.max(1, Math.round(file.size / 1024))} KB
                  </span>
                  <button
                    type="button"
                    aria-label={`${file.name}を外す`}
                    onClick={() =>
                      setFiles((current) => current.filter((_, i) => i !== index))
                    }
                    className="focus-ring text-muted hover:text-wrong"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DemoFrame>
  );
}

function FieldsetDemo() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const id = useId();

  return (
    <DemoFrame hint="項目をまとまりごとに囲み、見出しを付けます">
      <div className="space-y-2 rounded-sm border border-rule bg-white p-4">
        <fieldset className="border border-rule-strong px-3 pb-3 pt-1">
          <legend className="px-1 text-xs font-bold text-ink-soft">連絡先</legend>
          <label htmlFor={`${id}-name`} className="block text-[11px] text-muted">
            氏名
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="山田 太郎"
            className={cx(inputClass, "mt-0.5")}
          />
          <label htmlFor={`${id}-phone`} className="mt-2 block text-[11px] text-muted">
            電話番号
          </label>
          <input
            id={`${id}-phone`}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="090-0000-0000"
            className={cx(inputClass, "mt-0.5")}
          />
        </fieldset>
        <fieldset className="border border-rule-strong px-3 pb-3 pt-1">
          <legend className="px-1 text-xs font-bold text-ink-soft">届け先</legend>
          <label htmlFor={`${id}-zip`} className="block text-[11px] text-muted">
            郵便番号
          </label>
          <input
            id={`${id}-zip`}
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            placeholder="100-0001"
            className={cx(inputClass, "mt-0.5")}
          />
        </fieldset>
      </div>
    </DemoFrame>
  );
}

function HelperTextDemo() {
  const [value, setValue] = useState("");
  const id = useId();
  const helperId = `${id}-helper`;

  return (
    <DemoFrame hint="欄の下に、迷わないための補足を添えます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          ユーザーID
        </label>
        <input
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-describedby={helperId}
          placeholder="yamada_taro"
          className={cx(inputClass, "mt-1")}
        />
        <p id={helperId} className="mt-1 text-[11px] leading-snug text-muted">
          半角英数字とアンダースコアで8文字以上。あとから変更できません。
        </p>
        <p className="mt-2 text-[11px] tabular-nums text-muted">{value.length}文字</p>
      </div>
    </DemoFrame>
  );
}

function InlineValidationDemo() {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const showError = touched && !valid;

  return (
    <DemoFrame hint="入力すると、その場で誤りを知らせます">
      <div className="rounded-sm border border-rule bg-white p-4">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">
          メールアドレス
        </label>
        <input
          id={id}
          type="email"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          placeholder="you@example.com"
          className={cx(
            "focus-ring mt-1 w-full rounded-sm border bg-surface px-2 py-1.5 text-sm",
            showError ? "border-wrong" : "border-rule-strong",
          )}
        />
        {showError ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1 flex items-start gap-1 text-[11px] text-wrong"
          >
            <span aria-hidden="true" className="font-bold">
              !
            </span>
            @ の前後を含む形式で入力してください。
          </p>
        ) : valid ? (
          <p className="mt-1 flex items-start gap-1 text-[11px] text-correct">
            <span aria-hidden="true" className="font-bold">
              ✓
            </span>
            この形式で送信できます。
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-muted">入力すると、その場で確かめます。</p>
        )}
      </div>
    </DemoFrame>
  );
}

function CheckboxGroupDemo() {
  const options = [
    { id: "news", label: "新着情報" },
    { id: "event", label: "イベントの案内" },
    { id: "survey", label: "アンケートのお願い" },
  ];
  const [checked, setChecked] = useState<string[]>(["news"]);
  const allChecked = checked.length === options.length;

  const toggle = (id: string) =>
    setChecked((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <DemoFrame hint="各項目を、入れる・外すで切り替えます">
      <fieldset className="rounded-sm border border-rule bg-white p-4">
        <legend className="px-1 text-xs font-bold text-ink-soft">受け取る内容</legend>
        <div className="mt-1 space-y-1.5">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked.includes(option.id)}
                onChange={() => toggle(option.id)}
                className="h-4 w-4 accent-ink"
              />
              {option.label}
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-rule pt-2">
          <p className="text-[11px] text-muted">{checked.length}件を選択中</p>
          <button
            type="button"
            onClick={() =>
              setChecked(allChecked ? [] : options.map((option) => option.id))
            }
            className="focus-ring text-[11px] underline underline-offset-2"
          >
            {allChecked ? "すべて外す" : "すべて選ぶ"}
          </button>
        </div>
      </fieldset>
    </DemoFrame>
  );
}

function PopConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("下書きのメモが1件あります");

  return (
    <DemoFrame hint="押すと、その場に小さな確認が出ます">
      <div className="relative min-h-40 rounded-sm border border-rule bg-white p-4">
        <div className="flex items-center justify-between gap-2 border-b border-rule pb-2">
          <span className="text-sm">下書きのメモ</span>
          <div className="relative">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
              className="focus-ring border border-rule-strong px-2 py-1 text-[11px] font-bold hover:bg-paper"
            >
              削除
            </button>
            {open && (
              <div
                role="dialog"
                aria-label="削除の確認"
                className={cx(
                  "absolute right-0 top-full z-10 mt-1 w-48 border border-rule-strong bg-surface p-2",
                  overlayShadow,
                )}
              >
                <p className="text-xs font-bold">この下書きを削除しますか？</p>
                <p className="mt-0.5 text-[11px] text-muted">元に戻せません。</p>
                <div className="mt-2 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="focus-ring border border-rule-strong px-2 py-0.5 text-[11px]"
                  >
                    やめる
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setStatus("下書きを削除しました");
                    }}
                    className="focus-ring bg-wrong px-2 py-0.5 text-[11px] font-bold text-paper"
                  >
                    削除する
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted">{status}</p>
      </div>
    </DemoFrame>
  );
}

function SamplePhoto({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" role="img" aria-label="見本の画像" className={className}>
      <rect width="120" height="80" fill="var(--color-paper)" />
      <circle cx="94" cy="20" r="8" fill="var(--color-muted)" />
      <path d="M0 80 L32 36 L56 62 L74 44 L120 80 Z" fill="var(--color-rule-strong)" />
      <path d="M0 80 L24 54 L46 80 Z" fill="var(--color-ink-soft)" />
      <rect
        x="0.5"
        y="0.5"
        width="119"
        height="79"
        fill="none"
        stroke="var(--color-rule-strong)"
      />
    </svg>
  );
}

function LightboxDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoFrame hint="押すと大きく表示されます">
      <div className="relative min-h-44 overflow-hidden rounded-sm border border-rule bg-white p-4">
        <p className="text-xs text-muted">見本の画像</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="画像を大きく表示"
          className="focus-ring mt-2 block border border-rule-strong"
        >
          <SamplePhoto className="h-16 w-24" />
        </button>
        {open && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70 p-4">
            <button
              type="button"
              aria-label="拡大表示を閉じる"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full"
            />
            <div className="relative">
              <SamplePhoto className="h-32 w-48 border border-rule-strong" />
              <button
                autoFocus
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="focus-ring absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border border-ink bg-surface text-xs font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function CoachmarkDemo() {
  const steps = [
    {
      title: "ここから作成します",
      body: "右上のボタンを押すと、新しいメモが増えます。",
      panel: "right-3 top-14 w-52",
      arrow: "-top-2 right-6",
    },
    {
      title: "増えたメモはここに並びます",
      body: "行を押すと、そのメモを選んだ状態になります。",
      panel: "bottom-3 right-3 w-52",
      arrow: "-top-2 right-6",
    },
  ];
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const [memos, setMemos] = useState(["買い物リスト", "打ち合わせの議題"]);
  const [active, setActive] = useState<string | null>(null);
  const current = steps[step];

  return (
    <DemoFrame hint="対象を指して、次にすることを案内します">
      <div className="relative min-h-64 rounded-sm border border-rule bg-white p-4">
        <div className="flex items-center justify-between gap-2 border-b border-rule pb-2">
          <span className="text-sm font-bold">メモ一覧</span>
          <button
            type="button"
            onClick={() => {
              setMemos((currentMemos) => [
                `新しいメモ ${currentMemos.length + 1}`,
                ...currentMemos,
              ]);
              setStep(1);
            }}
            className={cx(
              "focus-ring border px-2 py-1 text-[11px] font-bold",
              open && step === 0 ? "border-ink bg-paper" : "border-rule-strong",
            )}
          >
            ＋ 新規作成
          </button>
        </div>
        <ul className="mt-2 max-h-20 space-y-0.5 overflow-auto">
          {memos.map((memo) => (
            <li key={memo}>
              <button
                type="button"
                onClick={() => setActive(memo)}
                aria-pressed={active === memo}
                className={cx(
                  "focus-ring block w-full border px-1.5 py-1 text-left text-xs",
                  active === memo
                    ? "border-ink bg-ink text-paper"
                    : "border-transparent hover:border-rule-strong",
                )}
              >
                {memo}
              </button>
            </li>
          ))}
        </ul>
        {open && (
          <div
            className={cx(
              "absolute z-10 border border-ink bg-surface p-2",
              current.panel,
              overlayShadow,
            )}
          >
            <p
              aria-hidden="true"
              className={cx("absolute text-xs leading-none text-ink", current.arrow)}
            >
              ▲
            </p>
            <p className="text-xs font-bold">{current.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{current.body}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] tabular-nums text-muted">
                {step + 1} / {steps.length}
              </span>
              <span className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="focus-ring text-[11px] underline underline-offset-2"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (step === steps.length - 1) {
                      setOpen(false);
                    } else {
                      setStep(step + 1);
                    }
                  }}
                  className="focus-ring bg-ink px-2 py-0.5 text-[11px] font-bold text-paper"
                >
                  {step === steps.length - 1 ? "完了" : "次へ"}
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

function NotificationDemo() {
  const [notices, setNotices] = useState([
    { id: 1, text: "新しいコメントが届きました", time: "5分前", read: false },
    { id: 2, text: "週次のまとめを公開しました", time: "1時間前", read: true },
  ]);
  const [nextId, setNextId] = useState(3);
  const unread = notices.filter((notice) => !notice.read).length;

  return (
    <DemoFrame hint="受け取った内容が一覧に溜まります">
      <div className="rounded-sm border border-rule bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
            受信箱
            {unread > 0 && (
              <span className="min-w-4 border border-wrong px-1 text-center text-[10px] font-bold leading-4 text-wrong">
                {unread}
              </span>
            )}
          </p>
          <span className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                setNotices((current) => [
                  {
                    id: nextId,
                    text: "新しいメッセージが届きました",
                    time: "たった今",
                    read: false,
                  },
                  ...current,
                ]);
                setNextId((value) => value + 1);
              }}
              className="focus-ring border border-rule-strong px-2 py-0.5 text-[11px] font-bold"
            >
              受け取る
            </button>
            <button
              type="button"
              onClick={() =>
                setNotices((current) =>
                  current.map((notice) => ({ ...notice, read: true })),
                )
              }
              className="focus-ring text-[11px] underline underline-offset-2"
            >
              すべて既読
            </button>
          </span>
        </div>
        <ul className="mt-2 max-h-32 divide-y divide-rule overflow-auto border border-rule">
          {notices.map((notice) => (
            <li key={notice.id}>
              <button
                type="button"
                onClick={() =>
                  setNotices((current) =>
                    current.map((item) =>
                      item.id === notice.id ? { ...item, read: true } : item,
                    ),
                  )
                }
                className="focus-ring flex w-full items-start gap-2 px-2 py-1.5 text-left hover:bg-paper"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                    notice.read ? "bg-rule-strong" : "bg-wrong",
                  )}
                />
                <span className="min-w-0">
                  <span
                    className={cx(
                      "block text-xs",
                      notice.read ? "text-muted" : "font-bold",
                    )}
                  >
                    {notice.text}
                  </span>
                  <span className="block text-[10px] text-muted">{notice.time}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </DemoFrame>
  );
}

function SheetDemo() {
  const [open, setOpen] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(true);
  const [sort, setSort] = useState("新しい順");

  return (
    <DemoFrame hint="右端から、絞り込みの画面が重なって出ます">
      <div className="relative min-h-44 overflow-hidden rounded-sm border border-rule bg-white">
        <div className="p-4">
          <p className="text-sm text-ink-soft">一覧の絞り込みは、右から出る画面で行います。</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            className="focus-ring mt-3 border border-rule-strong px-3 py-1.5 text-xs font-bold hover:bg-paper"
          >
            絞り込みを開く
          </button>
          <p className="mt-2 text-[11px] text-muted">
            未読のみ: {onlyUnread ? "オン" : "オフ"} / {sort}
          </p>
        </div>
        {open && (
          <div className="absolute inset-0">
            <button
              type="button"
              aria-label="閉じる"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full bg-ink/40"
            />
            <div className="absolute inset-y-0 right-0 flex w-48 flex-col gap-2 border-l border-rule-strong bg-surface p-3">
              <p className="text-xs font-bold">絞り込み</p>
              <label className="flex items-center justify-between gap-2 text-xs">
                未読のみ
                <input
                  type="checkbox"
                  checked={onlyUnread}
                  onChange={() => setOnlyUnread((value) => !value)}
                  className="h-4 w-4 accent-ink"
                />
              </label>
              <label className="text-xs">
                並び順
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className={cx(fieldClass, "mt-1 w-full")}
                >
                  <option>新しい順</option>
                  <option>古い順</option>
                </select>
              </label>
              <button
                autoFocus
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring mt-auto border border-rule-strong px-2 py-1.5 text-xs font-bold"
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

export const FORM_DEMOS: Record<string, () => React.JSX.Element> = {
  multiselect: MultiSelectDemo,
  tagsinput: TagsInputDemo,
  otpinput: OtpInputDemo,
  passwordfield: PasswordFieldDemo,
  numberinput: NumberInputDemo,
  timeselect: TimeSelectDemo,
  rangepicker: RangePickerDemo,
  fileupload: FileUploadDemo,
  fieldset: FieldsetDemo,
  helpertext: HelperTextDemo,
  inlinevalidation: InlineValidationDemo,
  checkboxgroup: CheckboxGroupDemo,
  popconfirm: PopConfirmDemo,
  lightbox: LightboxDemo,
  coachmark: CoachmarkDemo,
  notification: NotificationDemo,
  sheet: SheetDemo,
};
