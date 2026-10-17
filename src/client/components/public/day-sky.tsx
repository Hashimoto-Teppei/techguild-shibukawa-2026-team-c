import { Moon, Sun } from "lucide-react";
import {
  type MotionStyle,
  type MotionValue,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import { Wave } from "@/components/public/wave";

// 渋川の1日を 40 秒で一周させる。t は 0 = 夜明け前、0.64 = 日の入り、1 = 次の夜明け前
const DAY_SECONDS = 40;
const SUNSET = 0.64;

// 時刻ごとの色。t の位置と色を同じ並びで持つ
const STOPS = [0, 0.1, 0.5, 0.58, SUNSET, 0.72, 0.8, 0.95, 1];
const SKY = [
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
const GLOW = [
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
const GLOW_OPACITY = [0.75, 0.15, 0, 0.45, 0.9, 0.25, 0, 0, 0.75];
const ISLAND = [
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
const SEA = [
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
const LAGOON = [
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
const NIGHT = [0.6, 0, 0, 0, 0.1, 0.7, 1, 1, 0.6];

// 弧の上を進む天体の位置（%）。範囲外は水平線の下に隠す（x は端のまま。海のきらめきが中央へ飛ばない）
function arc(p: number, peak: number) {
  if (p < 0) return { x: 8, y: -60 };
  if (p > 1) return { x: 92, y: -60 };
  return { x: 8 + 84 * p, y: -25 + peak * Math.sin(Math.PI * p) };
}
const sunAt = (t: number) => arc(t / SUNSET, 75);
const MOONRISE = 0.68;
const moonAt = (t: number) => arc((t - MOONRISE) / (1 - MOONRISE), 65);
const MOON = "#f4f0d8";

// t を「5:00〜19:00 が昼、19:00〜翌5:00 が夜」の時刻にする
function clockAt(t: number) {
  const hours = t < SUNSET ? 5 + (14 * t) / SUNSET : 19 + (10 * (t - SUNSET)) / (1 - SUNSET);
  const minutes = Math.floor((hours * 60) / 10) * 10;
  const h = Math.floor(minutes / 60) % 24;
  return `${h}:${String(minutes % 60).padStart(2, "0")}`;
}

// 星の位置は毎回同じにする（再描画のたびに動かない）
const STARS = Array.from({ length: 42 }, (_, i) => {
  const r = (n: number) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1;
  return { left: r(1) * 100, top: r(2) * 70, size: 1 + r(3) * 2, delay: r(4) * 5 };
});

// 島の斜面に並ぶ町の灯り（島影の箱に対する %）
const LIGHTS = [
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

const ISLANDS =
  "M0 48 V40 C60 38 90 26 140 24 C190 22 220 36 260 40 L380 40 C420 30 450 14 500 12 C560 10 600 30 640 40 L760 40 C780 34 800 30 830 31 C860 32 870 38 900 40 L960 40 C1000 28 1050 20 1100 22 C1140 24 1170 36 1200 40 V48Z";

// トップの背景。空・太陽・月・星・島・海が、時刻 t に合わせて一緒に移り変わる
export function DaySky() {
  const reduceMotion = useReducedMotion();
  const t = useMotionValue(reduceMotion ? 0.3 : 0);
  const [isNight, setIsNight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // 画面外にスクロールしたら時間を止める（空全体の塗り直しを毎フレーム続けない）
  const inView = useInView(ref);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !inView) return;
    t.set((t.get() + delta / 1000 / DAY_SECONDS) % 1);
  });

  const sky = useTransform(t, STOPS, SKY);
  const glow = useTransform(t, STOPS, GLOW);
  const glowOpacity = useTransform(t, STOPS, GLOW_OPACITY);
  const island = useTransform(t, STOPS, ISLAND);
  const sea = useTransform(t, STOPS, SEA);
  const lagoon = useTransform(t, STOPS, LAGOON);
  const night = useTransform(t, STOPS, NIGHT);
  const sunX = useTransform(t, (v) => `${sunAt(v).x}%`);
  const sunY = useTransform(t, (v) => `${sunAt(v).y}%`);
  const sunColor = useTransform(
    t,
    [0, 0.1, 0.22, 0.48, 0.58, SUNSET],
    ["#ff7a45", "#ffb347", "#ffd84d", "#ffd84d", "#ff9a3c", "#ff6a3d"],
  );
  // 低い太陽ほど海にきらめきが映る。月の光は月が出ているあいだだけ
  const glint = useTransform(t, [0, 0.08, 0.2, 0.5, 0.6, SUNSET], [0, 0.7, 0, 0, 0.7, 0]);
  const moonGlint = useTransform(t, [MOONRISE, 0.74, 0.96, 1], [0, 0.6, 0.6, 0]);
  const moonX = useTransform(t, (v) => `${moonAt(v).x}%`);
  const moonY = useTransform(t, (v) => `${moonAt(v).y}%`);
  const clock = useTransform(t, clockAt);

  // 日の入り（19:00）から夜明けまでは月のアイコン
  useMotionValueEvent(t, "change", (v) => setIsNight(v >= SUNSET));

  // CSS 変数に MotionValue を渡す。MotionStyle の型は CSS 変数のキーを知らないので広げる
  const glowStyle = { "--glow": glow, opacity: glowOpacity } as MotionStyle;

  return (
    <>
      <motion.div
        ref={ref}
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: sky }}
      >
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--glow),transparent_65%)]"
          style={glowStyle}
        />
        <motion.div className="absolute inset-0" style={{ opacity: night }}>
          {STARS.map((s) => (
            <span
              key={`${s.left}-${s.top}`}
              className="twinkle absolute rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="relative">
          {/* 太陽と月が通る空。島と海が後ろに重なるので、沈むと隠れる */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-60 sm:h-72">
            <motion.div
              className="absolute size-20 -translate-x-1/2 rounded-full shadow-[0_0_80px_10px_rgb(255_170_70/0.45)] sm:size-28"
              style={{ left: sunX, bottom: sunY, backgroundColor: sunColor }}
            />
            <motion.div
              className="absolute size-12 -translate-x-1/2 rounded-full shadow-[0_0_48px_8px_rgb(244_240_216/0.35)] sm:size-16"
              style={{ left: moonX, bottom: moonY, backgroundColor: MOON }}
            />
          </div>

          {/* 作中の時刻。動きが「1日の流れ」だと分かるように出す。実際の時刻ではないので読み上げない */}
          <div aria-hidden className="absolute inset-x-0 bottom-full mx-auto mb-4 max-w-5xl px-4">
            <p className="flex w-fit items-center gap-1.5 rounded-full bg-ink/45 px-3 py-1 text-sm font-bold text-white tabular-nums">
              {isNight ? <Moon className="size-4" /> : <Sun className="size-4" />}
              <motion.span>{clock}</motion.span>
            </p>
          </div>

          <motion.svg
            aria-hidden
            viewBox="0 0 1200 48"
            preserveAspectRatio="none"
            className="relative block h-8 w-full sm:h-12"
            style={{ color: island }}
          >
            <path d={ISLANDS} fill="currentColor" />
          </motion.svg>
          <motion.div aria-hidden className="absolute inset-0" style={{ opacity: night }}>
            {LIGHTS.map(([left, top]) => (
              <span
                key={`${left}-${top}`}
                className="twinkle absolute size-[3px] rounded-full bg-[#ffd27a] shadow-[0_0_6px_2px_rgb(255_190_90/0.7)]"
                style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${left % 3}s` }}
              />
            ))}
          </motion.div>
        </div>

        <motion.div
          aria-hidden
          initial={{ y: 40 }}
          animate={{ y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-20 overflow-hidden sm:h-28"
          style={{ backgroundColor: sea }}
        >
          {/* 太陽・月の光が海面に映る帯 */}
          <Glint left={sunX} opacity={glint} color={sunColor} />
          <Glint left={moonX} opacity={moonGlint} color={MOON} />
          <motion.div className="absolute inset-0" style={{ color: lagoon }}>
            <Wave className="absolute inset-x-0 -top-3 h-6 opacity-60" speed="26s" />
            <Wave className="absolute inset-x-0 bottom-6 h-8 opacity-40" speed="18s" />
          </motion.div>
          <Wave className="absolute inset-x-0 -bottom-px h-10 text-foam" speed="11s" />
        </motion.div>
      </div>
    </>
  );
}

type GlintProps = {
  left: MotionValue<string>;
  opacity: MotionValue<number>;
  color: MotionValue<string> | string;
};

function Glint({ left, opacity, color }: GlintProps) {
  return (
    <motion.div
      className="absolute top-0 h-3/4 w-20 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,var(--glint)_0_3px,transparent_3px_9px)] [mask-image:linear-gradient(to_bottom,black,transparent)] sm:w-32"
      style={{ left, opacity, "--glint": color } as MotionStyle}
    />
  );
}
