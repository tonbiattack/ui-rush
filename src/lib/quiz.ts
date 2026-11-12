import {
  CATEGORY_FALLBACK,
  QUESTIONS,
  QUESTIONS_BY_ID,
  isConfusable,
  type Question,
} from "./questions";
import { sample, shuffle, type Rng } from "./random";

export const TIME_LIMIT_OPTIONS = [3, 5, 8] as const;
export const DEFAULT_TIME_LIMIT_SEC = 5 as const;
export const QUESTION_COUNT_OPTIONS = [10, 20] as const;
export const DEFAULT_QUESTION_COUNT = 10 as const;
export const CHOICE_COUNT = 4;
/** 正答と短い説明を見せる時間。 */
export const REVEAL_MS = 800;

export type TimeLimitSec = (typeof TIME_LIMIT_OPTIONS)[number];
export type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];
export type QuizMode = "normal" | "review";

export interface QuizQuestion {
  questionId: string;
  /** 正解を含む4択。並び順は出題時に確定済み。 */
  choices: string[];
}

export interface QuizSession {
  mode: QuizMode;
  timeLimitSec: TimeLimitSec;
  questions: QuizQuestion[];
}

export type AnswerOutcome = "correct" | "incorrect" | "timeout";

export interface AnswerRecord {
  questionId: string;
  /** 時間切れのときは null。 */
  selectedChoiceId: string | null;
  outcome: AnswerOutcome;
  /** 回答または時間切れになった時点の残り時間（ミリ秒、0以上）。 */
  remainingMs: number;
}

export type QuizPhase = "answering" | "revealed" | "finished";

export interface QuizState {
  session: QuizSession;
  index: number;
  answers: AnswerRecord[];
  phase: QuizPhase;
  /** 現在の問題の絶対的な締切時刻（performance.now()基準）。 */
  deadline: number;
  /** 正答表示を終えて次へ進む時刻。 */
  revealDeadline: number | null;
}

export interface QuizResult {
  total: number;
  correct: number;
  incorrect: number;
  timeout: number;
  answered: number;
  accuracy: number;
  wrongQuestionIds: string[];
  answers: AnswerRecord[];
}

export function isTimeLimitSec(value: unknown): value is TimeLimitSec {
  return TIME_LIMIT_OPTIONS.includes(value as TimeLimitSec);
}

export function isQuestionCount(value: unknown): value is QuestionCount {
  return QUESTION_COUNT_OPTIONS.includes(value as QuestionCount);
}

export function isQuizMode(value: unknown): value is QuizMode {
  return value === "normal" || value === "review";
}

function buildChoices(question: Question, rng: Rng): string[] {
  const isDistractorCandidate = (candidate: Question) =>
    candidate.id !== question.id && !isConfusable(question.id, candidate.id);

  // まず同カテゴリから。足りなければ近い系統のカテゴリを順に補充する。
  const sameCategory = shuffle(
    QUESTIONS.filter(
      (candidate) => isDistractorCandidate(candidate) && candidate.category === question.category,
    ),
    rng,
  );

  const fallback: Question[] = [];
  for (const category of CATEGORY_FALLBACK[question.category]) {
    fallback.push(
      ...shuffle(
        QUESTIONS.filter(
          (candidate) =>
            isDistractorCandidate(candidate) &&
            candidate.category === category &&
            !sameCategory.some((picked) => picked.id === candidate.id),
        ),
        rng,
      ),
    );
  }
  fallback.push(
    ...shuffle(
      QUESTIONS.filter(
        (candidate) =>
          isDistractorCandidate(candidate) &&
          !sameCategory.some((picked) => picked.id === candidate.id) &&
          !fallback.some((picked) => picked.id === candidate.id),
      ),
      rng,
    ),
  );

  const distractors = [...sameCategory, ...fallback]
    .slice(0, CHOICE_COUNT - 1)
    .map((candidate) => candidate.id);

  return shuffle([question.id, ...distractors], rng);
}

export interface CreateSessionOptions {
  /** 出題数。収録数を超える指定は収録数までに丸める。 */
  questionCount: number;
  timeLimitSec: TimeLimitSec;
  mode?: QuizMode;
  /** 復習モードで出題対象にする問題ID。省略時は全問題。 */
  questionIds?: readonly string[];
  rng?: Rng;
}

/**
 * セッションを作る。問題順はシャッフルされ、同じセッション内で重複しない。
 * 選択肢も毎回シャッフルされ、正解位置は固定されない。
 */
export function createQuizSession({
  questionCount,
  timeLimitSec,
  mode = "normal",
  questionIds,
  rng = Math.random,
}: CreateSessionOptions): QuizSession {
  const known = (questionIds ?? QUESTIONS.map((question) => question.id)).filter((id) =>
    QUESTIONS_BY_ID.has(id),
  );
  const uniqueIds = Array.from(new Set(known));
  const pickedIds = sample(uniqueIds, Math.min(questionCount, uniqueIds.length), rng);

  const questions = pickedIds.map((id) => {
    const question = QUESTIONS_BY_ID.get(id);
    if (!question) {
      throw new Error(`Unknown question id: ${id}`);
    }
    return { questionId: id, choices: buildChoices(question, rng) };
  });

  return { mode, timeLimitSec, questions };
}

export function timeLimitMs(seconds: TimeLimitSec): number {
  return seconds * 1000;
}

export function startQuiz(session: QuizSession, now: number): QuizState {
  if (session.questions.length === 0) {
    return {
      session,
      index: 0,
      answers: [],
      phase: "finished",
      deadline: now,
      revealDeadline: null,
    };
  }

  return {
    session,
    index: 0,
    answers: [],
    phase: "answering",
    deadline: now + timeLimitMs(session.timeLimitSec),
    revealDeadline: null,
  };
}

export function currentQuestion(state: QuizState): QuizQuestion | null {
  if (state.phase === "finished") {
    return null;
  }
  return state.session.questions[state.index] ?? null;
}

/** 表示用の残り時間。締切を過ぎていれば0。 */
export function remainingMs(state: QuizState, now: number): number {
  if (state.phase !== "answering") {
    return 0;
  }
  return Math.max(0, state.deadline - now);
}

function reveal(state: QuizState, answers: AnswerRecord[], now: number): QuizState {
  // 最終問題でも正答と説明を一度見せてから終了する。
  return {
    ...state,
    answers,
    phase: "revealed",
    revealDeadline: now + REVEAL_MS,
  };
}

/**
 * 回答を確定する。最初の1回だけ受け付け、以後は無視する。
 * 締切時刻を過ぎてからの回答は時間切れとして扱う（回答とタイマーの競合でも二重集計しない）。
 */
export function submitAnswer(state: QuizState, choiceId: string, now: number): QuizState {
  if (state.phase !== "answering") {
    return state;
  }
  const question = currentQuestion(state);
  if (!question || !question.choices.includes(choiceId)) {
    return state;
  }

  if (now >= state.deadline) {
    return recordTimeout(state, now);
  }

  const outcome: AnswerOutcome = choiceId === question.questionId ? "correct" : "incorrect";
  const record: AnswerRecord = {
    questionId: question.questionId,
    selectedChoiceId: choiceId,
    outcome,
    remainingMs: Math.max(0, state.deadline - now),
  };
  return reveal(state, [...state.answers, record], now);
}

export function recordTimeout(state: QuizState, now: number): QuizState {
  if (state.phase !== "answering") {
    return state;
  }
  const question = currentQuestion(state);
  if (!question) {
    return state;
  }
  const record: AnswerRecord = {
    questionId: question.questionId,
    selectedChoiceId: null,
    outcome: "timeout",
    remainingMs: 0,
  };
  return reveal(state, [...state.answers, record], now);
}

/** 表示時間が終わっていれば次の問題へ進む。最終問題なら終了する。 */
export function advanceIfReady(state: QuizState, now: number): QuizState {
  if (state.phase !== "revealed" || state.revealDeadline === null) {
    return state;
  }
  if (now < state.revealDeadline) {
    return state;
  }

  const nextIndex = state.index + 1;
  if (nextIndex >= state.session.questions.length) {
    return { ...state, phase: "finished", revealDeadline: null };
  }

  return {
    ...state,
    index: nextIndex,
    phase: "answering",
    // 次の問題の制限時間は「表示を始めた時刻」から測り直す。
    deadline: state.revealDeadline + timeLimitMs(state.session.timeLimitSec),
    revealDeadline: null,
  };
}

/**
 * 経過時間に応じてタイマーを進める。時間切れ判定と自動進行をまとめて行う。
 * バックグラウンドから復帰したときは、呼び出し時点のnowで正しく追いつく。
 */
export function tick(state: QuizState, now: number): QuizState {
  let next = state;
  // 表示時間を大幅に超過していた場合も、1問ずつ確実に処理する。
  for (let guard = 0; guard < 1000; guard += 1) {
    const before = next;
    if (next.phase === "answering" && now >= next.deadline) {
      next = recordTimeout(next, next.deadline);
    }
    if (next.phase === "revealed") {
      next = advanceIfReady(next, now);
    }
    if (next === before) {
      break;
    }
  }
  return next;
}

export function summarize(state: QuizState): QuizResult {
  const answers = state.answers;
  const correct = answers.filter((answer) => answer.outcome === "correct").length;
  const incorrect = answers.filter((answer) => answer.outcome === "incorrect").length;
  const timeout = answers.filter((answer) => answer.outcome === "timeout").length;
  const answered = correct + incorrect;

  return {
    total: state.session.questions.length,
    correct,
    incorrect,
    timeout,
    answered,
    accuracy: state.session.questions.length === 0
      ? 0
      : Math.round((correct / state.session.questions.length) * 100),
    wrongQuestionIds: answers
      .filter((answer) => answer.outcome !== "correct")
      .map((answer) => answer.questionId),
    answers,
  };
}
