---
theme: default
title: たまりんマップ
colorSchema: light
fonts:
  provider: none
transition: fade
layout: center
# 背景の時刻（global-bottom.vue）。0 = 夜明け前、0.3 = 昼、0.64 = 日の入り、0.85 = 夜
t: 0.03
---

<!-- 文面は仮。docs/presentation-outline.md から起こした。章ごとの時間は #54 の表のとおり -->

<div class="text-center">
  <p class="text-lg">techguild 渋川 2026 ・ チーム「カメに懸賞金」</p>
  <h1 class="!text-7xl !mt-4 !mb-6">たまりんマップ</h1>
  <p class="text-2xl">たまのじゃない、いつでもたまらんマップ</p>
</div>

<!--
（約20秒）チーム名と作品名
-->

---
t: 0.12
---

# このサービスにした理由

<div class="mt-8 grid grid-cols-3 gap-5">
  <div class="panel">
    <lucide-search class="text-3xl text-sea" />
    <h3 class="mt-2">目的に合う場所を探しにくい</h3>
    <p class="mt-2 text-sm">観光・地域情報が分かれていて、場所や設備を見比べにくい</p>
  </div>
  <div class="panel">
    <lucide-user-round class="text-3xl text-sea" />
    <h3 class="mt-2">情報の整理・更新が大変</h3>
    <p class="mt-2 text-sm">情報を発信する人は、専任の Web 担当とは限らない。情報の整理や更新に手間がかかる</p>
  </div>
  <div class="panel">
    <lucide-printer class="text-3xl text-sea" />
    <h3 class="mt-2">変更後の情報が届きにくい</h3>
    <p class="mt-2 text-sm">紙で案内を配った後、内容が変わっても伝えにくい</p>
  </div>
</div>

<p class="mt-6 text-sm">※ 現地での検証はこれから。期待する価値として説明する</p>

<!--
（約1分）「ビーチスポーツ体験会を開くとき、参加者に会場設備や持ち物、当日の案内を分かりやすく届ける必要があります。これは利用者への聞き取り結果ではなく、協会の皆さまに向けた活用提案です。」
-->

---
t: 0.3
---

# サービスの機能

<div class="mt-6 grid grid-cols-3 gap-4">
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-map-pinned class="text-sea" /> 誰でも作って公開</h3>
    <p class="mt-1 text-sm">作成者はマップを編集・公開。閲覧者はログイン不要</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-layers class="text-sea" /> 目的別のレイヤー</h3>
    <p class="mt-1 text-sm">参加者向け・会場設備など目的別に整理。スポットは複数レイヤーに登録可能</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-calendar-clock class="text-sea" /> 臨時スポット</h3>
    <p class="mt-1 text-sm">掲載期間を設定。期間外は公開ページで自動非表示</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-panels-top-left class="text-sea" /> マップを案内ページに</h3>
    <p class="mt-1 text-sm">ヘッダー画像と説明文でマップを紹介</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-qr-code class="text-sea" /> QR で配る</h3>
    <p class="mt-1 text-sm">レイヤーを選んで発行。QR の URL は配布後も変わらない</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-navigation class="text-sea" /> 経路</h3>
    <p class="mt-1 text-sm">Google マップでスポットまでの経路を開く</p>
  </div>
</div>

<!--
（約1分）デモで見せない機能はここで触れる
-->

---
t: 0.6
layout: center
---

<div class="text-center">
  <h1 class="!text-8xl">デモ</h1>
  <p class="mt-6 text-lg">techguild-shibukawa-2026-team-c.hashimoto-2f0.workers.dev</p>
</div>

<!--
（約2分30秒）公開一覧から「渋川ビーチスポーツ大会（デモ）」を開く。参加者向けで申込・持ち物・中止連絡、会場設備でトイレ・駐車・更衣や給水の確認状況、開催準備で許可・区画・受付・用具、安全救護でAED・中止基準・保険を見る。通常情報と要確認事項を分け、運営用の仮ピンは配置予定地ではないと説明する。管理画面で掲載期間を編集して自動非表示を見せ、参加者向けQR印刷ページを表示する。
-->

---
t: 0.7
---

# 技術スタックとアーキテクチャ

<Architecture class="mt-4" />

<!--
（約45秒）「画面とAPIを1つの Cloudflare Worker にまとめています。マップ情報はD1、ヘッダー画像はR2に保存し、経路案内にはGoogleマップを使います。限られた開発時間で作れるよう、構成をシンプルにしました。」
-->

---
t: 0.76
---

# 設計の工夫

<div class="mt-6 grid grid-cols-3 gap-4">
  <div class="panel">
    <h3>配った URL を変えない</h3>
    <p class="mt-1 text-sm">QRコードを配った後でレイヤー名を変えても、同じQRコードを使い続けられる</p>
  </div>
  <div class="panel">
    <h3>掲載期間が過ぎたら非表示</h3>
    <p class="mt-1 text-sm">終了日を過ぎたスポットは、公開ページに自動で表示されなくなる</p>
  </div>
  <div class="panel">
    <h3>他人のマップは編集できない</h3>
    <p class="mt-1 text-sm">ログインした人と作成者を照らし合わせ、本人のマップだけを編集できる</p>
  </div>
</div>

<!--
（約45秒）「QRコードを配った後でレイヤー名を変えても、そのQRコードは使い続けられます。臨時スポットは掲載終了日を過ぎると、自動で公開ページから非表示になります。また、マップを編集できるのは作成者だけです。」
-->

---
t: 0.88
layout: center
---

<div class="text-center">
  <h1 class="!text-6xl">たまりんマップ</h1>
  <p class="mt-4 text-xl">見る人はログイン不要、作る人は自分で更新できる</p>
</div>

<p class="mx-auto mt-8 max-w-3xl text-center text-lg">
  次は、地域の方に使ってもらい、情報の探しやすさや更新のしやすさを確かめながら改善します。
</p>

<p class="mx-auto mt-4 max-w-3xl text-center text-sm">
  QRコード発行画面（ログインが必要）: <a href="https://techguild-shibukawa-2026-team-c.hashimoto-2f0.workers.dev/admin/maps/shibukawa/qr">https://techguild-shibukawa-2026-team-c.hashimoto-2f0.workers.dev/admin/maps/shibukawa/qr</a>
</p>

<!--
（約40秒）「見る人はログイン不要で、作る人は自分で更新できます。次は地域の方に使ってもらい、情報の探しやすさや更新のしやすさを確かめながら改善します。」
-->
