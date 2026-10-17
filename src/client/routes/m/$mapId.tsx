import { filterByLayer } from "@shared/layer-filter";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { directionsUrl, imageUrl } from "@/lib/urls";

// ?layer= は QR で配るので、キー名を変えない（docs/public-url.md）
const searchSchema = z.object({ layer: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/m/$mapId")({
  validateSearch: searchSchema,
  component: MapPage,
});

// マップページ（LP）。見た目は #30 の部品（components/public/）に差し替えていく
function MapPage() {
  const { mapId } = Route.useParams();
  const { layer } = Route.useSearch();
  const [selectedId, setSelectedId] = useState<string>();
  const detailRef = useRef<HTMLElement>(null);
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
    if (selectedId) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  if (isPending) return null;
  // 一度読めていれば、再取得に失敗しても前のデータを出し続ける
  if (isError && !data)
    return <p className="p-4">読み込めませんでした。時間をおいて再読み込みしてください</p>;
  if (!data) return <p className="p-4">このマップは公開されていません</p>;

  const { activeLayerId, spots } = filterByLayer(data.spots, data.layers, layer);
  const selected = spots.find((s) => s.id === selectedId);
  const clearSelection = () => setSelectedId(undefined);

  return (
    <main className="mx-auto max-w-2xl">
      {data.headerImageKey && (
        <img src={imageUrl(data.headerImageKey)} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h1 className="text-xl font-bold">{data.title}</h1>
        <p className="whitespace-pre-wrap">{data.description}</p>
      </div>

      {data.layers.length > 0 && (
        <nav className="flex gap-2 overflow-x-auto px-4 pb-2">
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
        </nav>
      )}

      <div className="h-[55vh]">
        <MapView spots={spots} selectedId={selected?.id} onSelect={setSelectedId} />
      </div>

      {selected && (
        <section ref={detailRef} className="space-y-2 p-4">
          <h2 className="text-lg font-bold">{selected.name}</h2>
          <p className="whitespace-pre-wrap">{selected.description}</p>
          <Button asChild>
            <a href={directionsUrl(selected)} target="_blank" rel="noreferrer">
              経路
            </a>
          </Button>
        </section>
      )}

      <ul className="divide-y px-4 pb-8">
        {spots.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="w-full py-3 text-left"
              onClick={() => setSelectedId(s.id)}
            >
              {s.name}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

type LayerLinkProps = { layerId?: string; label: string; active: boolean; onClick: () => void };

function LayerLink({ layerId, label, active, onClick }: LayerLinkProps) {
  return (
    <Button asChild size="sm" variant={active ? "default" : "outline"}>
      <Link from="/m/$mapId" search={{ layer: layerId }} replace onClick={onClick}>
        {label}
      </Link>
    </Button>
  );
}
