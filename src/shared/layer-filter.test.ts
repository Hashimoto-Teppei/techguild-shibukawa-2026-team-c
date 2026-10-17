import { describe, expect, it } from "vitest";
import { filterByLayer } from "./layer-filter";

describe("filterByLayer", () => {
  const layers = [{ id: "family" }, { id: "date" }];
  const spots = [
    { id: "a", layerIds: ["family", "date"] },
    { id: "b", layerIds: ["date"] },
    { id: "c", layerIds: [] },
  ];

  it("指定したレイヤーのスポットだけ返す", () => {
    const result = filterByLayer(spots, layers, "family");
    expect(result.activeLayerId).toBe("family");
    expect(result.spots.map((s) => s.id)).toEqual(["a"]);
  });

  it("レイヤー指定なしは全表示", () => {
    expect(filterByLayer(spots, layers, undefined).spots).toHaveLength(3);
  });

  it("存在しないレイヤーは全表示にフォールバックする", () => {
    const result = filterByLayer(spots, layers, "deleted-layer");
    expect(result.activeLayerId).toBeUndefined();
    expect(result.spots).toHaveLength(3);
  });
});
