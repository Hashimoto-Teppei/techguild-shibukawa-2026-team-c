import { WAVE_PATH } from "@shared/wave";
import { cn } from "@/lib/utils";

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
        <path d={WAVE_PATH} fill="currentColor" />
      </svg>
    </div>
  );
}
