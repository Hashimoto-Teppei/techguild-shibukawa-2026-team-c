import { describe, expect, it } from "vitest";
import { visibleFieldValues } from "./spot-fields";

describe("visibleFieldValues", () => {
  const fields = [
    { id: "nursing", layerId: "family", name: "授乳室" },
    { id: "parking", layerId: "family", name: "駐車場" },
    { id: "budget", layerId: "date", name: "予算" },
  ];
  const values = new Map([
    ["nursing", "あり"],
    ["parking", " "],
    ["budget", "2000円"],
  ]);

  it("属しているレイヤーの項目だけを順番どおり返し、空の値は出さない", () => {
    expect(visibleFieldValues(["family"], fields, values)).toEqual([
      { name: "授乳室", value: "あり" },
    ]);
  });

  it("外したレイヤーの値は残っていても出さない", () => {
    expect(visibleFieldValues(["date"], fields, values)).toEqual([
      { name: "予算", value: "2000円" },
    ]);
  });
});
