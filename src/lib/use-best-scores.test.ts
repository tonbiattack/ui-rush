import { describe, expect, it } from "vitest";
import { scoreKey } from "@/lib/use-best-scores";

/**
 * 自己ベストのキー。条件が違う記録を混ぜないことが要点なので、
 * モード・出題数・制限時間のどれが違っても別のキーになることを確かめる。
 */
describe("得点の自己ベストのキー", () => {
  it("同じ条件なら同じキーになる", () => {
    expect(scoreKey("normal", 10, 5)).toBe(scoreKey("normal", 10, 5));
  });

  it("モードが違えば別のキーになる", () => {
    expect(scoreKey("normal", 10, 5)).not.toBe(scoreKey("reverse", 10, 5));
    expect(scoreKey("normal", 10, 5)).not.toBe(scoreKey("timeattack", 10, 5));
  });

  it("出題数が違えば別のキーになる", () => {
    expect(scoreKey("normal", 5, 5)).not.toBe(scoreKey("normal", 10, 5));
    expect(scoreKey("normal", 10, 5)).not.toBe(scoreKey("normal", 20, 5));
  });

  it("制限時間が違えば別のキーになる", () => {
    expect(scoreKey("normal", 10, 3)).not.toBe(scoreKey("normal", 10, 5));
    expect(scoreKey("normal", 10, 5)).not.toBe(scoreKey("normal", 10, 8));
  });

  it("区切り文字が衝突しない", () => {
    // "a:b" + "c" と "a" + "b:c" が同じ文字列にならないこと。
    expect(scoreKey("normal", 1, 5)).not.toBe(scoreKey("normal", 15, 5));
  });
});
