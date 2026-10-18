// SNS のカードと検索エンジン向けのメタ情報（docs/share.md）。Worker が HTML に差し込む
export const SITE_NAME = "たまりんマップ";
export const SITE_DESCRIPTION =
  "地域のお店や団体が、おすすめや案内を地図にまとめて公開する観光マップ。目的別のレイヤーでスポットを探せます。";
const DESCRIPTION_LENGTH = 120;

export function imageUrl(key: string) {
  return `/api/images/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function mapUrl(origin: string, mapId: string) {
  return `${origin}/m/${encodeURIComponent(mapId)}`;
}

type PublicMap = { id: string; title: string; description: string; headerImageKey: string | null };

// map がなければサービス共通（トップ・非公開ページ）。url は ?layer= を外した正規 URL
export function pageMeta(origin: string, map?: PublicMap) {
  if (!map)
    return {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      image: `${origin}/og.png`,
      url: `${origin}/`,
    };
  const description = map.description.replace(/\s+/g, " ").trim();
  return {
    title: `${map.title} | ${SITE_NAME}`,
    // 文字単位で切る（slice だと絵文字や𠮷のようなサロゲートペアが割れる）
    description: description
      ? Array.from(description).slice(0, DESCRIPTION_LENGTH).join("")
      : SITE_DESCRIPTION,
    image: `${origin}${map.headerImageKey ? imageUrl(map.headerImageKey) : "/og.png"}`,
    url: mapUrl(origin, map.id),
  };
}
