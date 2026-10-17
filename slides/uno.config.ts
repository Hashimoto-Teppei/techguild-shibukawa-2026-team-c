// Slidev 内蔵の UnoCSS に足す設定。色は docs/visual-design.md のトークン（src/client/styles.css と同じ値）
export default {
  theme: {
    colors: {
      ink: "#0b2e4f",
      sea: "#0e7fb8",
      lagoon: "#3cc8d6",
      sand: "#ead3a2",
      buoy: "#ffc72c",
      foam: "#f3f9fa",
    },
  },
  shortcuts: {
    // テーマ既定の白い背景を藍にする（空を描く前の一瞬に白が見えないように）。空は global-bottom.vue が上に描く
    "bg-main": "bg-ink text-white",
    // 空の上に置く面。文字は藍
    panel: "rounded-[1.75rem] bg-foam p-5 text-ink",
  },
};
