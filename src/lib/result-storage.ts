import { QUESTIONS_BY_ID } from "./questions";
import {
  isQuestionCount,
  isQuizMode,
  isRevealMode,
  isTimeLimitSec,
  type AnswerRecord,
  type QuizMode,
  type RevealMode,
  type TimeLimitSec,
} from "./quiz";

export const RESULT_KEY = "ui-rush/last-result/v1";
const RESULT_VERSION = 1;

export interface StoredResult {
  version: typeof RESULT_VERSION;
  mode: QuizMode;
  timeLimitSec: TimeLimitSec;
  /** 正誤表示後の進め方。再挑戦時も同じ設定を引き継ぐ。 */
  revealMode: RevealMode;
  questionCount: number;
  answers: AnswerRecord[];
  /** 出題順のスナップショット。結果画面で用語を表示するために保持する。 */
  questionIds: string[];
  finishedAt: string;
}

/** 保存された生データを検証して復元する。壊れていれば null。 */
export function parseStoredResult(raw: string | null): StoredResult | null {
  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const candidate = parsed as Partial<StoredResult>;
  if (candidate.version !== RESULT_VERSION) {
    return null;
  }
  if (!isQuizMode(candidate.mode) || !isTimeLimitSec(candidate.timeLimitSec)) {
    return null;
  }
  if (!isQuestionCount(candidate.questionCount)) {
    return null;
  }
  if (!Array.isArray(candidate.answers) || !Array.isArray(candidate.questionIds)) {
    return null;
  }

  const answers = candidate.answers.filter(
    (answer): answer is AnswerRecord =>
      typeof answer === "object" &&
      answer !== null &&
      typeof answer.questionId === "string" &&
      QUESTIONS_BY_ID.has(answer.questionId) &&
      (answer.outcome === "correct" ||
        answer.outcome === "incorrect" ||
        answer.outcome === "timeout") &&
      (answer.selectedChoiceId === null || typeof answer.selectedChoiceId === "string") &&
      typeof answer.remainingMs === "number" &&
      Number.isFinite(answer.remainingMs),
  );

  const questionIds = candidate.questionIds.filter(
    (id): id is string => typeof id === "string" && QUESTIONS_BY_ID.has(id),
  );

  return {
    version: RESULT_VERSION,
    mode: candidate.mode,
    timeLimitSec: candidate.timeLimitSec,
    // 旧バージョンの保存データには無いので、既定の手動送りとして扱う。
    revealMode: isRevealMode(candidate.revealMode) ? candidate.revealMode : "manual",
    questionCount: candidate.questionCount,
    answers,
    questionIds,
    finishedAt: typeof candidate.finishedAt === "string" ? candidate.finishedAt : "",
  };
}

export function serializeResult(
  result: Omit<StoredResult, "version" | "finishedAt">,
  now = new Date(),
): string {
  const payload: StoredResult = {
    ...result,
    version: RESULT_VERSION,
    finishedAt: now.toISOString(),
  };
  return JSON.stringify(payload);
}

export function saveResult(result: Omit<StoredResult, "version" | "finishedAt">): void {
  try {
    window.sessionStorage.setItem(RESULT_KEY, serializeResult(result));
  } catch {
    // 保存できなくてもクイズ自体は完了させる。
  }
}

export function loadResult(): StoredResult | null {
  try {
    return parseStoredResult(window.sessionStorage.getItem(RESULT_KEY));
  } catch {
    return null;
  }
}
