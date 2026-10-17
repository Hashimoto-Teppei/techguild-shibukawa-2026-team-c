import { describe, expect, it } from "vitest";
import { lerp } from "./day-sky";

describe("lerp", () => {
  const xs = [0, 0.5, 1];

  it("区間の中で数値を補間する", () => {
    expect(lerp(xs, [0, 1, 0], 0.25)).toBe(0.5);
  });

  it("16 進数の色を補間する", () => {
    expect(lerp(xs, ["#000000", "#ff0000", "#000000"], 0.25)).toBe("rgb(128 0 0)");
  });

  it("範囲外は端の値にする", () => {
    expect(lerp(xs, [2, 1, 3], -1)).toBe(2);
    expect(lerp(xs, [2, 1, 3], 5)).toBe(3);
  });
});
