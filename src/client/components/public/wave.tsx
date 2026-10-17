import { cn } from "@/lib/utils";

// 1周期 300 の波を 8 周期（2400）ぶん。半分ずらすと同じ形に戻るので、継ぎ目なく流せる
const crests = Array.from({ length: 15 }, (_, i) => ` T${300 + i * 150} 30`).join("");
const PATH = `M0 30 Q75 8 150 30${crests} V60 H0Z`;

type Props = { className?: string; speed?: string };

// 横に流れる波の帯。色は text-* で、高さは h-* で指定する
export function Wave({ className, speed = "14s" }: Props) {
  return (
    <div className={cn("pointer-events-none overflow-hidden", className)}>
      <svg
        aria-hidden
        viewBox="0 0 2400 60"
        preserveAspectRatio="none"
        className="wave-drift block h-full w-[200%]"
        style={{ "--wave-speed": speed } as React.CSSProperties}
      >
        <path d={PATH} fill="currentColor" />
      </svg>
    </div>
  );
}
