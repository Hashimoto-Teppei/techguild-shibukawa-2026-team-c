import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { DaySky } from "@/components/public/day-sky";
import { MapCover } from "@/components/public/map-cover";
import { Wave } from "@/components/public/wave";
import { api } from "@/lib/api";
import { imageUrl } from "@/lib/urls";

export const Route = createFileRoute("/")({ component: MapListPage });

const rise = { hidden: { y: "110%" }, show: { y: 0 } };

// 公開マップ一覧
function MapListPage() {
  const { data, isPending } = useQuery({
    queryKey: ["maps"],
    queryFn: async () => {
      const res = await api.maps.$get();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  return (
    <>
      {/* 画面いっぱいにして、太陽と月が見出しの下の空を通るようにする */}
      <header className="on-dark relative min-h-svh overflow-hidden bg-ink text-white">
        <DaySky />
        <nav className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-heading text-lg">たまりんマップ</span>
          <Link
            to="/admin"
            className="rounded-full px-4 py-2 text-sm font-bold ring-1 ring-white/40 transition-colors hover:bg-white hover:text-ink"
          >
            マップを作る
          </Link>
        </nav>

        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12, delayChildren: 0.35 }}
          className="relative z-10 mx-auto max-w-5xl px-4 pt-10 pb-56 [text-shadow:0_2px_16px_rgb(11_23_48/0.45)] sm:pt-16 sm:pb-80"
        >
          <h1 className="font-heading text-[2.6rem] leading-[1.15] sm:text-7xl">
            {["渋川の浜を、", "地図で歩く。"].map((line) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  variants={rise}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  className="block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            transition={{ duration: 0.6 }}
            className="mt-5 max-w-md text-base leading-relaxed text-white sm:text-lg"
          >
            観光協会やお店が作った渋川のマップを、ログインなしで見られます。
          </motion.p>
          {/* ヒーローが画面いっぱいなので、一覧へ降りる入口を置く */}
          <motion.a
            href="#maps"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            transition={{ duration: 0.6 }}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-buoy px-6 font-bold text-ink [text-shadow:none]"
          >
            公開中のマップを見る
            <ArrowDown className="size-5" />
          </motion.a>
        </motion.div>
      </header>

      <main id="maps" className="mx-auto max-w-5xl scroll-mt-4 px-4 pt-6 pb-16">
        <h2 className="mb-6 font-heading text-2xl">公開中のマップ</h2>
        {!isPending && data?.length === 0 && (
          <p className="text-muted-foreground">まだ公開中のマップはありません</p>
        )}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((m) => (
            <li key={m.id}>
              <Link
                to="/m/$mapId"
                params={{ mapId: m.id }}
                className="group block overflow-hidden rounded-panel bg-white ring-1 ring-border transition-shadow hover:shadow-[0_12px_32px_-12px_rgb(11_46_79/0.35)] focus-visible:ring-3 focus-visible:ring-sea"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                  {m.headerImageKey ? (
                    <img
                      src={imageUrl(m.headerImageKey)}
                      alt=""
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <MapCover
                      mapId={m.id}
                      className="size-full transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <Wave className="absolute inset-x-0 -bottom-px h-5 text-white" speed="20s" />
                </div>
                <p className="px-5 pt-1 pb-5 font-heading text-lg">{m.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <section className="bg-sand">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl">お店や団体のマップを作れます</h2>
            <p className="mt-2 text-ink/80">作ったマップは QR コードにして、店頭に置けます。</p>
          </div>
          <Link
            to="/admin"
            className="rounded-full bg-ink px-6 py-3 font-bold text-white transition-colors hover:bg-sea"
          >
            マップを作る
          </Link>
        </div>
      </section>
    </>
  );
}
