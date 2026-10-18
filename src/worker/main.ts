import { Hono } from "hono";
import api from "./index";
import { pages } from "./pages";

// /api は index.ts、それ以外（公開ページの HTML・robots.txt・sitemap.xml）は pages.ts
// pages.ts は Worker 専用の型（HTMLRewriter）を使うので、クライアントが型を読む index.ts からは参照しない
export default new Hono<{ Bindings: Env }>().route("/", api).route("/", pages);
