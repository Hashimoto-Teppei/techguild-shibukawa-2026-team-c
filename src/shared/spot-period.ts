// 臨時スポットの掲載判定。日付はすべて日本時間の YYYY-MM-DD 文字列で比べる

export type SpotPeriod = { startDate: string | null; endDate: string | null };

export function todayInJapan(now = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

export function isSpotVisible(spot: SpotPeriod, today: string): boolean {
  if (spot.startDate && today < spot.startDate) return false;
  if (spot.endDate && today > spot.endDate) return false;
  return true;
}
