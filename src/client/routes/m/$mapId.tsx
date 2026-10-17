import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "@/lib/api";

// ?layer= は QR で配るので、キー名を変えない（docs/public-url.md）
const searchSchema = z.object({ layer: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/m/$mapId")({
  validateSearch: searchSchema,
  component: MapPage,
});

// マップページ（LP）。#10 でつなぎ込み、#30 の部品で見た目を作る
function MapPage() {
  const { mapId } = Route.useParams();
  const { layer } = Route.useSearch();
  const { data, isPending } = useQuery({
    queryKey: ["map", mapId],
    queryFn: async () => {
      const res = await api.maps[":mapId"].$get({ param: { mapId } });
      // 404 だけ「公開されていません」。それ以外のエラーは投げて React Query に再試行させる
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  if (isPending) return null;
  if (!data) return <p className="p-4">このマップは公開されていません</p>;

  // 存在しないレイヤーを指していたら全表示にフォールバック
  const activeLayer = data.layers.some((l) => l.id === layer) ? layer : undefined;
  const spots = activeLayer
    ? data.spots.filter((s) => s.layerIds.includes(activeLayer))
    : data.spots;

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-bold">{data.title}</h1>
      <p className="mb-4">{data.description}</p>
      <ul className="list-disc pl-5">
        {spots.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </main>
  );
}
