// 部品づくり用の仮データ（#30 #31 #13）。形は API（GET /api/maps/:mapId）の返り値に合わせてある

export const mockMapList = [
  { id: "shibukawa", title: "渋川さんぽマップ", headerImageKey: null },
  { id: "demo-cafe", title: "海辺のカフェめぐり", headerImageKey: null },
];

export const mockMap = {
  id: "shibukawa",
  title: "渋川さんぽマップ",
  description: "家族でもデートでも楽しめる、渋川のおすすめスポットをまとめました。",
  headerImageKey: null as string | null,
  layers: [
    { id: "family", name: "家族向け" },
    { id: "date", name: "デート向け" },
  ],
  spots: [
    {
      id: "spot-1",
      name: "渋川海岸",
      description: "遠浅で穏やかな海水浴場。",
      lat: 34.4539,
      lng: 133.9047,
      layerIds: ["family", "date"],
    },
    {
      id: "spot-2",
      name: "王子が岳",
      description: "瀬戸内海を一望できる展望スポット。",
      lat: 34.4619,
      lng: 133.8822,
      layerIds: ["date"],
    },
  ],
};

export type MapData = typeof mockMap;
export type Spot = MapData["spots"][number];
export type Layer = MapData["layers"][number];
