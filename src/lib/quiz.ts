import {
  ALL_QUESTIONS,
  CATEGORY_FALLBACK,
  CONFUSABLE_PAIRS,
  QUESTIONS,
  QUESTIONS_BY_ID,
  isConfusable,
  type ConfusablePair,
  type Question,
} from "./questions";
import { sample, shuffle, type Rng } from "./random";

export const TIME_LIMIT_OPTIONS = [3, 5, 8] as const;
export const DEFAULT_TIME_LIMIT_SEC = 5 as const;
export const QUESTION_COUNT_OPTIONS = [5, 10, 20] as const;
export const DEFAULT_QUESTION_COUNT = 10 as const;
export const CHOICE_COUNT = 4;
/** 「自動で次へ」を選んだときに、正誤と解説を見せる時間。 */
export const AUTO_REVEAL_MS = 5000;

export type TimeLimitSec = (typeof TIME_LIMIT_OPTIONS)[number];
export type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];
/**
 * - normal: 全用語から4択（デモを見て名称を答える）
 * - review: 苦手な問題だけ
 * - confusable: 呼び間違えやすいペアの2択特訓
 * - reverse: 自然言語の要件から名称を答える逆引き
 * - keyboard: キーボード操作の用語
 * - timeattack: 60秒で何問解けるか
 * - spaced: 忘却曲線に合わせた今日の復習
 */
export type QuizMode =
  | "normal"
  | "review"
  | "confusable"
  | "reverse"
  | "keyboard"
  | "timeattack"
  | "spaced"
  | "spotlight";
/**
 * 正誤と解説を見せたあとの進め方。
 * - manual: タイマーを止めて待機し、ユーザーが「次へ」を押すまで進まない（既定）
 * - auto: 一定時間（AUTO_REVEAL_MS）表示したら自動で次へ進む
 */
export type RevealMode = "manual" | "auto";

export interface QuizQuestion {
  questionId: string;
  /** 正解を含む4択。並び順は出題時に確定済み。 */
  choices: string[];
}

export interface QuizSession {
  mode: QuizMode;
  timeLimitSec: TimeLimitSec;
  revealMode: RevealMode;
  questions: QuizQuestion[];
  /**
   * セッション全体の制限時間（ミリ秒）。timeattack だけ設定する。
   * null なら問題ごとの制限時間だけで進む。
   */
  sessionLimitMs?: number | null;
  /**
   * 正誤表示の長さ（ミリ秒）。省略時は revealMode に従う。
   * タイムアタックは短くしてテンポを優先する。
   */
  revealMs?: number;
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
  /** 正誤表示を自動で終える時刻。手動送りのときは null（ユーザーの操作まで待つ）。 */
  revealDeadline: number | null;
  /** セッション開始時刻。 */
  startedAt: number;
  /** セッション全体の締切時刻。timeattack 以外は null。 */
  sessionDeadline: number | null;
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
  return (
    value === "normal" ||
    value === "review" ||
    value === "confusable" ||
    value === "reverse" ||
    value === "keyboard" ||
    value === "timeattack" ||
    value === "spaced" ||
    value === "spotlight"
  );
}

export function isRevealMode(value: unknown): value is RevealMode {
  return value === "manual" || value === "auto";
}

function buildChoices(
  question: Question,
  rng: Rng,
  pool: readonly Question[] = QUESTIONS,
): string[] {
  const isDistractorCandidate = (candidate: Question) =>
    candidate.id !== question.id && !isConfusable(question.id, candidate.id);

  // まず同じ種類・同カテゴリから。足りなければ近い系統のカテゴリを順に補充する。
  const sameCategory = shuffle(
    pool.filter(
      (candidate) => isDistractorCandidate(candidate) && candidate.category === question.category,
    ),
    rng,
  );

  // 同じ種類の別カテゴリ（キーボード操作など）を次に優先する。
  const sameKind = shuffle(
    pool.filter(
      (candidate) =>
        isDistractorCandidate(candidate) &&
        candidate.category !== question.category &&
        !sameCategory.some((picked) => picked.id === candidate.id),
    ),
    rng,
  );

  const byId = new Map([...QUESTIONS, ...pool].map((item) => [item.id, item]));

  const fallback: Question[] = [];
  for (const category of CATEGORY_FALLBACK[question.category]) {
    fallback.push(
      ...shuffle(
        QUESTIONS.filter(
          (candidate) =>
            isDistractorCandidate(candidate) &&
            candidate.category === category &&
            !sameCategory.some((picked) => picked.id === candidate.id) &&
            !sameKind.some((picked) => picked.id === candidate.id),
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
          !sameKind.some((picked) => picked.id === candidate.id) &&
          !fallback.some((picked) => picked.id === candidate.id),
      ),
      rng,
    ),
  );

  const chosen = [...sameCategory, ...sameKind];
  // 種類のプールだけでは4択に足りない場合に備え、必ず4つそろえる。
  for (const candidate of fallback) {
    if (chosen.length >= CHOICE_COUNT - 1) {
      break;
    }
    if (!chosen.some((picked) => picked.id === candidate.id) && byId.has(candidate.id)) {
      chosen.push(candidate);
    }
  }

  const distractors = chosen.slice(0, CHOICE_COUNT - 1).map((candidate) => candidate.id);

  return shuffle([question.id, ...distractors], rng);
}

export interface CreateSessionOptions {
  /** 出題数。収録数を超える指定は収録数までに丸める。 */
  questionCount: number;
  timeLimitSec: TimeLimitSec;
  mode?: QuizMode;
  /** 正誤表示後の進め方。既定は手動（タイマー停止）。 */
  revealMode?: RevealMode;
  /** 復習モードで出題対象にする問題ID。省略時は全問題。 */
  questionIds?: readonly string[];
  rng?: Rng;
}

/** 同じカテゴリから誤答を寄せた4択を作る（通常・逆引き・キーボード共通）。 */
function buildSessionQuestions(
  source: readonly Question[],
  questionCount: number,
  rng: Rng,
): QuizQuestion[] {
  const pickedIds = sample(
    source.map((question) => question.id),
    Math.min(questionCount, source.length),
    rng,
  );

  return pickedIds.map((id) => {
    const question = QUESTIONS_BY_ID.get(id);
    if (!question) {
      throw new Error(`Unknown question id: ${id}`);
    }
    // 同じ種類（用語/キー）から誤答を寄せる。キーの問題に用語が混ざらない。
    return { questionId: id, choices: buildChoices(question, rng, source) };
  });
}

/**
 * セッションを作る。問題順はシャッフルされ、同じセッション内で重複しない。
 * 選択肢も毎回シャッフルされ、正解位置は固定されない。
 */
export function createQuizSession({
  questionCount,
  timeLimitSec,
  mode = "normal",
  revealMode = "manual",
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

  return { mode, timeLimitSec, revealMode, questions };
}

/** 逆引き: 自然言語の要件から名称を答える。選択肢は同じ4択ロジックを使う。 */
export function createReverseSession({
  questionCount,
  timeLimitSec,
  revealMode = "manual",
  rng = Math.random,
}: Omit<CreateSessionOptions, "questionIds">): QuizSession {
  return {
    mode: "reverse",
    timeLimitSec,
    revealMode,
    questions: buildSessionQuestions(QUESTIONS, questionCount, rng),
  };
}

/** キーボード操作: キーの用語だけを出題する。 */
export function createKeyboardSession({
  questionCount,
  timeLimitSec,
  revealMode = "manual",
  rng = Math.random,
}: Omit<CreateSessionOptions, "questionIds">): QuizSession {
  return {
    mode: "keyboard",
    timeLimitSec,
    revealMode,
    questions: buildSessionQuestions(
      ALL_QUESTIONS.filter((question) => question.kind === "keyboard"),
      questionCount,
      rng,
    ),
  };
}

/** 60秒タイムアタック。全用語から重複なしで出し、尽きたら先頭へ戻る。 */
export const TIME_ATTACK_MS = 60_000;
/** タイムアタック中の1問あたりの持ち時間。 */
export const TIME_ATTACK_PER_QUESTION_SEC = 8 as const;
/** タイムアタックで正誤を見せる時間。テンポを優先して短くする。 */
export const TIME_ATTACK_REVEAL_MS = 700;

export function createTimeAttackSession({
  revealMode = "manual",
  rng = Math.random,
}: {
  revealMode?: RevealMode;
  rng?: Rng;
}): QuizSession {
  return {
    mode: "timeattack",
    timeLimitSec: TIME_ATTACK_PER_QUESTION_SEC,
    revealMode,
    // 回答したら短く正誤だけ見せて、すぐ次へ進む。
    revealMs: TIME_ATTACK_REVEAL_MS,
    sessionLimitMs: TIME_ATTACK_MS,
    questions: buildSessionQuestions(QUESTIONS, QUESTIONS.length, rng),
  };
}

/** 間隔反復: 期限が来た問題だけを出題する。questionIds が空なら作らない。 */
export function createSpacedSession({
  questionCount,
  timeLimitSec,
  revealMode = "manual",
  questionIds,
  rng = Math.random,
}: CreateSessionOptions): QuizSession {
  return {
    ...createQuizSession({
      questionCount,
      timeLimitSec,
      mode: "spaced",
      revealMode,
      questionIds,
      rng,
    }),
    mode: "spaced",
  };
}

/**
 * 呼び間違えやすいペアを、両方向（Aを問う・Bを問う）で2択出題する。
 * 選択肢は「正解＋紛らわしい相手」だけにして、名称の違いに集中できるようにする。
 */
export function createConfusableSession({
  timeLimitSec,
  revealMode = "manual",
  pairCount,
  rng = Math.random,
}: {
  timeLimitSec: TimeLimitSec;
  revealMode?: RevealMode;
  /** 出題するペア数。省略時はすべてのペア。 */
  pairCount?: number;
  rng?: Rng;
}): QuizSession {
  const availablePairs = CONFUSABLE_PAIRS.filter(
    (pair) => QUESTIONS_BY_ID.has(pair.a) && QUESTIONS_BY_ID.has(pair.b),
  );
  const shuffledPairs = sample(availablePairs, availablePairs.length, rng);

  // 1セッション内で同じ用語を二重に出さない（複数のペアに現れる用語があるため）。
  const used = new Set<string>();
  const picked: ConfusablePair[] = [];
  for (const pair of shuffledPairs) {
    if (picked.length >= (pairCount ?? availablePairs.length)) {
      break;
    }
    if (used.has(pair.a) || used.has(pair.b)) {
      continue;
    }
    used.add(pair.a);
    used.add(pair.b);
    picked.push(pair);
  }

  const questions: QuizQuestion[] = picked.flatMap((pair) =>
    [pair.a, pair.b].map((answerId) => {
      const partnerId = answerId === pair.a ? pair.b : pair.a;
      return {
        questionId: answerId,
        choices: shuffle([answerId, partnerId], rng),
      };
    }),
  );

  return {
    mode: "confusable",
    timeLimitSec,
    revealMode,
    questions: shuffle(questions, rng),
  };
}

export function timeLimitMs(seconds: TimeLimitSec): number {
  return seconds * 1000;
}

export function startQuiz(session: QuizSession, now: number): QuizState {
  const sessionDeadline =
    session.sessionLimitMs === null || session.sessionLimitMs === undefined
      ? null
      : now + session.sessionLimitMs;

  if (session.questions.length === 0) {
    return {
      session,
      index: 0,
      answers: [],
      phase: "finished",
      deadline: now,
      revealDeadline: null,
      startedAt: now,
      sessionDeadline,
    };
  }

  return {
    session,
    index: 0,
    answers: [],
    phase: "answering",
    deadline: now + timeLimitMs(session.timeLimitSec),
    revealDeadline: null,
    startedAt: now,
    sessionDeadline,
  };
}

/** セッション全体の残り時間。制限が無ければ null。 */
export function remainingSessionMs(state: QuizState, now: number): number | null {
  if (state.sessionDeadline === null) {
    return null;
  }
  return Math.max(0, state.sessionDeadline - now);
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
  // 正誤と解説の表示中はタイマーを止める。自動送りのときだけ終了時刻を決める。
  // revealMs を持つセッション（タイムアタック）は、その短い時間だけ表示して進む。
  const duration = state.session.revealMs;
  const autoAdvance = duration !== undefined || state.session.revealMode === "auto";
  return {
    ...state,
    answers,
    phase: "revealed",
    revealDeadline: autoAdvance
      ? now + (duration ?? AUTO_REVEAL_MS)
      : null,
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
  return advance(state, state.revealDeadline);
}

/**
 * 手動送り。正誤と解説を読み終えたら呼ぶ。
 * 表示中のタイマーは止まっているので、次問はここから満額の制限時間で始める。
 */
export function advance(state: QuizState, now: number): QuizState {
  if (state.phase !== "revealed") {
    return state;
  }

  // セッション全体の時間切れは、次の問題へ進む前に確定する。
  if (state.sessionDeadline !== null && now >= state.sessionDeadline) {
    return { ...state, phase: "finished", revealDeadline: null };
  }

  const nextIndex = state.index + 1;
  if (nextIndex >= state.session.questions.length) {
    // タイムアタックは問題を使い切ったら先頭へ戻って続ける。
    if (state.session.mode === "timeattack") {
      return {
        ...state,
        index: 0,
        phase: "answering",
        deadline: now + timeLimitMs(state.session.timeLimitSec),
        revealDeadline: null,
      };
    }
    return { ...state, phase: "finished", revealDeadline: null };
  }

  return {
    ...state,
    index: nextIndex,
    phase: "answering",
    // 次の問題の制限時間は「次へ進んだ時刻」から測り直す。
    deadline: now + timeLimitMs(state.session.timeLimitSec),
    revealDeadline: null,
  };
}

/**
 * 経過時間に応じてタイマーを進める。時間切れ判定と自動進行をまとめて行う。
 * バックグラウンドから復帰したときは、呼び出し時点のnowで正しく追いつく。
 */
export function tick(state: QuizState, now: number): QuizState {
  // セッション全体の制限時間を過ぎたら、その場で終了する。
  if (
    state.sessionDeadline !== null &&
    now >= state.sessionDeadline &&
    state.phase !== "finished"
  ) {
    return { ...state, phase: "finished", revealDeadline: null };
  }

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
    if (next.sessionDeadline !== null && now >= next.sessionDeadline) {
      return { ...next, phase: "finished", revealDeadline: null };
    }
  }
  return next;
}

/**
 * 回答の一覧から成績を集計する。進行状態に依存しない純粋関数。
 * 正答率は出題数に対する正解の割合（時間切れ・未回答も分母に含む）。
 */
export function summarizeAnswers(
  answers: readonly AnswerRecord[],
  total: number,
): QuizResult {
  const correct = answers.filter((answer) => answer.outcome === "correct").length;
  const incorrect = answers.filter((answer) => answer.outcome === "incorrect").length;
  const timeout = answers.filter((answer) => answer.outcome === "timeout").length;

  return {
    total,
    correct,
    incorrect,
    timeout,
    answered: correct + incorrect,
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    wrongQuestionIds: answers
      .filter((answer) => answer.outcome !== "correct")
      .map((answer) => answer.questionId),
    answers: [...answers],
  };
}

export function summarize(state: QuizState): QuizResult {
  return summarizeAnswers(state.answers, state.session.questions.length);
}
