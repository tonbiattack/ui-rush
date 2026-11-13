"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useHistory } from "@/lib/use-history";
import { useSettings, saveSettings } from "@/lib/use-settings";
import { totalAnswered, weakQuestionIds, type History } from "@/lib/history";
import { CONFUSABLE_PAIRS, QUESTIONS } from "@/lib/questions";
import {
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  type QuestionCount,
  type QuizMode,
  type RevealMode,
  type TimeLimitSec,
} from "@/lib/quiz";
import { ChoiceTile, Figure, Masthead, SectionHead, SpecRow } from "@/components/ui-kit";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

function SettingOptions<T extends number>({
  options,
  value,
  onChange,
  suffix,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  suffix: string;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {options.map((option) => (
        <ChoiceTile key={option} selected={value === option} onClick={() => onChange(option)}>
          <Figure value={option} unit={suffix} size="sm" />
        </ChoiceTile>
      ))}
    </div>
  );
}

function HistorySummary({ history, onClear }: { history: History; onClear: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const answered = totalAnswered(history);
  const sum = (key: "correct" | "incorrect" | "timeout") =>
    Object.values(history.stats).reduce((total, stat) => total + stat[key], 0);

  return (
    <section aria-label="学習履歴" className="mt-8">
      <SectionHead
        title="これまでの記録"
        note={answered === 0 ? "まだ記録がありません" : `${answered}問ぶん`}
      />
      {answered > 0 ? (
        <dl className="grid grid-cols-3 divide-x divide-rule border-b border-rule">
          {(
            [
              { key: "correct", label: "正解", color: "text-correct" },
              { key: "incorrect", label: "不正解", color: "text-wrong" },
              { key: "timeout", label: "時間切れ", color: "text-timeout" },
            ] as const
          ).map((item) => (
            <div key={item.key} className="px-3 py-3 first:pl-0">
              <dt className="text-[11px] text-muted">{item.label}</dt>
              <dd className={cx("mt-0.5", item.color)}>
                <Figure value={sum(item.key)} size="sm" />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="border-b border-rule py-3 text-sm text-muted">
          1セッション終えると、用語ごとの正解・不正解・時間切れがここに溜まります。
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <Link href="/terms" className="focus-ring font-bold underline underline-offset-4">
          用語図鑑をひらく
        </Link>
        {answered > 0 && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="focus-ring text-muted underline underline-offset-4 hover:text-wrong"
          >
            履歴を削除
          </button>
        )}
        {confirming && (
          <span className="flex flex-wrap items-center gap-2 text-wrong">
            本当に削除しますか。
            <button
              type="button"
              onClick={() => {
                onClear();
                setConfirming(false);
              }}
              className="focus-ring border border-wrong bg-wrong px-2 py-1 font-bold text-paper"
            >
              削除する
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="focus-ring underline underline-offset-4"
            >
              やめる
            </button>
          </span>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { history, clear } = useHistory();
  const settings = useSettings();

  const [timeOverride, setTimeOverride] = useState<TimeLimitSec | null>(null);
  const [countOverride, setCountOverride] = useState<QuestionCount | null>(null);
  const [revealOverride, setRevealOverride] = useState<RevealMode | null>(null);

  const timeLimitSec = timeOverride ?? settings.time;
  const questionCount = countOverride ?? settings.count;
  const revealMode = revealOverride ?? settings.reveal;
  const weakCount = useMemo(() => weakQuestionIds(history).length, [history]);

  const save = (next: { time?: TimeLimitSec; count?: QuestionCount; reveal?: RevealMode }) =>
    saveSettings({
      time: next.time ?? timeLimitSec,
      count: next.count ?? questionCount,
      reveal: next.reveal ?? revealMode,
    });

  const start = (mode: QuizMode) => {
    save({});
    const count = mode === "confusable" ? CONFUSABLE_PAIRS.length * 2 : questionCount;
    router.push(`/quiz?count=${count}&time=${timeLimitSec}&mode=${mode}&reveal=${revealMode}`);
  };

  return (
    <main className="flex flex-1 flex-col">
      <Masthead right={<span className="instrument">{QUESTIONS.length}語</span>} />

      <section className="border-b border-ink pb-6">
        <h1 className="text-[clamp(1.45rem,4.6vw,2.4rem)] font-bold leading-[1.3] tracking-tight">
          UI用語クイズ
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          操作できるデモが1問ずつ出ます。4択で名前を答えてください。
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          正誤表示のあとに、その用語を使ったAIへの指示例が出ます。
        </p>
        <dl className="mt-5 grid max-w-md grid-cols-3 divide-x divide-rule border-y border-rule">
          {[
            { value: "20", unit: "語", label: "収録" },
            { value: "3–8", unit: "秒", label: "1問の制限" },
            { value: "5", unit: "組", label: "呼び分け特訓" },
          ].map((item) => (
            <div key={item.label} className="px-3 py-2 first:pl-0">
              <dt className="text-[10px] text-muted">{item.label}</dt>
              <dd className="mt-0.5">
                <Figure value={item.value} unit={item.unit} size="sm" />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="設定" className="mt-6">
        <SectionHead title="今日の設定" note="開始時に保存されます" />
        <SpecRow label="制限時間" hint="0秒で時間切れ（不正解）">
          <SettingOptions
            options={TIME_LIMIT_OPTIONS}
            value={timeLimitSec}
            onChange={(value) => {
              setTimeOverride(value);
              save({ time: value });
            }}
            suffix="秒"
            label="制限時間"
          />
        </SpecRow>
        <SpecRow label="出題数" hint="重複なしでシャッフル">
          <SettingOptions
            options={QUESTION_COUNT_OPTIONS}
            value={questionCount}
            onChange={(value) => {
              setCountOverride(value);
              save({ count: value });
            }}
            suffix="問"
            label="出題数"
          />
        </SpecRow>
        <SpecRow label="正誤のあと" hint="表示中はタイマーが止まります">
          <div role="group" aria-label="正誤表示のあと" className="flex gap-2">
            <ChoiceTile
              selected={revealMode === "manual"}
              onClick={() => {
                setRevealOverride("manual");
                save({ reveal: "manual" });
              }}
            >
              自分で次へ
            </ChoiceTile>
            <ChoiceTile
              selected={revealMode === "auto"}
              onClick={() => {
                setRevealOverride("auto");
                save({ reveal: "auto" });
              }}
            >
              5秒で自動
            </ChoiceTile>
          </div>
        </SpecRow>
      </section>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => start("normal")}
          className="focus-ring flex items-baseline justify-between gap-3 bg-ink px-5 py-4 text-left text-paper transition-colors hover:bg-ink-soft"
        >
          <span className="text-base font-bold">クイズを始める</span>
          <span className="instrument text-xs text-paper/70">
            {questionCount}問 / {timeLimitSec}秒
          </span>
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => start("confusable")}
            className="focus-ring flex flex-col items-start gap-0.5 border border-ink bg-surface px-4 py-3 text-left transition-colors hover:bg-ink hover:text-paper"
          >
            <span className="text-sm font-bold">呼び分け特訓</span>
            <span className="text-[11px] opacity-70">
              似たUIを2択で {CONFUSABLE_PAIRS.length * 2}問
            </span>
          </button>
          <button
            type="button"
            onClick={() => start("review")}
            disabled={weakCount === 0}
            className="focus-ring flex flex-col items-start gap-0.5 border border-rule-strong bg-surface px-4 py-3 text-left transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="text-sm font-bold">苦手を復習</span>
            <span className="text-[11px] opacity-70">
              {weakCount === 0 ? "まだ対象がありません" : `${weakCount}問が対象`}
            </span>
          </button>
        </div>
      </div>

      <HistorySummary history={history} onClear={clear} />

      <p className="mt-auto pt-8 text-[11px] text-muted">
        ログイン不要。記録はこのブラウザにだけ残ります。
      </p>
    </main>
  );
}
