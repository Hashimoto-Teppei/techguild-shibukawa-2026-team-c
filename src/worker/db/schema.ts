import { sql } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(now).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(now)
    .$onUpdate(() => new Date())
    .notNull(),
};

// --- BetterAuth のテーブル（BetterAuth が要求する形のまま） ---

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  ...timestamps,
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// --- アプリのテーブル ---

// id は公開 URL（/m/:mapId）に入るので、作成後に変えない
export const maps = sqliteTable(
  "maps",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    headerImageKey: text("header_image_key"),
    published: integer("published", { mode: "boolean" }).default(false).notNull(),
    ...timestamps,
  },
  (t) => [index("maps_owner_id_idx").on(t.ownerId)],
);

// id は QR の ?layer= に入るので、作成後に変えない
export const layers = sqliteTable(
  "layers",
  {
    id: text("id").primaryKey(),
    mapId: text("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("layers_map_id_idx").on(t.mapId)],
);

export const spots = sqliteTable(
  "spots",
  {
    id: text("id").primaryKey(),
    mapId: text("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    // 掲載期間（YYYY-MM-DD、日本時間、両端を含む）。どちらかが入っていれば臨時スポット
    startDate: text("start_date"),
    endDate: text("end_date"),
    ...timestamps,
  },
  (t) => [index("spots_map_id_idx").on(t.mapId)],
);

export const spotLayers = sqliteTable(
  "spot_layers",
  {
    spotId: text("spot_id")
      .notNull()
      .references(() => spots.id, { onDelete: "cascade" }),
    layerId: text("layer_id")
      .notNull()
      .references(() => layers.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.spotId, t.layerId] })],
);
