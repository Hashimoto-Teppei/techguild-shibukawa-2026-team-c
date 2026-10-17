import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/_authed/maps/$mapId/qr")({ component: QrPage });

const mapApi = api.admin.maps[":mapId"];
type AdminMap = Extract<InferResponseType<typeof mapApi.$get>, { layers: unknown }>;

function QrPage() {
  const { mapId } = Route.useParams();
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const { data, isPending, isError } = useQuery({
    queryKey: ["admin", "map", mapId],
    queryFn: async () => {
      const res = await mapApi.$get({ param: { mapId } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as AdminMap;
    },
  });

  if (isPending) return <p className="p-4">読み込み中...</p>;
  if (isError && !data)
    return <p className="p-4">読み込めませんでした。時間をおいて再読み込みしてください</p>;
  if (!data) return <p className="p-4">マップが見つかりません</p>;

  const selectedLayer = data.layers.find((layer) => layer.id === selectedLayerId);
  const publicUrl = new URL(`/m/${encodeURIComponent(mapId)}`, window.location.origin);
  if (selectedLayer) publicUrl.searchParams.set("layer", selectedLayer.id);
  const qrUrl = publicUrl.toString();

  return (
    <main className="qr-page mx-auto max-w-2xl space-y-6 p-4">
      <div className="qr-screen-only space-y-4">
        <Link to="/admin/maps/$mapId" params={{ mapId }} className="text-sm underline">
          ← マップ編集に戻る
        </Link>
        <h1 className="font-heading text-2xl">QRコードを発行</h1>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            QRコードに含めるレイヤー
            <select
              className="min-w-48 rounded-md border bg-background px-3 py-2 text-base font-normal"
              value={selectedLayer?.id ?? ""}
              onChange={(event) => setSelectedLayerId(event.currentTarget.value)}
            >
              <option value="">すべて</option>
              {data.layers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={() => window.print()}>印刷する</Button>
        </div>
      </div>

      <section className="qr-print-sheet flex flex-col items-center gap-4 rounded-xl border bg-white p-8 text-center text-black shadow-sm">
        <h2 className="max-w-full break-words text-2xl font-bold">{data.title}</h2>
        <p className="text-lg">{selectedLayer?.name ?? "すべてのレイヤー"}</p>
        <div className="qr-code rounded-lg bg-white p-2">
          <QRCodeSVG
            value={qrUrl}
            size={280}
            level="M"
            marginSize={4}
            title={`${data.title}のQRコード`}
          />
        </div>
        <p className="max-w-full break-all text-sm">{qrUrl}</p>
        {!data.published && <p className="font-semibold text-red-700">非公開です</p>}
      </section>
    </main>
  );
}
