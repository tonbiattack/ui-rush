import type { AnswerOutcome } from "./quiz";

/** UIパーツ探しで押した時刻から判定と残り時間を確定する。 */
export function judgeSpotlightAnswer(
  targetId: string,
  selectedId: string,
  deadline: number,
  now: number,
): { outcome: AnswerOutcome; remainingMs: number } {
  if (now >= deadline) {
    return { outcome: "timeout", remainingMs: 0 };
  }
  return {
    outcome: selectedId === targetId ? "correct" : "incorrect",
    remainingMs: deadline - now,
  };
}
