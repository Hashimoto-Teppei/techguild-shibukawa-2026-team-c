import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./db/schema";

export type Db = DrizzleD1Database<typeof schema>;

// D1 はリクエストごとの binding なので、auth はリクエスト内で作る（使うルートでだけ）
export function createAuth(env: Env, db: Db) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    // 誰でもサインアップして作成者になれる（docs/tech-stack.md）
    emailAndPassword: { enabled: true },
  });
}

export type Auth = ReturnType<typeof createAuth>;
