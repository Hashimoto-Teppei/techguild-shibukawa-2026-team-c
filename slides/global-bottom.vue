<!-- 全スライド共通の背景。サイトのトップの「渋川の1日」と同じ景色（src/shared/day-sky.ts）。
     スライドの frontmatter の t（0 = 夜明け前、0.64 = 日の入り、1 = 次の夜明け前）の時刻を描き、切り替えのときだけ時間を進める -->
<script setup lang="ts">
import { useNav } from "@slidev/client";
import { computed, onUnmounted, ref, watch } from "vue";
import {
  GLINT,
  GLINT_STOPS,
  GLOW,
  GLOW_OPACITY,
  ISLAND,
  ISLANDS,
  LAGOON,
  LIGHTS,
  lerp,
  MOON,
  MOON_GLINT,
  MOON_GLINT_STOPS,
  moonAt,
  NIGHT,
  SEA,
  SKY,
  STARS,
  STOPS,
  SUN_COLORS,
  SUN_STOPS,
  sunAt,
} from "../src/shared/day-sky";
import Wave from "./components/Wave.vue";

// t の書き間違い（数値でない・0〜1 の外）は昼にする
const { currentFrontmatter } = useNav();
const target = computed(() => {
  const v = Number(currentFrontmatter.value.t);
  return v >= 0 && v <= 1 ? v : 0.3;
});
const t = ref(target.value);

// 前のスライドの時刻から、ease-out で時間を進める。視差効果を減らす設定なら一瞬で切り替える
const DURATION = 1600;
let frame = 0;
watch(target, (to) => {
  cancelAnimationFrame(frame);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    t.value = to;
    return;
  }
  const from = t.value;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min((now - start) / DURATION, 1);
    t.value = from + (to - from) * (1 - (1 - p) ** 3);
    if (p < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
});
onUnmounted(() => cancelAnimationFrame(frame));

const s = computed(() => {
  const v = t.value;
  const at = (ys: (number | string)[]) => lerp(STOPS, ys, v);
  return {
    sky: at(SKY),
    glow: at(GLOW),
    glowOpacity: at(GLOW_OPACITY),
    island: at(ISLAND),
    sea: at(SEA),
    lagoon: at(LAGOON),
    night: at(NIGHT),
    sun: sunAt(v),
    sunColor: lerp(SUN_STOPS, SUN_COLORS, v),
    glint: lerp(GLINT_STOPS, GLINT, v),
    moon: moonAt(v),
    moonGlint: lerp(MOON_GLINT_STOPS, MOON_GLINT, v),
  };
});
</script>

<template>
  <div aria-hidden="true" class="absolute inset-0 -z-1 overflow-hidden">
    <div class="absolute inset-0" :style="{ backgroundColor: s.sky }">
      <div
        class="absolute inset-0"
        :style="{
          background: `linear-gradient(to top, ${s.glow}, transparent 65%)`,
          opacity: s.glowOpacity,
        }"
      />
      <div class="absolute inset-0" :style="{ opacity: s.night }">
        <span
          v-for="star in STARS"
          :key="`${star.left}-${star.top}`"
          class="twinkle absolute rounded-full bg-white"
          :style="{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }"
        />
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-0">
      <div class="relative">
        <!-- 太陽と月が通る空。島と海が後ろに重なるので、沈むと隠れる -->
        <div class="absolute inset-x-0 bottom-0 h-56">
          <div
            class="absolute size-20 -translate-x-1/2 rounded-full shadow-[0_0_80px_10px_rgb(255_170_70/0.45)]"
            :style="{ left: `${s.sun.x}%`, bottom: `${s.sun.y}%`, backgroundColor: s.sunColor }"
          />
          <div
            class="absolute size-12 -translate-x-1/2 rounded-full shadow-[0_0_48px_8px_rgb(244_240_216/0.35)]"
            :style="{ left: `${s.moon.x}%`, bottom: `${s.moon.y}%`, backgroundColor: MOON }"
          />
        </div>
        <svg
          viewBox="0 0 1200 48"
          preserveAspectRatio="none"
          class="relative block h-10 w-full"
          :style="{ color: s.island }"
        >
          <path :d="ISLANDS" fill="currentColor" />
        </svg>
        <div class="absolute inset-0" :style="{ opacity: s.night }">
          <span
            v-for="[left, top] in LIGHTS"
            :key="`${left}-${top}`"
            class="twinkle absolute size-[3px] rounded-full bg-[#ffd27a] shadow-[0_0_6px_2px_rgb(255_190_90/0.7)]"
            :style="{ left: `${left}%`, top: `${top}%`, animationDelay: `${left % 3}s` }"
          />
        </div>
      </div>

      <div class="relative h-20 overflow-hidden" :style="{ backgroundColor: s.sea }">
        <!-- 太陽・月の光が海面に映る帯 -->
        <div
          class="glint"
          :style="{ left: `${s.sun.x}%`, opacity: s.glint, '--glint': s.sunColor }"
        />
        <div
          class="glint"
          :style="{ left: `${s.moon.x}%`, opacity: s.moonGlint, '--glint': MOON }"
        />
        <div class="absolute inset-0" :style="{ color: s.lagoon }">
          <Wave class="absolute inset-x-0 -top-3 h-6 opacity-60" speed="26s" />
          <Wave class="absolute inset-x-0 bottom-6 h-8 opacity-40" speed="18s" />
        </div>
        <Wave class="absolute inset-x-0 -bottom-px h-6 text-foam" speed="11s" />
      </div>
    </div>
  </div>
</template>
