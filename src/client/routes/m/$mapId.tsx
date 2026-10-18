import { filterByLayer } from "@shared/layer-filter";
import { mapUrl } from "@shared/page-meta";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import { MapPin, Navigation } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { MapView } from "@/components/map-view";
import { ShareButton } from "@/components/public/share-panel";
import { Wave } from "@/components/public/wave";
import { api } from "@/lib/api";
import { directionsUrl, imageUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

const mapApi = api.maps[":mapId"];
type Spot = Extract<InferResponseType<typeof mapApi.$get>, { spots: unknown }>["spots"][number];

// ?layer= は QR で配るので、キー名を変えない（docs/public-url.md）
const searchSchema = z.object({ layer: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/m/$mapId")({
  validateSearch: searchSchema,
  component: MapPage,
});

// PC 幅（Tailwind の lg）。一覧と地図を左右に並べる
const WIDE = "(min-width: 1024px)";

function subscribeWide(onChange: () => void) {
  const query = matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const isWide = () => matchMedia(WIDE).matches;

function useIsWide() {
  return useSyncExternalStore(subscribeWide, isWide);
}

// マップページ（LP）
function MapPage() {
  const { mapId } = Route.useParams();
  const { layer } = Route.useSearch();
  const [selectedId, setSelectedId] = useState<string>();
  const detailRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const wide = useIsWide();
  const { data, isPending, isError } = useQuery({
    queryKey: ["map", mapId],
    queryFn: async () => {
      const res = await mapApi.$get({ param: { mapId } });
      // 404 だけ「公開されていません」。それ以外のエラーは投げて React Query に再試行させる
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  // 選んだスポットが見える位置までスクロールする。スマホは地図の下の詳細、PC は一覧の行（名前と詳細）
  useEffect(() => {
    if (!selectedId) return;
    const target = wide ? document.getElementById(`spot-${selectedId}`) : detailRef.current;
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  }, [selectedId, reduceMotion, wide]);

  if (isPending) return null;
  // 一度読めていれば、再取得に失敗しても前のデータを出し続ける
  if (isError && !data)
    return <Notice>読み込めませんでした。時間をおいて再読み込みしてください</Notice>;
  if (!data) return <Notice>このマップは公開されていません</Notice>;

  const { activeLayerId, spots } = filterByLayer(data.spots, data.layers, layer);
  const selected = spots.find((s) => s.id === selectedId);
  const clearSelection = () => setSelectedId(undefined);
  // 今見ているレイヤーごとシェアする（スポットは URL に入れない。docs/share.md）
  const shareUrl = new URL(mapUrl(location.origin, data.id));
  if (activeLayerId) shareUrl.searchParams.set("layer", activeLayerId);

  return (
    <main className="pb-12">
      <Header title={data.title} imageKey={data.headerImageKey}>
        <ShareButton
          title={data.title}
          url={shareUrl.toString()}
          imageKey={data.headerImageKey}
          layerName={data.layers.find((l) => l.id === activeLayerId)?.name}
        />
      </Header>
      <div className="mx-auto max-w-3xl lg:max-w-7xl">
        {data.description && (
          <p className="mt-4 max-w-[38rem] px-4 leading-relaxed whitespace-pre-wrap text-ink/85">
            {data.description}
          </p>
        )}

        {data.layers.length > 0 && (
          // layoutScroll: 横スクロールしていても、レイヤーの丸が正しい位置から滑る
          <motion.nav
            layoutScroll
            className="sticky top-0 z-10 mt-6 flex gap-2 overflow-x-auto bg-foam px-4 py-3"
          >
            <LayerLink label="すべて" active={!activeLayerId} onClick={clearSelection} />
            {data.layers.map((l) => (
              <LayerLink
                key={l.id}
                layerId={l.id}
                label={l.name}
                active={l.id === activeLayerId}
                onClick={clearSelection}
              />
            ))}
          </motion.nav>
        )}

        {/* PC は左に一覧、右に地図。地図は画面に貼り付けて、一覧だけがスクロールする */}
        <div className="lg:grid lg:grid-cols-[24rem_1fr] lg:gap-6 lg:px-4">
          <div
            className={cn(
              "mx-4 mt-3 h-[55vh] overflow-hidden rounded-panel ring-1 ring-border",
              // レイヤー切替（高さ 68px）の下に貼り付ける
              "lg:sticky lg:order-last lg:mx-0 lg:mb-4 lg:self-start",
              data.layers.length > 0
                ? "lg:top-[4.25rem] lg:h-[calc(100svh-5.25rem)]"
                : "lg:top-4 lg:h-[calc(100svh-2rem)]",
            )}
          >
            <MapView spots={spots} selectedId={selected?.id} onSelect={setSelectedId} />
          </div>

          {!wide && (
            <AnimatePresence mode="popLayout">
              {selected && (
                <SpotDetail
                  key={selected.id}
                  ref={detailRef}
                  spot={selected}
                  className="mx-4 mt-4"
                />
              )}
            </AnimatePresence>
          )}

          <ul className="mx-4 mt-4 divide-y divide-border lg:mx-0 lg:mt-3">
            {spots.map((s) => {
              const active = s.id === selected?.id;
              return (
                // scroll-mt-20: 上に貼り付いたレイヤー切替（68px）に名前が隠れないようにする
                <li key={s.id} id={`spot-${s.id}`} className="scroll-mt-20">
                  <button
                    type="button"
                    aria-expanded={wide ? active : undefined}
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                    onClick={() => setSelectedId(s.id)}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sea transition-colors",
                        active && "bg-buoy text-ink",
                      )}
                    >
                      <MapPin className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block", active && "font-bold")}>{s.name}</span>
                      {/* PC で開いている行は、下の詳細に全文が出る */}
                      {s.description && !(wide && active) && (
                        <span className="line-clamp-1 text-sm text-ink/60">
                          {s.description.split("\n")[0]}
                        </span>
                      )}
                    </span>
                  </button>
                  {/* 行の中で開閉するので popLayout にしない（閉じる詳細が下の行に重なる） */}
                  {wide && (
                    <AnimatePresence>
                      {active && <SpotDetail spot={s} hideName className="mb-4" />}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}

type SpotDetailProps = {
  spot: Spot;
  ref?: React.Ref<HTMLElement>;
  // PC は一覧の行の直下に開くので、行と同じ名前を繰り返さない
  hideName?: boolean;
  className?: string;
};

function SpotDetail({ spot, ref, hideName, className }: SpotDetailProps) {
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn(
        "scroll-mt-20 space-y-4 rounded-panel bg-white p-5 ring-1 ring-border",
        className,
      )}
    >
      {!hideName && <h2 className="font-heading text-2xl">{spot.name}</h2>}
      {spot.description && (
        <p className="leading-relaxed whitespace-pre-wrap">{spot.description}</p>
      )}
      {spot.fields.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 rounded-2xl bg-sand/45 px-4 py-1 text-sm">
          {spot.fields.map((f, i) => (
            // 同じ名前の項目がありうるので index を key にする
            // biome-ignore lint/suspicious/noArrayIndexKey: 並びはサーバーが決めていて変わらない
            <Fragment key={i}>
              <dt className="border-ink/10 py-2 font-bold not-last-of-type:border-b">{f.name}</dt>
              <dd className="border-ink/10 py-2 whitespace-pre-wrap not-last-of-type:border-b">
                {f.value}
              </dd>
            </Fragment>
          ))}
        </dl>
      )}
      <a
        href={directionsUrl(spot)}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-buoy font-bold text-ink transition-transform active:scale-[0.98]"
      >
        <Navigation className="size-5" />
        経路を見る
      </a>
    </motion.section>
  );
}

// ヘッダー画像は下端を波で切り、スクロールに合わせてゆっくり動かす
// children はヘッダー右上に置く操作（シェアボタン）
function Header({
  title,
  imageKey,
  children,
}: {
  title: string;
  imageKey: string | null;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  return (
    <header ref={ref} className="on-dark relative overflow-hidden bg-ink text-white">
      {imageKey && (
        <motion.img
          src={imageUrl(imageKey)}
          alt=""
          style={reduceMotion ? undefined : { y }}
          className="absolute inset-0 size-full scale-110 object-cover"
        />
      )}
      {/* 写真の上でもタイトルが読めるよう、下側だけ藍をかける */}
      <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-transparent" />
      {/* 画像がないときは高さを取らず、地図を早く見せる */}
      <div
        className={cn(
          "relative mx-auto flex max-w-3xl flex-col justify-between gap-10 px-4 pt-4 pb-14 lg:max-w-7xl",
          imageKey && "min-h-[44svh]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="w-fit rounded-full bg-ink/70 px-3 py-1.5 text-sm font-bold">
            たまりんマップ
          </Link>
          {children}
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.15 }}
          className="font-heading text-4xl leading-tight [text-wrap:balance] sm:text-5xl"
        >
          {title}
        </motion.h1>
      </div>
      <Wave className="absolute inset-x-0 bottom-3 h-6 text-lagoon/50" speed="22s" />
      <Wave className="absolute inset-x-0 -bottom-px h-8 text-foam" speed="12s" />
    </header>
  );
}

type LayerLinkProps = { layerId?: string; label: string; active: boolean; onClick: () => void };

function LayerLink({ layerId, label, active, onClick }: LayerLinkProps) {
  return (
    <Link
      from="/m/$mapId"
      search={{ layer: layerId }}
      replace
      onClick={onClick}
      className={cn(
        "relative flex h-11 shrink-0 items-center rounded-full px-5 text-sm font-bold ring-1 ring-border transition-colors",
        active ? "text-ink ring-transparent" : "bg-white text-ink/70 hover:text-ink",
      )}
    >
      {/* 選んだレイヤーの後ろをブイ色の丸が滑って移る */}
      {active && (
        <motion.span
          layoutId="layer-pill"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-0 rounded-full bg-buoy"
        />
      )}
      <span className="relative">{label}</span>
    </Link>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <main className="on-dark relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-ink p-4 text-center text-white">
      <p className="font-heading text-xl">{children}</p>
      <Link to="/" className="rounded-full bg-buoy px-6 py-3 font-bold text-ink">
        公開中のマップを見る
      </Link>
      <Wave className="absolute inset-x-0 bottom-0 h-16 text-sea" speed="16s" />
    </main>
  );
}
