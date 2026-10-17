// ?layer= で表示するスポットを絞る。配った QR が壊れないよう、知らないレイヤーは全表示にする（docs/public-url.md）

type LayeredSpot = { layerIds: string[] };

export function filterByLayer<T extends LayeredSpot>(
  spots: T[],
  layers: { id: string }[],
  layerId: string | undefined,
): { activeLayerId: string | undefined; spots: T[] } {
  const activeLayerId = layers.some((l) => l.id === layerId) ? layerId : undefined;
  if (!activeLayerId) return { activeLayerId, spots };
  return { activeLayerId, spots: spots.filter((s) => s.layerIds.includes(activeLayerId)) };
}
