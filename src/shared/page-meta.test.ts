import { describe, expect, it } from "vitest";
import { pageMeta, SITE_DESCRIPTION, SITE_NAME } from "./page-meta";

const origin = "https://example.com";
const map = { id: "abc", title: "渋川マップ", description: "", headerImageKey: null };

describe("pageMeta", () => {
  it("マップがなければサービス共通", () => {
    expect(pageMeta(origin)).toEqual({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      image: `${origin}/og.png`,
      url: `${origin}/`,
    });
  });

  it("マップ名・正規 URL を入れ、説明文と画像がなければ共通のものを使う", () => {
    expect(pageMeta(origin, map)).toEqual({
      title: `渋川マップ | ${SITE_NAME}`,
      description: SITE_DESCRIPTION,
      image: `${origin}/og.png`,
      url: `${origin}/m/abc`,
    });
  });

  it("説明文は空白をまとめて120字で切る", () => {
    const meta = pageMeta(origin, { ...map, description: `海\n\n  と${"あ".repeat(200)}` });
    expect(meta.description.startsWith("海 と")).toBe(true);
    expect(meta.description).toHaveLength(120);
  });

  it("絵文字やサロゲートペアを途中で割らない", () => {
    const meta = pageMeta(origin, { ...map, description: `${"あ".repeat(119)}𠮷野家` });
    expect(meta.description).toBe(`${"あ".repeat(119)}𠮷`);
  });

  it("ヘッダー画像は絶対 URL", () => {
    const meta = pageMeta(origin, { ...map, headerImageKey: "maps/abc/x y" });
    expect(meta.image).toBe(`${origin}/api/images/maps/abc/x%20y`);
  });
});
