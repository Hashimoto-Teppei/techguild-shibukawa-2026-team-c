// 公開ページに出す項目の値。いま属しているレイヤーの項目だけを、渡された順（レイヤー順 → 作成順）で返す
// 値は外したレイヤーの分も DB に残っているので、ここで絞る（docs/layer-fields.md）

type Field = { id: string; layerId: string; name: string };

export function visibleFieldValues(
  layerIds: string[],
  fields: Field[],
  values: Map<string, string>,
): { name: string; value: string }[] {
  return fields
    .filter((f) => layerIds.includes(f.layerId))
    .map((f) => ({ name: f.name, value: values.get(f.id)?.trim() ?? "" }))
    .filter((f) => f.value);
}
