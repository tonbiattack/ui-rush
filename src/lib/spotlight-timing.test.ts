import { describe, expect, it } from "vitest";
import { judgeSpotlightAnswer } from "@/lib/spotlight-timing";

describe("UIパーツ探しの回答時刻", () => {
  it("押した時刻から残り時間を計算する", () => {
    expect(judgeSpotlightAnswer("tabs", "tabs", 5000, 1234)).toEqual({
      outcome: "correct", remainingMs: 3766,
    });
    expect(judgeSpotlightAnswer("tabs", "modal", 5000, 4999)).toEqual({
      outcome: "incorrect", remainingMs: 1,
    });
  });

  it("締切ちょうど以降はタイマー更新前でも時間切れ", () => {
    expect(judgeSpotlightAnswer("tabs", "tabs", 5000, 5000)).toEqual({
      outcome: "timeout", remainingMs: 0,
    });
    expect(judgeSpotlightAnswer("tabs", "tabs", 5000, 5100).outcome).toBe("timeout");
  });
});
