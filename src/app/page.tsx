"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "@/lib/use-history";
import { useSettings, saveSettings, type Settings } from "@/lib/use-settings";
import { bestScoreFor, scoreKey, useBestScores } from "@/lib/use-best-scores";
import { dueCount, totalAnswered, weakQuestionIds, type History } from "@/lib/history";
import { CONFUSABLE_PAIRS, KEYBOARD_QUESTIONS, QUESTIONS } from "@/lib/questions";
import {
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  type QuizMode,
} from "@/lib/quiz";
import { BASE_POINTS, COMBO_BONUS_MAX, COMBO_STEP, SPEED_BONUS_MAX } from "@/lib/score";
import {
  ChoiceTile,
  Disclosure,
  Figure,
  Masthead,
  SectionHead,
  SpecRow,
} from "@/components/ui-kit";

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
        <Link prefetch={false} href="/terms" className="focus-ring font-bold underline underline-offset-4">
          用語図鑑をひらく
        </Link>
        <Link prefetch={false} href="/dictionary" className="focus-ring text-muted underline underline-offset-4 hover:text-ink">
          用語と別名
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

  // 設定は1つのまとまりとして持つ。3つに分けると、同じ描画内で複数押したときに
  // 古い値で上書きされる（連打で設定が戻る）。
  const [overrides, setOverrides] = useState<Partial<Settings>>({});
  const timeLimitSec = overrides.time ?? settings.time;
  const questionCount = overrides.count ?? settings.count;
  const revealMode = overrides.reveal ?? settings.reveal;

  const weakCount = useMemo(() => weakQuestionIds(history).length, [history]);
  const reviewDue = useMemo(() => dueCount(history), [history]);
  const best = useBestScores();
  const normalBest = bestScoreFor(best, scoreKey("normal", questionCount, timeLimitSec));

  // 直前の状態を関数形式で受け取るので、連続で押しても取りこぼさない。
  const update = (patch: Partial<Settings>) =>
    setOverrides((previous) => ({
      time: patch.time ?? previous.time ?? settings.time,
      count: patch.count ?? previous.count ?? settings.count,
      reveal: patch.reveal ?? previous.reveal ?? settings.reveal,
    }));

  // 変更を保存する。描画のたびに走らせず、設定が変わったときだけ書く。
  useEffect(() => {
    if (Object.keys(overrides).length === 0) {
      return;
    }
    saveSettings({
      time: overrides.time ?? settings.time,
      count: overrides.count ?? settings.count,
      reveal: overrides.reveal ?? settings.reveal,
    });
  }, [overrides, settings.time, settings.count, settings.reveal]);

  const start = (mode: QuizMode) => {
    const count = mode === "confusable" ? CONFUSABLE_PAIRS.length * 2 : questionCount;
    router.push(`/quiz?count=${count}&time=${timeLimitSec}&mode=${mode}&reveal=${revealMode}`);
  };

  return (
    <main className="flex flex-1 flex-col">
      <Masthead right={<span className="instrument">{QUESTIONS.length}語</span>} />

      <section className="border-b border-ink pb-5">
        <h1 className="text-[clamp(1.45rem,4.6vw,2.4rem)] font-bold leading-[1.3] tracking-tight">
          UI用語クイズ
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          操作できるデモが1問ずつ出ます。4択で名前を答えてください。
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          早く答えるほど得点が高くなります。正誤表示のあとに、その用語を使ったAIへの指示例が出ます。
        </p>
      </section>

      {/* 開始導線は最初の画面に置く。設定と決まりごとは下へ退避する。 */}
      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => start("normal")}
          className="focus-ring flex items-baseline justify-between gap-3 bg-ink px-5 py-4 text-left text-paper transition-colors hover:bg-ink-soft"
        >
          <span className="text-base font-bold">クイズを始める</span>
          <span className="instrument text-xs text-paper/70">
            {questionCount}問 / {timeLimitSec}秒
            {normalBest > 0 ? ` / ベスト ${normalBest}点` : ""}
          </span>
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => start("reverse")}
            className="focus-ring flex flex-col items-start gap-0.5 border border-ink bg-surface px-4 py-3 text-left transition-colors hover:bg-ink hover:text-paper"
          >
            <span className="text-sm font-bold">逆引き</span>
            <span className="text-[11px] opacity-70">
              作りたい動きから名称を答える {questionCount}問
            </span>
          </button>
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
            onClick={() => start("keyboard")}
            className="focus-ring flex flex-col items-start gap-0.5 border border-rule-strong bg-surface px-4 py-3 text-left transition-colors hover:border-ink"
          >
            <span className="text-sm font-bold">キーボード操作</span>
            <span className="text-[11px] opacity-70">
              Tab・Esc などの基本操作 {KEYBOARD_QUESTIONS.length}問
            </span>
          </button>
          <button
            type="button"
            onClick={() => start("spotlight")}
            className="focus-ring flex flex-col items-start gap-0.5 border border-rule-strong bg-surface px-4 py-3 text-left transition-colors hover:border-ink"
          >
            <span className="text-sm font-bold">UIパーツ探し</span>
            <span className="text-[11px] opacity-70">
              模擬画面から部品を押して答える 10問
            </span>
          </button>
          <button
            type="button"
            onClick={() => start("timeattack")}
            className="focus-ring flex flex-col items-start gap-0.5 border border-rule-strong bg-surface px-4 py-3 text-left transition-colors hover:border-ink"
          >
            <span className="text-sm font-bold">60秒タイムアタック</span>
            <span className="text-[11px] opacity-70">
              60秒で何問正解できるか
              {best.timeAttack > 0 ? `（ベスト ${best.timeAttack}問）` : ""}
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
          <button
            type="button"
            onClick={() => start("spaced")}
            disabled={reviewDue === 0}
            className="focus-ring flex flex-col items-start gap-0.5 border border-rule-strong bg-surface px-4 py-3 text-left transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-45 sm:col-span-2"
          >
            <span className="text-sm font-bold">今日の復習</span>
            <span className="text-[11px] opacity-70">
              {reviewDue === 0
                ? "今日が期限の用語はありません"
                : `${reviewDue}語が復習の期限です`}
            </span>
          </button>
        </div>
      </div>

      <section aria-label="設定" className="mt-6">
        <Disclosure
          title="今日の設定"
          note={`${questionCount}問・${timeLimitSec}秒・${revealMode === "auto" ? "自動で次へ" : "自分で次へ"}`}
        >
          <SpecRow label="制限時間" hint="0秒で時間切れ（不正解）">
            <SettingOptions
              options={TIME_LIMIT_OPTIONS}
              value={timeLimitSec}
              onChange={(value) => update({ time: value })}
              suffix="秒"
              label="制限時間"
            />
          </SpecRow>
          <SpecRow label="出題数" hint="重複なしでシャッフル">
            <SettingOptions
              options={QUESTION_COUNT_OPTIONS}
              value={questionCount}
              onChange={(value) => update({ count: value })}
              suffix="問"
              label="出題数"
            />
          </SpecRow>
          <SpecRow label="正誤のあと" hint="表示中はタイマーが止まります">
            <div role="group" aria-label="正誤表示のあと" className="flex gap-2">
              <ChoiceTile
                selected={revealMode === "manual"}
                onClick={() => update({ reveal: "manual" })}
              >
                自分で次へ
              </ChoiceTile>
              <ChoiceTile
                selected={revealMode === "auto"}
                onClick={() => update({ reveal: "auto" })}
              >
                5秒で自動
              </ChoiceTile>
            </div>
          </SpecRow>
        </Disclosure>

        <Disclosure title="得点の決まり" note="早く答えるほど高い">
          <dl className="grid grid-cols-3 divide-x divide-rule border-b border-rule">
            {[
              {
                label: "正解",
                value: BASE_POINTS,
                unit: "点",
                note: "1問ごと",
              },
              {
                label: "速さ",
                value: `+0〜${SPEED_BONUS_MAX}`,
                unit: "点",
                note: "残り時間の割合",
              },
              {
                label: "連続正解",
                value: `+${COMBO_STEP}〜`,
                unit: "点",
                note: `最大 +${COMBO_BONUS_MAX}点`,
              },
            ].map((item) => (
              <div key={item.label} className="px-3 py-3 first:pl-0">
                <dt className="text-[11px] text-muted">{item.label}</dt>
                <dd className="mt-0.5">
                  <Figure value={item.value} unit={item.unit} size="sm" />
                </dd>
                <p className="mt-0.5 text-[10px] leading-snug text-muted">{item.note}</p>
              </div>
            ))}
          </dl>
          <p className="mt-2 max-w-[46ch] text-[11px] leading-relaxed text-muted">
            誤答と時間切れは0点です。早く答えるほど速さの点が増えますが、誤答すると連続正解が途切れます。
          </p>
        </Disclosure>

        <Disclosure title="収録内容" note={`${QUESTIONS.length}語＋${KEYBOARD_QUESTIONS.length}問`}>
          <dl className="grid max-w-lg grid-cols-2 divide-x divide-rule border-y border-rule sm:grid-cols-4">
            {[
              { value: String(QUESTIONS.length), unit: "語", label: "収録" },
              { value: "3–8", unit: "秒", label: "1問の制限" },
              { value: String(KEYBOARD_QUESTIONS.length), unit: "問", label: "キーボード操作" },
              {
                value: String(best.timeAttack),
                unit: "問",
                label: "タイムアタック自己ベスト",
              },
            ].map((item) => (
              <div key={item.label} className="px-3 py-2 first:pl-0">
                <dt className="text-[10px] text-muted">{item.label}</dt>
                <dd className="mt-0.5">
                  <Figure value={item.value} unit={item.unit} size="sm" />
                </dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      </section>

      <HistorySummary history={history} onClear={clear} />

      <p className="mt-auto pt-8 text-[11px] text-muted">
        ログイン不要。記録はこのブラウザにだけ残ります。
      </p>
    </main>
  );
}
