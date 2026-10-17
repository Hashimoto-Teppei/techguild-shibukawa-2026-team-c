import { filterByLayer } from "@shared/layer-filter";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return <Notice>読み込めませんでした。時間をおいて再読み込みしてください</Notice>;
  if (!data) return <Notice>このマップは公開されていません</Notice>;

  const { activeLayerId, spots } = filterByLayer(data.spots, data.layers, layer);
  const selected = spots.find((s) => s.id === selectedId);
  const clearSelection = () => setSelectedId(undefined);

  return (
    <main className="mx-auto max-w-2xl">
      {data.headerImageKey && (
        <img src={imageUrl(data.headerImageKey)} alt="" className="h-56 w-full object-cover" />
      )}
      <div className="space-y-2 p-4">
        <h1 className="text-2xl font-bold">{data.title}</h1>
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
        <section ref={detailRef} className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selected.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap">{selected.description}</p>
              <Button asChild size="lg" className="w-full">
                <a href={directionsUrl(selected)} target="_blank" rel="noreferrer">
                  <Navigation />
                  経路を見る
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <ul className="divide-y px-4 pb-8">
        {spots.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 py-3 text-left",
                s.id === selected?.id && "font-bold",
              )}
              onClick={() => setSelectedId(s.id)}
            >
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
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

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-lg">{children}</p>
      <Link to="/" className="text-sm underline">
        公開中のマップを見る
      </Link>
    </main>
  );
}
