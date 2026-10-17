<!-- 構成図。1つの Vite プロジェクトを1つの Cloudflare Worker にデプロイする（docs/tech-stack.md） -->
<script setup lang="ts">
const ARROW = "M0 12 H44 M36 4 L44 12 L36 20";
</script>

<template>
  <div class="grid grid-cols-[10rem_3rem_1fr_3rem_10rem] items-center gap-y-3 text-ink [&_.panel_p]:leading-snug">
    <div class="flex flex-col gap-3">
      <div class="panel !p-4">
        <div class="flex items-center gap-2 font-bold"><lucide-smartphone /> 閲覧者</div>
        <p class="mt-1 text-xs">ログイン不要<br />QR・URL から開く</p>
      </div>
      <div class="panel !p-4">
        <div class="flex items-center gap-2 font-bold"><lucide-pencil-line /> 作成者</div>
        <p class="mt-1 text-xs">サインアップして<br />自分のマップを編集</p>
      </div>
    </div>

    <svg viewBox="0 0 48 24" class="mx-auto w-10 text-lagoon">
      <path :d="ARROW" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>

    <div class="rounded-[1.75rem] bg-sand p-4">
      <div class="mb-3 flex items-center gap-2 font-heading text-lg">
        <lucide-cloud /> Cloudflare Workers
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-foam p-3">
          <div class="font-bold">画面（SPA）</div>
          <p class="mt-1 text-xs leading-relaxed">React / TanStack Router<br />Tailwind CSS / shadcn/ui</p>
        </div>
        <div class="rounded-2xl bg-foam p-3">
          <div class="font-bold">API（/api/*）</div>
          <p class="mt-1 text-xs leading-relaxed">Hono / BetterAuth<br />Drizzle</p>
        </div>
      </div>
      <p class="mt-3 text-center text-xs">
        画面と API は Hono RPC で型を共有。1つの Worker にまとめてデプロイ
      </p>
    </div>

    <svg viewBox="0 0 48 24" class="mx-auto w-10 text-lagoon">
      <path :d="ARROW" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>

    <div class="flex flex-col gap-2">
      <div class="panel !px-4 !py-3">
        <div class="flex items-center gap-2 font-bold"><lucide-database /> D1</div>
        <p class="mt-1 text-xs">マップ・スポット</p>
      </div>
      <div class="panel !px-4 !py-3">
        <div class="flex items-center gap-2 font-bold"><lucide-image /> R2</div>
        <p class="mt-1 text-xs">ヘッダー画像</p>
      </div>
      <div class="panel !px-4 !py-3">
        <div class="flex items-center gap-2 whitespace-nowrap font-bold"><lucide-map class="shrink-0" /> Google Maps</div>
        <p class="mt-1 text-xs">地図・経路 URL</p>
      </div>
    </div>
  </div>
</template>
