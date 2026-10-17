// 横に流れる波の形。サイト（src/client/components/public/wave.tsx）と発表スライド（slides/components/Wave.vue）で共有する
// 1周期 300 の波を 8 周期（2400）ぶん。半分ずらすと同じ形に戻るので、継ぎ目なく流せる
const crests = Array.from({ length: 15 }, (_, i) => ` T${300 + i * 150} 30`).join("");
export const WAVE_PATH = `M0 30 Q75 8 150 30${crests} V60 H0Z`;
