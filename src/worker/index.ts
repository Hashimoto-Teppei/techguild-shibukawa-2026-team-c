import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { validator } from "hono/validator";
import { z } from "zod";
import { isSpotVisible, todayInJapan } from "../shared/spot-period";
import { type Auth, createAuth, type Db } from "./auth";
import * as schema from "./db/schema";
import { layers, maps, spotLayers, spots } from "./db/schema";

type User = Auth["$Infer"]["Session"]["user"];
type AppEnv = {
  Bindings: Env;
  Variables: {
    db: Db;
    user: User;
  };
};

const app = new Hono<AppEnv>().basePath("/api");

app.use(async (c, next) => {
  c.set("db", drizzle(c.env.DB, { schema }));
  await next();
});

app.on(["GET", "POST"], "/auth/*", (c) => createAuth(c.env, c.var.db).handler(c.req.raw));

// --- 公開側（ログイン不要） ---

const publicRoutes = new Hono<AppEnv>()
  .get("/maps", async (c) => {
    const rows = await c.var.db
      .select({ id: maps.id, title: maps.title, headerImageKey: maps.headerImageKey })
      .from(maps)
      .where(eq(maps.published, true))
      .orderBy(desc(maps.createdAt));
    return c.json(rows);
  })
  .get("/maps/:mapId", async (c) => {
    const { db } = c.var;
    const mapId = c.req.param("mapId");
    const map = await db.query.maps.findFirst({
      where: and(eq(maps.id, mapId), eq(maps.published, true)),
      columns: { id: true, title: true, description: true, headerImageKey: true },
    });
    // 存在しない・非公開は区別せず 404（docs/public-url.md）
    if (!map) return c.json({ error: "not_found" }, 404);

    const [layerRows, spotRows, links] = await Promise.all([
      db.select().from(layers).where(eq(layers.mapId, mapId)).orderBy(asc(layers.sortOrder)),
      db.select().from(spots).where(eq(spots.mapId, mapId)),
      db
        .select({ spotId: spotLayers.spotId, layerId: spotLayers.layerId })
        .from(spotLayers)
        .innerJoin(spots, eq(spots.id, spotLayers.spotId))
        .where(eq(spots.mapId, mapId)),
    ]);
    const layerIdsBySpot = Map.groupBy(links, (l) => l.spotId);
    const today = todayInJapan();
    const visibleSpots = spotRows
      .filter((s) => isSpotVisible(s, today))
      .map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        lat: s.lat,
        lng: s.lng,
        layerIds: layerIdsBySpot.get(s.id)?.map((l) => l.layerId) ?? [],
      }));
    return c.json({
      ...map,
      layers: layerRows.map((l) => ({ id: l.id, name: l.name })),
      spots: visibleSpots,
    });
  })
  .get("/images/:key{.+}", async (c) => {
    const object = await c.env.IMAGES.get(c.req.param("key"));
    if (!object) return c.notFound();
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
        ETag: object.httpEtag,
        // アップロードごとにキーが変わるので、長くキャッシュしてよい
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });

// --- 管理側（作成者本人のマップだけ） ---

function newId() {
  // ponytail: 10 桁の 16 進。URL に入るので短くしている。衝突したら PK 違反で 500 になる
  return crypto.randomUUID().replaceAll("-", "").slice(0, 10);
}

function json<T extends z.ZodType>(schema: T) {
  return validator("json", (value, c) => {
    const result = schema.safeParse(value);
    if (!result.success) return c.json({ error: "invalid", issues: result.error.issues }, 400);
    return result.data as z.output<T>;
  });
}

// ヘッダー画像。スマホの写真をそのまま上げられる大きさにしておく
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const mapInput = z
  .object({
    published: z.boolean(),
    title: z.string().trim().min(1),
    description: z.string(),
  })
  .partial()
  // 空だと drizzle の set({}) が例外で 500 になる
  .refine((o) => Object.keys(o).length > 0, { message: "変更する項目がありません" });

const layerInput = z.object({ name: z.string().trim().min(1) });

const date = z.iso.date().nullable();
const spotInput = z
  .object({
    name: z.string().trim().min(1),
    description: z.string(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    // どちらかを入れると臨時スポット（src/shared/spot-period.ts）
    startDate: date,
    endDate: date,
    layerIds: z.array(z.string()),
  })
  // 逆にすると一日も表示されないスポットになる
  .refine((s) => !s.startDate || !s.endDate || s.startDate <= s.endDate, {
    message: "掲載終了日は開始日より後にしてください",
  });

// 他のマップのレイヤーにはつながない
async function linkLayers(db: Db, mapId: string, spotId: string, layerIds: string[]) {
  if (layerIds.length === 0) return [];
  const own = await db
    .select({ id: layers.id })
    .from(layers)
    .where(and(eq(layers.mapId, mapId), inArray(layers.id, layerIds)));
  if (own.length === 0) return [];
  return [db.insert(spotLayers).values(own.map((l) => ({ spotId, layerId: l.id })))];
}

const adminRoutes = new Hono<AppEnv>()
  .use(async (c, next) => {
    const auth = createAuth(c.env, c.var.db);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "unauthorized" }, 401);
    c.set("user", session.user);
    await next();
  })
  .get("/maps", async (c) => {
    const rows = await c.var.db
      .select({ id: maps.id, title: maps.title, published: maps.published })
      .from(maps)
      .where(eq(maps.ownerId, c.var.user.id))
      .orderBy(desc(maps.createdAt));
    return c.json(rows);
  })
  .post("/maps", json(z.object({ title: z.string().trim().min(1) })), async (c) => {
    // 新規は非公開（published のデフォルト）
    const id = newId();
    await c.var.db
      .insert(maps)
      .values({ id, ownerId: c.var.user.id, title: c.req.valid("json").title });
    return c.json({ id }, 201);
  })
  // ここから下はマップ単位。所有者でなければ存在しないのと同じ 404（docs/team-plan.md）
  .use("/maps/:mapId/*", async (c, next) => {
    const map = await c.var.db.query.maps.findFirst({
      where: and(eq(maps.id, c.req.param("mapId")), eq(maps.ownerId, c.var.user.id)),
      columns: { id: true },
    });
    if (!map) return c.json({ error: "not_found" }, 404);
    await next();
  })
  .get("/maps/:mapId", async (c) => {
    const { db } = c.var;
    const mapId = c.req.param("mapId");
    const map = await db.query.maps.findFirst({
      where: and(eq(maps.id, mapId), eq(maps.ownerId, c.var.user.id)),
      columns: { id: true, title: true, description: true, headerImageKey: true, published: true },
    });
    if (!map) return c.json({ error: "not_found" }, 404);
    const [layerRows, spotRows, links] = await Promise.all([
      db.select().from(layers).where(eq(layers.mapId, mapId)).orderBy(asc(layers.sortOrder)),
      db.select().from(spots).where(eq(spots.mapId, mapId)).orderBy(asc(spots.createdAt)),
      db
        .select({ spotId: spotLayers.spotId, layerId: spotLayers.layerId })
        .from(spotLayers)
        .innerJoin(spots, eq(spots.id, spotLayers.spotId))
        .where(eq(spots.mapId, mapId)),
    ]);
    const layerIdsBySpot = Map.groupBy(links, (l) => l.spotId);
    // 管理画面では掲載期間外のスポットも出す
    return c.json({
      ...map,
      layers: layerRows.map((l) => ({ id: l.id, name: l.name })),
      spots: spotRows.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        lat: s.lat,
        lng: s.lng,
        startDate: s.startDate,
        endDate: s.endDate,
        layerIds: layerIdsBySpot.get(s.id)?.map((l) => l.layerId) ?? [],
      })),
    });
  })
  .patch("/maps/:mapId", json(mapInput), async (c) => {
    await c.var.db
      .update(maps)
      .set(c.req.valid("json"))
      .where(eq(maps.id, c.req.param("mapId")));
    return c.json({ ok: true });
  })
  .put(
    "/maps/:mapId/header-image",
    bodyLimit({
      maxSize: IMAGE_MAX_BYTES + 64 * 1024, // multipart の境界やヘッダーの分
      onError: (c) => c.json({ error: "too_large" }, 413),
    }),
    validator("form", (value, c) => {
      const image = value.image;
      if (!(image instanceof File) || !IMAGE_TYPES.includes(image.type))
        return c.json({ error: "invalid_type" }, 400);
      if (image.size > IMAGE_MAX_BYTES) return c.json({ error: "too_large" }, 413);
      return { image };
    }),
    async (c) => {
      const mapId = c.req.param("mapId");
      const { image } = c.req.valid("form");
      const { db } = c.var;
      const old = await db.query.maps.findFirst({
        where: eq(maps.id, mapId),
        columns: { headerImageKey: true },
      });
      const key = `maps/${mapId}/${newId()}`;
      await c.env.IMAGES.put(key, image, { httpMetadata: { contentType: image.type } });
      await db.update(maps).set({ headerImageKey: key }).where(eq(maps.id, mapId));
      // 新しい画像はもう保存できているので、古い画像の削除に失敗しても成功を返す
      if (old?.headerImageKey) c.executionCtx.waitUntil(c.env.IMAGES.delete(old.headerImageKey));
      return c.json({ key });
    },
  )
  .post("/maps/:mapId/layers", json(layerInput), async (c) => {
    const mapId = c.req.param("mapId");
    const { db } = c.var;
    const last = await db.query.layers.findFirst({
      where: eq(layers.mapId, mapId),
      orderBy: desc(layers.sortOrder),
      columns: { sortOrder: true },
    });
    const id = newId();
    await db.insert(layers).values({
      id,
      mapId,
      name: c.req.valid("json").name,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    });
    return c.json({ id }, 201);
  })
  .patch("/maps/:mapId/layers/:layerId", json(layerInput), async (c) => {
    const [row] = await c.var.db
      .update(layers)
      .set(c.req.valid("json"))
      .where(and(eq(layers.id, c.req.param("layerId")), eq(layers.mapId, c.req.param("mapId"))))
      .returning({ id: layers.id });
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json({ ok: true });
  })
  .delete("/maps/:mapId/layers/:layerId", async (c) => {
    // spot_layers は cascade で消える
    const [row] = await c.var.db
      .delete(layers)
      .where(and(eq(layers.id, c.req.param("layerId")), eq(layers.mapId, c.req.param("mapId"))))
      .returning({ id: layers.id });
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json({ ok: true });
  })
  .post("/maps/:mapId/spots", json(spotInput), async (c) => {
    const mapId = c.req.param("mapId");
    const { layerIds, ...spot } = c.req.valid("json");
    const id = newId();
    const { db } = c.var;
    await db.batch([
      db.insert(spots).values({ ...spot, id, mapId }),
      ...(await linkLayers(db, mapId, id, layerIds)),
    ]);
    return c.json({ id }, 201);
  })
  .put("/maps/:mapId/spots/:spotId", json(spotInput), async (c) => {
    const mapId = c.req.param("mapId");
    const spotId = c.req.param("spotId");
    const { layerIds, ...spot } = c.req.valid("json");
    const { db } = c.var;
    const exists = await db.query.spots.findFirst({
      where: and(eq(spots.id, spotId), eq(spots.mapId, mapId)),
      columns: { id: true },
    });
    if (!exists) return c.json({ error: "not_found" }, 404);
    await db.batch([
      db.update(spots).set(spot).where(eq(spots.id, spotId)),
      db.delete(spotLayers).where(eq(spotLayers.spotId, spotId)),
      ...(await linkLayers(db, mapId, spotId, layerIds)),
    ]);
    return c.json({ ok: true });
  })
  .delete("/maps/:mapId/spots/:spotId", async (c) => {
    const [row] = await c.var.db
      .delete(spots)
      .where(and(eq(spots.id, c.req.param("spotId")), eq(spots.mapId, c.req.param("mapId"))))
      .returning({ id: spots.id });
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json({ ok: true });
  });
// マップ単位の API を足すときは /maps/:mapId/ の下に置く（上の所有者チェックを通る）。子の行は mapId でも絞る

const routes = app.route("/", publicRoutes).route("/admin", adminRoutes);

export type AppType = typeof routes;

export default app;
