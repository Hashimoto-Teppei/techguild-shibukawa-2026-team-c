import { Check, X as Close, Copy, MessageCircle, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { Wave } from "@/components/public/wave";
import { imageUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

type Props = { title: string; url: string; imageKey: string | null; layerName?: string };

// 閲覧者のシェア（docs/share.md）。ヘッダー右上のボタンから、絵はがき風のシートを開く
// 本文はマップ名と URL だけ
export function ShareButton(props: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-ink"
      >
        <Share2 className="size-4" />
        シェア
      </button>
      <ShareSheet ref={dialogRef} {...props} />
    </>
  );
}

function ShareSheet({
  ref,
  title,
  url,
  imageKey,
  layerName,
}: Props & { ref: React.RefObject<HTMLDialogElement | null> }) {
  const [copy, setCopy] = useState<"done" | "failed">();
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const xUrl = `https://x.com/intent/post?${new URLSearchParams({ text: title, url })}`;
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(`${title}\n${url}`)}`;

  const copyLink = () => {
    // http やアプリ内ブラウザでは navigator.clipboard 自体がない
    const copied = navigator.clipboard?.writeText(url) ?? Promise.reject();
    copied.then(
      () => setCopy("done"),
      () => setCopy("failed"),
    );
    // 連打したら前のタイマーを捨て、最後に押してから2秒表示する
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopy(undefined), 2000);
  };

  return (
    // 中身がシートいっぱいに広がっているので、dialog 自身へのクリックは背景（::backdrop）のクリック
    // biome-ignore lint/a11y/useKeyWithClickEvents: キーボードでは Esc と閉じるボタンで閉じられる
    <dialog
      ref={ref}
      aria-label="このマップをシェア"
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="share-sheet mx-auto mt-auto mb-0 w-full max-w-full overflow-hidden rounded-t-panel bg-foam p-0 text-ink sm:mb-auto sm:max-w-md sm:rounded-panel"
    >
      {/* 絵はがきの表。マップのヘッダー画像に、タイトルと送るレイヤーを載せる */}
      <div className="on-dark relative h-44 overflow-hidden bg-linear-to-b from-ink to-sea text-white">
        {imageKey && (
          <img
            src={imageUrl(imageKey)}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/30 to-ink/10" />
        <button
          type="button"
          aria-label="閉じる"
          onClick={() => ref.current?.close()}
          className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-ink/60 backdrop-blur-sm transition-colors hover:bg-ink"
        >
          <Close className="size-5" />
        </button>
        <div className="absolute inset-x-5 bottom-9 space-y-2">
          {layerName && (
            <span className="inline-block rounded-full bg-buoy px-3 py-1 text-xs font-bold text-ink">
              {layerName}を表示した状態で送ります
            </span>
          )}
          <p className="line-clamp-2 font-heading text-2xl leading-snug [text-wrap:balance]">
            {title}
          </p>
        </div>
        <Wave className="absolute inset-x-0 -bottom-px h-6 text-foam" speed="12s" />
      </div>

      <div className="space-y-5 px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={xUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-13 items-center justify-center gap-2 rounded-full bg-black font-bold text-white transition-transform active:scale-[0.97]"
          >
            <XLogo className="size-4" />X でポスト
          </a>
          <a
            href={lineUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-13 items-center justify-center gap-2 rounded-full bg-[#06c755] font-bold text-white transition-transform active:scale-[0.97]"
          >
            <MessageCircle className="size-5 fill-current" />
            LINE で送る
          </a>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white py-1.5 pr-1.5 pl-5 ring-1 ring-border">
          <span className="min-w-0 flex-1 truncate text-sm text-ink/70">
            {url.replace(/^https?:\/\//, "")}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className={cn(
              "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors",
              copy === "done" ? "bg-sea text-white" : "bg-ink text-white hover:bg-ink/85",
            )}
          >
            {copy === "done" ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copy === "done" ? "コピーしました" : copy === "failed" ? "コピーできません" : "コピー"}
          </button>
        </div>

        {/* 目の前の人に送るときは、QR を切手のように見せて読み取ってもらう */}
        <div className="flex items-center gap-5 rounded-panel bg-sand/45 p-4">
          <div className="shrink-0 -rotate-3 drop-shadow-[0_3px_6px_rgb(11_46_79/0.2)]">
            <div className="stamp">
              <QRCodeSVG value={url} size={104} level="M" marginSize={0} fgColor="#0b2e4f" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold">目の前の人に送る</p>
            <p className="text-sm leading-relaxed text-ink/75">
              スマホのカメラでこの QR を読み取ってもらうと、同じページが開きます
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}

// X のロゴ（lucide にはブランドのアイコンがない）
function XLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}
