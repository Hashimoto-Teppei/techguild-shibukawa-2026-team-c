import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
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
        // ponytail: 同じキーで差し替えると最大5分古い画像が出る。気になればアップロードごとにキーを変える
        "Cache-Control": "public, max-age=300",
      },
    });
  });

// --- 管理側（作成者本人のマップだけ） ---

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
  });
// マップ単位の API を足すときは、必ず ownerId で絞り、他人のマップは 404 を返す（docs/team-plan.md）

const routes = app.route("/", publicRoutes).route("/admin", adminRoutes);

export type AppType = typeof routes;

export default app;
