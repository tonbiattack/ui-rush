"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useHistory } from "@/lib/use-history";
import { useSettings, saveSettings } from "@/lib/use-settings";
import { totalAnswered, weakQuestionIds, type History } from "@/lib/history";
import {
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  type QuestionCount,
  type TimeLimitSec,
} from "@/lib/quiz";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

function OptionGroup<T extends number>({
  label,
  description,
  options,
  value,
  onChange,
  suffix,
}: {
  label: string;
  description: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  suffix: string;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <legend className="px-1 text-sm font-bold">{label}</legend>
      <p className="mb-2 text-xs text-slate-500">{description}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cx(
              "focus-ring rounded-xl border-2 px-2 py-3 text-center transition-colors",
              value === option
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
            )}
          >
            <span className="block text-lg font-bold tabular-nums">{option}</span>
            <span className="block text-[11px] font-medium">{suffix}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function sumStat(history: History, key: "correct" | "incorrect" | "timeout"): number {
  return Object.values(history.stats).reduce((sum, stat) => sum + stat[key], 0);
}

function HistorySummary({
  history,
  onClear,
}: {
  history: History;
  onClear: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const answered = totalAnswered(history);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold">学習履歴</h2>
        <span className="text-xs text-slate-500">{answered}問ぶんの記録</span>
      </div>

      {answered > 0 ? (
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 px-2 py-2">
            <dt className="text-[11px] text-slate-500">正解</dt>
            <dd className="text-lg font-bold tabular-nums text-emerald-700">
              {sumStat(history, "correct")}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-2">
            <dt className="text-[11px] text-slate-500">不正解</dt>
            <dd className="text-lg font-bold tabular-nums text-red-700">
              {sumStat(history, "incorrect")}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-2">
            <dt className="text-[11px] text-slate-500">時間切れ</dt>
            <dd className="text-lg font-bold tabular-nums text-amber-700">
              {sumStat(history, "timeout")}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          まだ記録がありません。まずは1セッション挑戦してみましょう。
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href="/terms"
          className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
        >
          用語一覧
        </Link>
        {answered > 0 && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="focus-ring rounded-lg px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            履歴を削除
          </button>
        )}
        {confirming && (
          <span className="flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-800">
            本当に削除しますか？
            <button
              type="button"
              onClick={() => {
                onClear();
                setConfirming(false);
              }}
              className="focus-ring rounded bg-red-600 px-2 py-1 font-bold text-white"
            >
              削除する
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="focus-ring rounded px-2 py-1 font-semibold"
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

  // 画面上の選択はローカルに持ち、開始時に保存する。
  const [timeOverride, setTimeOverride] = useState<TimeLimitSec | null>(null);
  const [countOverride, setCountOverride] = useState<QuestionCount | null>(null);

  const timeLimitSec = timeOverride ?? settings.time;
  const questionCount = countOverride ?? settings.count;
  const weakCount = useMemo(() => weakQuestionIds(history).length, [history]);

  const changeTime = (value: TimeLimitSec) => {
    setTimeOverride(value);
    saveSettings({ time: value, count: questionCount });
  };
  const changeCount = (value: QuestionCount) => {
    setCountOverride(value);
    saveSettings({ time: timeLimitSec, count: value });
  };

  const start = (mode: "normal" | "review") => {
    saveSettings({ time: timeLimitSec, count: questionCount });
    router.push(`/quiz?count=${questionCount}&time=${timeLimitSec}&mode=${mode}`);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          UI Rush
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">UI用語を、数秒で。</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          操作できるUIデモを見て、名前を4択で答えるクイズです。1問3〜8秒。スマホでもPCでも、すきま時間にどうぞ。
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <OptionGroup
          label="制限時間"
          description="1問あたりの秒数。0秒になると時間切れ（不正解）です。"
          options={TIME_LIMIT_OPTIONS}
          value={timeLimitSec}
          onChange={changeTime}
          suffix="秒"
        />
        <OptionGroup
          label="出題数"
          description="1セッションの問題数。問題は重複せずシャッフルされます。"
          options={QUESTION_COUNT_OPTIONS}
          value={questionCount}
          onChange={changeCount}
          suffix="問"
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => start("normal")}
          className="focus-ring rounded-2xl bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-700"
        >
          クイズを始める
          <span className="ml-2 text-xs font-semibold opacity-90">
            {questionCount}問・{timeLimitSec}秒
          </span>
        </button>
        <button
          type="button"
          onClick={() => start("review")}
          disabled={weakCount === 0}
          className="focus-ring rounded-2xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          苦手を復習する
          <span className="ml-2 text-xs font-medium text-slate-500">
            {weakCount === 0 ? "苦手な問題はまだありません" : `${weakCount}問が対象`}
          </span>
        </button>
      </div>

      <HistorySummary history={history} onClear={clear} />

      <p className="mt-auto pt-2 text-center text-[11px] leading-relaxed text-slate-500">
        ログイン不要・データはこのブラウザにだけ保存されます。
      </p>
    </main>
  );
}
