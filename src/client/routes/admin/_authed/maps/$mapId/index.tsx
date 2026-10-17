import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import { useState } from "react";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/_authed/maps/$mapId/")({ component: MapEditPage });

const mapApi = api.admin.maps[":mapId"];
type AdminMap = Extract<InferResponseType<typeof mapApi.$get>, { spots: unknown }>;
type AdminSpot = AdminMap["spots"][number];

// マップ編集: 公開切替・レイヤー・スポット（LP 設定は #15、見た目は #31）
function MapEditPage() {
  const { mapId } = Route.useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  // 編集中のスポット。"new" は新規追加
  const [editingId, setEditingId] = useState<string>();
  const { data, isPending } = useQuery({
    queryKey: ["admin", "map", mapId],
    queryFn: async () => {
      const res = await mapApi.$get({ param: { mapId } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as AdminMap;
    },
  });

  // 保存して画面を最新にする。失敗したら false
  async function save(request: Promise<Response>) {
    setError("");
    const res = await request.catch(() => null);
    if (!res) {
      setError("通信できませんでした。電波の良いところでもう一度保存してください");
      return false;
    }
    if (!res.ok) {
      setError("保存できませんでした。入力内容を確認してください");
      return false;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    return true;
  }

  if (isPending) return null;
  if (!data) return <p className="p-4">マップが見つかりません</p>;

  const param = { mapId };
  const editing: AdminSpot | undefined =
    editingId === "new" ? undefined : data.spots.find((s) => s.id === editingId);
  // 編集中のスポットが消えていたら、新規フォームに化けさせずに閉じる
  const formOpen = editingId === "new" || !!editing;
  const openForm = (id: string | undefined) => {
    setError("");
    setEditingId(id);
  };

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4">
      <Link to="/admin" className="text-sm underline">
        ← 自分のマップ
      </Link>
      <section className="space-y-2">
        <h1 className="text-xl font-bold">{data.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span>{data.published ? "公開中" : "非公開"}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => save(mapApi.$patch({ param, json: { published: !data.published } }))}
          >
            {data.published ? "非公開にする" : "公開する"}
          </Button>
          <Link to="/m/$mapId" params={param} target="_blank" className="underline">
            公開ページを開く
          </Link>
          <Link to="/admin/maps/$mapId/qr" params={param} className="underline">
            QR を発行
          </Link>
        </div>
      </section>

      {/* スポットのフォームを開いているときは、エラーをフォームの中に出す */}
      {error && !formOpen && <p className="text-red-600">{error}</p>}

      <section className="space-y-2">
        <h2 className="text-lg font-bold">レイヤー</h2>
        <ul className="space-y-2">
          {data.layers.map((l) => (
            <li key={l.id}>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = String(new FormData(e.currentTarget).get("name"));
                  save(
                    mapApi.layers[":layerId"].$patch({
                      param: { ...param, layerId: l.id },
                      json: { name },
                    }),
                  );
                }}
              >
                <input name="name" defaultValue={l.name} required className="flex-1 border p-2" />
                <Button type="submit" variant="outline">
                  名前を保存
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (!confirm(`レイヤー「${l.name}」を削除しますか？（スポットは残ります）`))
                      return;
                    save(mapApi.layers[":layerId"].$delete({ param: { ...param, layerId: l.id } }));
                  }}
                >
                  削除
                </Button>
              </form>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = String(new FormData(form).get("name"));
            if (await save(mapApi.layers.$post({ param, json: { name } }))) form.reset();
          }}
        >
          <input name="name" placeholder="例: 家族向け" required className="flex-1 border p-2" />
          <Button type="submit">レイヤーを追加</Button>
        </form>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">スポット</h2>
          <Button onClick={() => openForm("new")}>スポットを追加</Button>
        </div>
        {formOpen && (
          <SpotForm
            key={editingId}
            saveError={error}
            spot={editing}
            layers={data.layers}
            onCancel={() => openForm(undefined)}
            onSubmit={async (json) => {
              const ok = await save(
                editing
                  ? mapApi.spots[":spotId"].$put({ param: { ...param, spotId: editing.id }, json })
                  : mapApi.spots.$post({ param, json }),
              );
              if (ok) setEditingId(undefined);
            }}
            onDelete={
              editing &&
              (async () => {
                if (!confirm(`スポット「${editing.name}」を削除しますか？`)) return;
                const ok = await save(
                  mapApi.spots[":spotId"].$delete({ param: { ...param, spotId: editing.id } }),
                );
                if (ok) setEditingId(undefined);
              })
            }
          />
        )}
        <ul className="divide-y">
          {data.spots.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="flex w-full justify-between py-3 text-left"
                onClick={() => openForm(s.id)}
              >
                <span>{s.name}</span>
                {(s.startDate || s.endDate) && (
                  <span className="text-sm text-neutral-500">
                    臨時 {s.startDate ?? ""}〜{s.endDate ?? ""}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

type SpotInput = Omit<AdminSpot, "id">;

type SpotFormProps = {
  spot?: AdminSpot;
  saveError: string;
  layers: AdminMap["layers"];
  onSubmit: (input: SpotInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

// スポットの追加・編集。位置は地図をクリックしてピンを置き、ドラッグで調整する
function SpotForm({ spot, saveError, layers, onSubmit, onCancel, onDelete }: SpotFormProps) {
  const [pos, setPos] = useState(spot && { lat: spot.lat, lng: spot.lng });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pos) return setError("地図をクリックして場所を決めてください");
    const form = new FormData(e.currentTarget);
    const date = (name: string) => String(form.get(name)) || null;
    const startDate = date("startDate");
    const endDate = date("endDate");
    if (startDate && endDate && startDate > endDate)
      return setError("掲載終了日は開始日より後にしてください");
    setError("");
    onSubmit({
      name: String(form.get("name")),
      description: String(form.get("description")),
      ...pos,
      startDate,
      endDate,
      layerIds: form.getAll("layerIds").map(String),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-3">
      <h3 className="font-bold">{spot ? "スポットを編集" : "スポットを追加"}</h3>
      <input
        name="name"
        defaultValue={spot?.name}
        placeholder="スポットの名前"
        required
        className="w-full border p-2"
      />
      <textarea
        name="description"
        defaultValue={spot?.description}
        placeholder="説明"
        rows={3}
        className="w-full border p-2"
      />
      {layers.length > 0 && (
        <fieldset className="flex flex-wrap gap-3">
          <legend className="text-sm">表示するレイヤー</legend>
          {layers.map((l) => (
            <label key={l.id} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="layerIds"
                value={l.id}
                defaultChecked={spot?.layerIds.includes(l.id)}
              />
              {l.name}
            </label>
          ))}
        </fieldset>
      )}
      <fieldset className="space-y-1">
        <legend className="text-sm">
          掲載期間（イベントなど期間限定のときだけ。空なら常に表示）
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            name="startDate"
            defaultValue={spot?.startDate ?? ""}
            className="border p-2"
          />
          〜
          <input
            type="date"
            name="endDate"
            defaultValue={spot?.endDate ?? ""}
            className="border p-2"
          />
        </div>
      </fieldset>
      <p className="text-sm">地図をクリックして場所を決め、ピンをドラッグして調整します</p>
      <div className="h-72">
        <MapView
          spots={pos ? [{ id: "editing", name: "", ...pos }] : []}
          onMapClick={setPos}
          onSpotDrag={(_, p) => setPos(p)}
        />
      </div>
      {(error || saveError) && <p className="text-red-600">{error || saveError}</p>}
      <div className="flex gap-2">
        <Button type="submit">保存</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          やめる
        </Button>
        {onDelete && (
          <Button type="button" variant="destructive" className="ml-auto" onClick={onDelete}>
            削除
          </Button>
        )}
      </div>
    </form>
  );
}
