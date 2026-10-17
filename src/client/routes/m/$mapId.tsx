import { filterByLayer } from "@shared/layer-filter";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Navigation } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { MapView } from "@/components/map-view";
import { Wave } from "@/components/public/wave";
import { api } from "@/lib/api";
import { directionsUrl, imageUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

// ?layer= は QR で配るので、キー名を変えない（docs/public-url.md）
const searchSchema = z.object({ layer: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/m/$mapId")({
  validateSearch: searchSchema,
  component: MapPage,
});

// マップページ（LP）
function MapPage() {
  const { mapId } = Route.useParams();
  const { layer } = Route.useSearch();
  const [selectedId, setSelectedId] = useState<string>();
  const detailRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { data, isPending, isError } = useQuery({
    queryKey: ["map", mapId],
    queryFn: async () => {
      const res = await api.maps[":mapId"].$get({ param: { mapId } });
      // 404 だけ「公開されていません」。それ以外のエラーは投げて React Query に再試行させる
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  // 選んだスポットの説明は地図の下に出るので、スマホでも見える位置までスクロールする
  useEffect(() => {
    if (selectedId)
      detailRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
      });
  }, [selectedId, reduceMotion]);

  if (isPending) return null;
  // 一度読めていれば、再取得に失敗しても前のデータを出し続ける
  if (isError && !data)
    return <Notice>読み込めませんでした。時間をおいて再読み込みしてください</Notice>;
  if (!data) return <Notice>このマップは公開されていません</Notice>;

  const { activeLayerId, spots } = filterByLayer(data.spots, data.layers, layer);
  const selected = spots.find((s) => s.id === selectedId);
  const clearSelection = () => setSelectedId(undefined);

  return (
    <main className="pb-12">
      <Header title={data.title} imageKey={data.headerImageKey} />
      <div className="mx-auto max-w-3xl">
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

        <div className="mx-4 mt-3 h-[55vh] overflow-hidden rounded-panel ring-1 ring-border">
          <MapView spots={spots} selectedId={selected?.id} onSelect={setSelectedId} />
        </div>

        <AnimatePresence mode="popLayout">
          {selected && (
            <motion.section
              key={selected.id}
              ref={detailRef}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="mx-4 mt-4 scroll-mt-20 space-y-4 rounded-panel bg-white p-5 ring-1 ring-border"
            >
              <h2 className="font-heading text-2xl">{selected.name}</h2>
              {selected.description && (
                <p className="leading-relaxed whitespace-pre-wrap">{selected.description}</p>
              )}
              {selected.fields.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 rounded-2xl bg-sand/45 px-4 py-1 text-sm">
                  {selected.fields.map((f, i) => (
                    // 同じ名前の項目がありうるので index を key にする
                    // biome-ignore lint/suspicious/noArrayIndexKey: 並びはサーバーが決めていて変わらない
                    <Fragment key={i}>
                      <dt className="border-ink/10 py-2 font-bold not-last-of-type:border-b">
                        {f.name}
                      </dt>
                      <dd className="border-ink/10 py-2 whitespace-pre-wrap not-last-of-type:border-b">
                        {f.value}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              )}
              <a
                href={directionsUrl(selected)}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-buoy font-bold text-ink transition-transform active:scale-[0.98]"
              >
                <Navigation className="size-5" />
                経路を見る
              </a>
            </motion.section>
          )}
        </AnimatePresence>

        <ul className="mx-4 mt-4 divide-y divide-border">
          {spots.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 py-3.5 text-left",
                  s.id === selected?.id && "font-bold",
                )}
                onClick={() => setSelectedId(s.id)}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sea transition-colors",
                    s.id === selected?.id && "bg-buoy text-ink",
                  )}
                >
                  <MapPin className="size-4" />
                </span>
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

// ヘッダー画像は下端を波で切り、スクロールに合わせてゆっくり動かす
function Header({ title, imageKey }: { title: string; imageKey: string | null }) {
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
          "relative mx-auto flex max-w-3xl flex-col justify-between gap-10 px-4 pt-4 pb-14",
          imageKey && "min-h-[44svh]",
        )}
      >
        <Link to="/" className="w-fit rounded-full bg-ink/70 px-3 py-1.5 text-sm font-bold">
          渋川マップ
        </Link>
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
