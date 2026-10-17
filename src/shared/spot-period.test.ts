import { describe, expect, it } from "vitest";
import { isSpotVisible, todayInJapan } from "./spot-period";

describe("isSpotVisible", () => {
  const period = { startDate: "2026-10-24", endDate: "2026-10-25" };

  it("期間なしのスポットは常に表示する", () => {
    expect(isSpotVisible({ startDate: null, endDate: null }, "2026-10-17")).toBe(true);
  });

  it("掲載期間の両端の日を含む", () => {
    expect(isSpotVisible(period, "2026-10-23")).toBe(false);
    expect(isSpotVisible(period, "2026-10-24")).toBe(true);
    expect(isSpotVisible(period, "2026-10-25")).toBe(true);
    expect(isSpotVisible(period, "2026-10-26")).toBe(false);
  });

  it("片側だけの期間も扱える", () => {
    expect(isSpotVisible({ startDate: null, endDate: "2026-10-25" }, "2026-01-01")).toBe(true);
    expect(isSpotVisible({ startDate: "2026-10-24", endDate: null }, "2027-01-01")).toBe(true);
  });
});

describe("todayInJapan", () => {
  it("UTC で前日でも日本時間の日付を返す", () => {
    expect(todayInJapan(new Date("2026-10-16T15:30:00Z"))).toBe("2026-10-17");
  });
});
