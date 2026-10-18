import { drizzle } from "drizzle-orm/d1";
import { type Context, Hono } from "hono";
import { mapUrl, pageMeta } from "../shared/page-meta";
import { findPublishedMap, isPublished } from "./db/published";
import * as schema from "./db/schema";
import { maps } from "./db/schema";

// 公開ページの HTML に、SNS のカードと検索エンジン向けのメタタグを入れる（docs/share.md）
// 本文は SPA が描くので、ここでは index.html の <head> だけ書き換える

type PagesEnv = { Bindings: Env };
type Meta = ReturnType<typeof pageMeta>;

const origin = (c: Context<PagesEnv>) => new URL(c.req.url).origin;

const indexHtml = (c: Context<PagesEnv>) => c.env.ASSETS.fetch(new URL("/", c.req.url));

function renderPage(html: Response, meta: Meta, status: 200 | 404 = 200) {
  const content = (value: string): HTMLRewriterElementContentHandlers => ({
    element: (e) => {
      e.setAttribute("content", value);
    },
  });
  const page = new HTMLRewriter()
    .on("title", { element: (e) => void e.setInnerContent(meta.title) })
    .on('meta[name="description"]', content(meta.description))
    .on('meta[property="og:title"]', content(meta.title))
    .on('meta[property="og:description"]', content(meta.description))
    .on('meta[property="og:url"]', content(meta.url))
    .on('meta[property="og:image"]', content(meta.image))
    .on("head", {
      element: (e) => {
        // canonical は index.html に置くと Vite がアセットとして読もうとするので、ここで足す
        // meta.url は origin とエンコード済みの mapId だけなので、属性に入れてもエスケープは要らない
        if (status === 404) e.append('<meta name="robots" content="noindex" />', { html: true });
        else e.append(`<link rel="canonical" href="${meta.url}" />`, { html: true });
      },
    })
    .transform(html);
  const headers = new Headers(page.headers);
  // ETag は index.html のもの。マップ名を変えても古いカードが返らないよう外す
  headers.delete("ETag");
  return new Response(page.body, { status, headers });
}

export const pages = new Hono<PagesEnv>()
  .get("/", async (c) => renderPage(await indexHtml(c), pageMeta(origin(c))))
  .get("/m/:mapId", async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const [html, map] = await Promise.all([
      indexHtml(c),
      findPublishedMap(db, c.req.param("mapId")).catch((e: unknown) => {
        console.error(e);
        return "error" as const;
      }),
    ]);
    // DB が落ちていても HTML はそのまま返し、SPA の再試行と「読み込めませんでした」に任せる
    if (map === "error") return html;
    // 存在しない・非公開は検索に載せない。画面は SPA が「公開されていません」を出す
    if (!map) return renderPage(html, pageMeta(origin(c)), 404);
    return renderPage(html, pageMeta(origin(c), map));
  })
  // /m/:mapId 以外の /m/* はそのまま SPA に返す
  .get("/m/*", (c) => c.env.ASSETS.fetch(c.req.raw))
  // /api/maps（SPA の本文）と /api/images（OGP 画像）はクローラーに読ませるので、/api/ はまるごと止めない
  .get("/robots.txt", (c) =>
    c.text(
      [
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /api/admin/",
        "Disallow: /api/auth/",
        `Sitemap: ${origin(c)}/sitemap.xml`,
        "",
      ].join("\n"),
    ),
  )
  .get("/sitemap.xml", async (c) => {
    const rows = await drizzle(c.env.DB).select({ id: maps.id }).from(maps).where(isPublished);
    const urls = [`${origin(c)}/`, ...rows.map((r) => mapUrl(origin(c), r.id))];
    const body = urls.map((u) => `<url><loc>${u}</loc></url>`).join("");
    return c.body(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
      200,
      { "Content-Type": "application/xml; charset=utf-8" },
    );
  });
