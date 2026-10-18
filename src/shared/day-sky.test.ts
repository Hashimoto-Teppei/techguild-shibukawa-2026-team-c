import { describe, expect, it } from "vitest";
import { COVER_ISLAND_HEIGHT, COVER_MOMENTS, coverScene, coverVariant, lerp } from "./day-sky";

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

describe("マップの表紙", () => {
  it("景色はマップ ID だけで決まる", () => {
    expect(coverVariant("shibukawa")).toEqual(coverVariant("shibukawa"));
    expect(COVER_MOMENTS).toContain(coverVariant("demo-cafe").t);
  });

  it("デモの3つのマップは、それぞれ違う景色になる", () => {
    const variants = ["shibukawa", "demo-cafe", "beach-sports-demo"].map((id) =>
      JSON.stringify(coverVariant(id)),
    );
    expect(new Set(variants).size).toBe(3);
  });

  it("4つの時刻すべてで、太陽か月の中心が島影より上に出ている", () => {
    for (const t of COVER_MOMENTS) {
      const scene = coverScene(t);
      const body = scene.sun ?? scene.moon;
      expect(body?.y).toBeGreaterThanOrEqual(COVER_ISLAND_HEIGHT);
    }
  });
});
