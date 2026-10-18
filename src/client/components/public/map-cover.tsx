import { coverScene, coverVariant, ISLANDS, MOON, STARS } from "@shared/day-sky";
import { WAVE_PATH } from "@shared/wave";
import { cn } from "@/lib/utils";

// ヘッダー画像がないマップの表紙。トップの「渋川の1日」の、朝・昼・夕・夜のどれかの静止画
// 景色はマップ ID で決まるので、一覧とシェアシートで同じマップは同じ景色になる
// 縦横比はどれでもよい（位置はすべて % で置く）。親で大きさを決める
export function MapCover({ mapId, className }: { mapId: string; className?: string }) {
  const { t, flip } = coverVariant(mapId);
  const s = coverScene(t);
  const body = s.sun ?? (s.moon && { ...s.moon, color: MOON });
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundColor: s.sky }}
    >
      {/* 反転は内側でする。外側は親が group-hover:scale-105 などを付けるので、scale がぶつかる */}
      <div className={cn("absolute inset-0", flip && "-scale-x-100")}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${s.glow}, transparent 65%)`,
            opacity: s.glowOpacity,
          }}
        />
        {s.night > 0.5 &&
          STARS.map((star) => (
            <span
              key={`${star.left}-${star.top}`}
              className="absolute rounded-full bg-white/80"
              style={{
                left: `${star.left}%`,
                top: `${star.top * 0.8}%`,
                width: star.size,
                height: star.size,
              }}
            />
          ))}

        {/* 水平線は上から 64% の位置。太陽と月はその上の空を弧で通る */}
        <div className="absolute inset-x-0 top-0 h-[64%]">
          {/* 大きさは空の高さに合わせる（幅に合わせると、横長のシェアシートで大きくなりすぎる） */}
          {body && (
            <span
              className="absolute aspect-square h-[26%] -translate-x-1/2 translate-y-1/2 rounded-full"
              style={{
                left: `${body.x}%`,
                bottom: `${body.y}%`,
                backgroundColor: body.color,
                // 補間した色は rgb() なので、16 進数の透明度は付けられない
                boxShadow: `0 0 40px 6px color-mix(in srgb, ${body.color} 40%, transparent)`,
              }}
            />
          )}
        </div>
        <svg
          aria-hidden
          viewBox="0 0 1200 48"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-[36%] h-[10%] w-full"
          style={{ color: s.island }}
        >
          <path d={ISLANDS} fill="currentColor" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-[36%]" style={{ backgroundColor: s.sea }}>
          <svg
            aria-hidden
            viewBox="0 0 2400 60"
            preserveAspectRatio="none"
            className="absolute inset-x-0 top-[18%] h-[22%] w-full opacity-50"
            style={{ color: s.lagoon }}
          >
            <path d={WAVE_PATH} fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
