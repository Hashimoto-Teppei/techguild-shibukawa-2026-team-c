import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import { useEffect, useState } from "react";
import { MapView } from "@/components/map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { imageUrl } from "@/lib/urls";

export const Route = createFileRoute("/admin/_authed/maps/$mapId/")({ component: MapEditPage });

const mapApi = api.admin.maps[":mapId"];
type AdminMap = Extract<InferResponseType<typeof mapApi.$get>, { spots: unknown }>;
type AdminSpot = AdminMap["spots"][number];

// マップ編集: 公開切替・LP 設定・レイヤー・スポット
function MapEditPage() {
  const { mapId } = Route.useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  // 編集中のスポット。"new" は新規追加
  const [editingId, setEditingId] = useState<string>();
  const { data, isPending, isError } = useQuery({
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
    setSuccess("");
    const res = await request.catch(() => null);
    if (!res) {
      setError("通信できんかったけぇ、もういっぺん試してぇ");
      return false;
    }
    if (!res.ok) {
      setError("保存できんかったけぇ、入力を見直してぇ");
      return false;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    setSuccess("保存できたで");
    return true;
  }

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  if (isPending)
    return (
      <main className="mx-auto max-w-2xl p-4">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          読み込みょーるけぇ、ちょい待ってぇ
        </p>
      </main>
    );
  if (isError && !data)
    return (
      <main className="mx-auto max-w-2xl p-4">
        <p className="text-sm text-destructive" role="alert">
          うまいこと読めんかったけぇ、時間おいて開き直してぇ
        </p>
      </main>
    );
  if (!data) return <p className="p-4">マップが見つからんかった</p>;

  const param = { mapId };
  const editing: AdminSpot | undefined =
    editingId === "new" ? undefined : data.spots.find((s) => s.id === editingId);
  // 編集中のスポットが消えていたら、新規フォームに化けさせずに閉じる
  const formOpen = editingId === "new" || !!editing;
  const openForm = (id: string | undefined) => {
    setError("");
    setSuccess("");
    setEditingId(id);
  };

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4">
      <Link to="/admin" className="text-sm underline">
        ← 自分のマップ
      </Link>
      <section className="space-y-3">
        <h1 className="font-heading text-3xl">{data.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={data.published ? "default" : "secondary"}>
            {data.published ? "公開中" : "非公開"}
          </Badge>
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

      {/* スポットのフォームを開いているときは、メッセージをフォームの中に出す */}
      {error && !formOpen && <p className="text-sm text-destructive">{error}</p>}
      {success && !formOpen && (
        <p className="text-sm text-emerald-700" role="status" aria-live="polite">
          {success}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">マップページの見た目</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              save(
                mapApi.$patch({
                  param,
                  json: {
                    title: String(form.get("title")),
                    description: String(form.get("description")),
                  },
                }),
              );
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="map-title">タイトル</Label>
              <Input id="map-title" name="title" defaultValue={data.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="map-description">説明文</Label>
              <Textarea
                id="map-description"
                name="description"
                defaultValue={data.description}
                rows={4}
              />
            </div>
            <Button type="submit">タイトルと説明文を保存</Button>
          </form>
          {data.headerImageKey && (
            <img
              src={imageUrl(data.headerImageKey)}
              alt=""
              className="h-32 w-full rounded-md object-cover"
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="header-image">ヘッダー画像（JPEG・PNG・WebP、10MB まで）</Label>
            <Input
              id="header-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              // 回線が遅いと反応がなく見えて二重に送りがちなので、終わるまで選べなくする
              disabled={uploading}
              onChange={async (e) => {
                const input = e.currentTarget;
                const image = input.files?.[0];
                if (!image) return;
                if (image.size > 10 * 1024 * 1024) {
                  setError("画像が大きすぎるけぇ、10MB以下にしてぇ");
                  input.value = "";
                  return;
                }
                setUploading(true);
                await save(mapApi["header-image"].$put({ param, form: { image } }));
                setUploading(false);
                input.value = "";
              }}
            />
            {uploading && <p className="text-sm text-muted-foreground">アップロード中…</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">レイヤー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {data.layers.map((l) => (
              <li key={l.id} className="space-y-2">
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
                  <Input name="name" defaultValue={l.name} required aria-label="レイヤーの名前" />
                  <Button type="submit" variant="outline">
                    名前を保存
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (
                        !confirm(
                          `レイヤー「${l.name}」を削除しますか？（スポットは残りますが、このレイヤーの項目と入力済みの値は消えます）`,
                        )
                      )
                        return;
                      save(
                        mapApi.layers[":layerId"].$delete({ param: { ...param, layerId: l.id } }),
                      );
                    }}
                  >
                    削除
                  </Button>
                </form>
                <FieldList layer={l} mapId={mapId} save={save} />
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
            <Input
              name="name"
              placeholder="例: 家族向け"
              required
              aria-label="新しいレイヤーの名前"
            />
            <Button type="submit">レイヤーを追加</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">スポット</CardTitle>
          <CardAction>
            <Button onClick={() => openForm("new")}>スポットを追加</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {formOpen && (
            <SpotForm
              key={editingId}
              saveError={error}
              saveSuccess={success}
              spot={editing}
              layers={data.layers}
              onCancel={() => openForm(undefined)}
              onSubmit={async (json) => {
                const ok = await save(
                  editing
                    ? mapApi.spots[":spotId"].$put({
                        param: { ...param, spotId: editing.id },
                        json,
                      })
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
                  className="flex w-full items-center justify-between gap-2 px-2 py-3 text-left hover:bg-muted"
                  onClick={() => openForm(s.id)}
                >
                  <span>{s.name}</span>
                  {(s.startDate || s.endDate) && (
                    <Badge variant="outline">
                      臨時 {s.startDate ?? ""}〜{s.endDate ?? ""}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

type FieldListProps = {
  layer: AdminMap["layers"][number];
  mapId: string;
  save: (request: Promise<Response>) => Promise<boolean>;
};

// レイヤーの項目（スポットに入れる補足情報の欄）の追加・名前変更・削除。docs/layer-fields.md
function FieldList({ layer, mapId, save }: FieldListProps) {
  const fieldApi = mapApi.fields[":fieldId"];
  return (
    <div className="ml-4 space-y-2 border-l pl-3">
      {layer.fields.map((f) => (
        <form
          key={f.id}
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = String(new FormData(e.currentTarget).get("name"));
            save(fieldApi.$patch({ param: { mapId, fieldId: f.id }, json: { name } }));
          }}
        >
          <Input name="name" defaultValue={f.name} required aria-label="項目の名前" />
          <Button type="submit" size="sm" variant="outline">
            名前を保存
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => {
              if (!confirm(`項目「${f.name}」を削除しますか？（入力済みの値も消えます）`)) return;
              save(fieldApi.$delete({ param: { mapId, fieldId: f.id } }));
            }}
          >
            削除
          </Button>
        </form>
      ))}
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = String(new FormData(form).get("name"));
          const request = mapApi.layers[":layerId"].fields.$post({
            param: { mapId, layerId: layer.id },
            json: { name },
          });
          if (await save(request)) form.reset();
        }}
      >
        <Input
          name="name"
          placeholder="例: 駐車場"
          required
          aria-label={`「${layer.name}」に足す項目の名前`}
        />
        <Button type="submit" size="sm">
          項目を追加
        </Button>
      </form>
    </div>
  );
}

type SpotInput = Omit<AdminSpot, "id">;

type SpotFormProps = {
  spot?: AdminSpot;
  saveError: string;
  saveSuccess: string;
  layers: AdminMap["layers"];
  onSubmit: (input: SpotInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

// スポットの追加・編集。位置は地図をクリックしてピンを置き、ドラッグで調整する
function SpotForm({
  spot,
  saveError,
  saveSuccess,
  layers,
  onSubmit,
  onCancel,
  onDelete,
}: SpotFormProps) {
  const [pos, setPos] = useState(spot && { lat: spot.lat, lng: spot.lng });
  // チェックしたレイヤーの項目だけ入力欄を出す
  const [layerIds, setLayerIds] = useState(spot?.layerIds ?? []);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pos) return setError("地図をクリックして場所を決めてぇ");
    const form = new FormData(e.currentTarget);
    const date = (name: string) => String(form.get(name)) || null;
    const startDate = date("startDate");
    const endDate = date("endDate");
    if (startDate && endDate && startDate > endDate)
      return setError("掲載終了日は開始日より後にしてぇ");
    setError("");
    onSubmit({
      name: String(form.get("name")),
      description: String(form.get("description")),
      ...pos,
      startDate,
      endDate,
      layerIds: form.getAll("layerIds").map(String),
      // 隠れている入力欄の分も送るが、値はもともとサーバーに残すので変わらない
      values: Object.fromEntries(
        [...form]
          .filter(([key]) => key.startsWith("field:"))
          .map(([key, value]) => [key.slice("field:".length), String(value)]),
      ),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-muted/40 p-4">
      <h3 className="font-bold">{spot ? "スポットを編集" : "スポットを追加"}</h3>
      <div className="space-y-2">
        <Label htmlFor="spot-name">名前</Label>
        <Input id="spot-name" name="name" defaultValue={spot?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="spot-description">説明</Label>
        <Textarea
          id="spot-description"
          name="description"
          defaultValue={spot?.description}
          rows={3}
        />
      </div>
      {layers.length > 0 && (
        <fieldset className="flex flex-wrap gap-x-4 gap-y-2">
          <legend className="mb-2 text-sm font-medium">表示するレイヤー</legend>
          {layers.map((l) => (
            <label key={l.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                name="layerIds"
                value={l.id}
                checked={layerIds.includes(l.id)}
                onChange={(e) =>
                  setLayerIds((ids) =>
                    e.target.checked ? [...ids, l.id] : ids.filter((id) => id !== l.id),
                  )
                }
              />
              {l.name}
            </label>
          ))}
        </fieldset>
      )}
      {/* 同じ名前の項目が別のレイヤーにもありうるので、レイヤー名でまとめる。
          チェックを外しても消さずに隠すだけにして、付け直したときに入力途中の値を残す */}
      {layers
        .filter((l) => l.fields.length > 0)
        .map((l) => (
          <fieldset key={l.id} className="space-y-2" hidden={!layerIds.includes(l.id)}>
            <legend className="mb-2 text-sm font-medium">{l.name}の項目</legend>
            {l.fields.map((f) => (
              <div key={f.id} className="space-y-1">
                <Label htmlFor={`field-${f.id}`}>{f.name}</Label>
                <Input
                  id={`field-${f.id}`}
                  name={`field:${f.id}`}
                  defaultValue={spot?.values[f.id] ?? ""}
                />
              </div>
            ))}
          </fieldset>
        ))}
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          掲載期間（イベントなど期間限定のときだけ。空なら常に表示）
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            name="startDate"
            defaultValue={spot?.startDate ?? ""}
            aria-label="掲載開始日"
            className="w-auto"
          />
          〜
          <Input
            type="date"
            name="endDate"
            defaultValue={spot?.endDate ?? ""}
            aria-label="掲載終了日"
            className="w-auto"
          />
        </div>
      </fieldset>
      <p className="text-sm font-medium">
        地図をクリックして場所を決め、ピンをドラッグして調整します
      </p>
      <div className="h-72 overflow-hidden rounded-md">
        <MapView
          spots={pos ? [{ id: "editing", name: "", ...pos }] : []}
          onMapClick={setPos}
          onSpotDrag={(_, p) => setPos(p)}
        />
      </div>
      {saveSuccess && (
        <p className="text-sm text-emerald-700" role="status" aria-live="polite">
          {saveSuccess}
        </p>
      )}
      {(error || saveError) && (
        <p className="text-sm text-destructive" role="alert">
          {error || saveError}
        </p>
      )}
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
