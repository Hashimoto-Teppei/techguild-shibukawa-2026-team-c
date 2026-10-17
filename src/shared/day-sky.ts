// 「渋川の1日」の景色。サイトのトップ（src/client/components/public/day-sky.tsx）と発表スライド（slides/global-bottom.vue）で共有する
// t は 0 = 夜明け前、0.64 = 日の入り、1 = 次の夜明け前
export const SUNSET = 0.64;

// 時刻ごとの色。t の位置と色を同じ並びで持つ
export const STOPS = [0, 0.1, 0.5, 0.58, SUNSET, 0.72, 0.8, 0.95, 1];
export const SKY = [
  "#3d3f78",
  "#2a6fb0",
  "#1c69a8",
  "#2a5a92",
  "#7a3f6e",
  "#2a2556",
  "#0a1730",
  "#0a1730",
  "#3d3f78",
];
export const GLOW = [
  "#ff9b7a",
  "#ffd1a1",
  "#ffb070",
  "#ff8a4a",
  "#ff6a3d",
  "#8a3f8f",
  "#0a1730",
  "#0a1730",
  "#ff9b7a",
];
export const GLOW_OPACITY = [0.75, 0.15, 0, 0.45, 0.9, 0.25, 0, 0, 0.75];
export const ISLAND = [
  "#2b2d5c",
  "#1d5a86",
  "#1d5a86",
  "#2c4a78",
  "#3a2a55",
  "#151634",
  "#071022",
  "#071022",
  "#2b2d5c",
];
// 昼の色は styles.css の --sea / --lagoon と同じ
export const SEA = [
  "#3a4f8a",
  "#0e7fb8",
  "#0e7fb8",
  "#2a6aa0",
  "#5a4a8a",
  "#1a2e5a",
  "#0c2747",
  "#0c2747",
  "#3a4f8a",
];
export const LAGOON = [
  "#8a7fc0",
  "#3cc8d6",
  "#3cc8d6",
  "#ffb37a",
  "#ff9a6a",
  "#4a4f8f",
  "#2a5f8f",
  "#2a5f8f",
  "#8a7fc0",
];
export const NIGHT = [0.6, 0, 0, 0, 0.1, 0.7, 1, 1, 0.6];

// 弧の上を進む天体の位置（%）。範囲外は水平線の下に隠す（x は端のまま。海のきらめきが中央へ飛ばない）
export function arc(p: number, peak: number) {
  if (p < 0) return { x: 8, y: -60 };
  if (p > 1) return { x: 92, y: -60 };
  return { x: 8 + 84 * p, y: -25 + peak * Math.sin(Math.PI * p) };
}
export const sunAt = (t: number) => arc(t / SUNSET, 75);
export const MOONRISE = 0.68;
export const moonAt = (t: number) => arc((t - MOONRISE) / (1 - MOONRISE), 65);
export const MOON = "#f4f0d8";

// 太陽の色と、海面に映る太陽・月の光の強さ
export const SUN_STOPS = [0, 0.1, 0.22, 0.48, 0.58, SUNSET];
export const SUN_COLORS = ["#ff7a45", "#ffb347", "#ffd84d", "#ffd84d", "#ff9a3c", "#ff6a3d"];
export const GLINT_STOPS = [0, 0.08, 0.2, 0.5, 0.6, SUNSET];
export const GLINT = [0, 0.7, 0, 0, 0.7, 0];
export const MOON_GLINT_STOPS = [MOONRISE, 0.74, 0.96, 1];
export const MOON_GLINT = [0, 0.6, 0.6, 0];

// 星の位置は毎回同じにする（再描画のたびに動かない）
export const STARS = Array.from({ length: 42 }, (_, i) => {
  const r = (n: number) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1;
  return { left: r(1) * 100, top: r(2) * 70, size: 1 + r(3) * 2, delay: r(4) * 5 };
});

// 島の斜面に並ぶ町の灯り（島影の箱に対する %）
export const LIGHTS = [
  [9, 75],
  [11.5, 58],
  [13, 66],
  [15.5, 72],
  [38, 62],
  [40.5, 40],
  [42, 30],
  [44, 46],
  [46.5, 58],
  [49, 70],
  [67.5, 80],
  [69.5, 72],
  [71, 78],
  [88, 62],
  [90.5, 50],
  [93, 56],
  [95.5, 72],
];

export const ISLANDS =
  "M0 48 V40 C60 38 90 26 140 24 C190 22 220 36 260 40 L380 40 C420 30 450 14 500 12 C560 10 600 30 640 40 L760 40 C780 34 800 30 830 31 C860 32 870 38 900 40 L960 40 C1000 28 1050 20 1100 22 C1140 24 1170 36 1200 40 V48Z";

// motion の useTransform の代わり（発表スライド用）。数値と 16 進数の色を、区間ごとに線形補間する（範囲外は端の値）
export function lerp(xs: number[], ys: (number | string)[], v: number): string | number {
  if (v <= xs[0]) return ys[0];
  const i = xs.findLastIndex((x) => x <= v);
  if (i >= xs.length - 1) return ys[ys.length - 1];
  const p = (v - xs[i]) / (xs[i + 1] - xs[i]);
  const a = ys[i];
  const b = ys[i + 1];
  if (typeof a === "number" && typeof b === "number") return a + (b - a) * p;
  const ca = hex(a as string);
  const cb = hex(b as string);
  return `rgb(${ca.map((c, k) => Math.round(c + (cb[k] - c) * p)).join(" ")})`;
}
const hex = (s: string) => [1, 3, 5].map((k) => Number.parseInt(s.slice(k, k + 2), 16));
