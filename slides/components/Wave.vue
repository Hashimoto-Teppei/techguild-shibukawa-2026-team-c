<!-- 横に流れる波の帯（形は src/shared/wave.ts）。色は text-* で、高さは h-* で指定する -->
<script setup lang="ts">
import { WAVE_PATH } from "../../src/shared/wave";

withDefaults(defineProps<{ speed?: string }>(), { speed: "14s" });
</script>

<template>
  <div class="pointer-events-none overflow-hidden">
    <svg
      aria-hidden="true"
      viewBox="0 0 2400 60"
      preserveAspectRatio="none"
      class="wave-drift block h-full w-[200%]"
      :style="{ '--wave-speed': speed }"
    >
      <path :d="WAVE_PATH" fill="currentColor" />
    </svg>
  </div>
</template>
