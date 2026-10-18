import { and, eq } from "drizzle-orm";
import type { Db } from "../auth";
import { maps } from "./schema";

// 公開中のマップの条件。公開 API と公開ページの HTML（OGP・sitemap・404）で食い違わないよう、ここだけで決める
export const isPublished = eq(maps.published, true);

export function findPublishedMap(db: Db, mapId: string) {
  return db.query.maps.findFirst({
    where: and(eq(maps.id, mapId), isPublished),
    columns: { id: true, title: true, description: true, headerImageKey: true },
  });
}
