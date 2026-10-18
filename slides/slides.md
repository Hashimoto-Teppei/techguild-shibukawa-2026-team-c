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
    <h3 class="mt-2">見る人は探しにくい</h3>
    <p class="mt-2 text-sm">観光・地域の情報がいくつものサイトに散らばり、目的に合う場所や設備を見つけにくい</p>
  </div>
  <div class="panel">
    <lucide-user-round class="text-3xl text-sea" />
    <h3 class="mt-2">出す人は手が足りない</h3>
    <p class="mt-2 text-sm">情報を出す職員は専任の Web 担当ではない。整理・更新の手間が負担になる</p>
  </div>
  <div class="panel">
    <lucide-printer class="text-3xl text-sea" />
    <h3 class="mt-2">紙は一度配ると直せない</h3>
    <p class="mt-2 text-sm">チラシやマップは、イベントや営業時間が変わっても配ったまま</p>
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
    <p class="mt-1 text-sm">作成者は自分のマップだけを編集。閲覧者はログイン不要</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-layers class="text-sea" /> 目的別のレイヤー</h3>
    <p class="mt-1 text-sm">参加者向け・会場設備・開催準備・安全救護。1つのスポットを複数のレイヤーで使える</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-calendar-clock class="text-sea" /> 臨時スポット</h3>
    <p class="mt-1 text-sm">イベントは掲載期間つきで追加。期間が過ぎると自動で消える</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-panels-top-left class="text-sea" /> マップを LP に</h3>
    <p class="mt-1 text-sm">ヘッダー画像と説明文で、マップのページを案内ページにできる</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-qr-code class="text-sea" /> QR で配る</h3>
    <p class="mt-1 text-sm">レイヤーごとに QR を印刷して店頭へ。URL は配ったあとも変えない</p>
  </div>
  <div class="panel">
    <h3 class="flex items-center gap-2"><lucide-navigation class="text-sea" /> 経路</h3>
    <p class="mt-1 text-sm">スポットから Google マップのナビを開く</p>
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
（約45秒）1つの Vite プロジェクトを1つの Cloudflare Worker にデプロイ。1日で作り切るための構成
-->

---
t: 0.76
---

# 設計の工夫

<div class="mt-6 grid grid-cols-2 gap-4">
  <div class="panel">
    <h3>配った URL を変えない</h3>
    <p class="mt-1 text-sm">QR は印刷・ラミネートして置くもの。レイヤーは名前ではなく ID で持ち、名前を直しても QR は壊れない</p>
  </div>
  <div class="panel">
    <h3>期間外のスポットは API で除く</h3>
    <p class="mt-1 text-sm">臨時スポットは掲載期間を過ぎると、作成者が消し忘れても公開側に出ない</p>
  </div>
  <div class="panel">
    <h3>他人のマップは見えない</h3>
    <p class="mt-1 text-sm">管理 API はすべて作成者で絞り、他人のマップは「存在しない」と返す</p>
  </div>
  <div class="panel">
    <h3>AI と1日で作る</h3>
    <p class="mt-1 text-sm">Claude Code で実装とセルフレビュー。仕様は docs/ に短いメモで残す</p>
  </div>
</div>

<!--
（約45秒）URLのIDは作成後に固定し、レイヤーのIDを使うためQRを維持できる。掲載期間外スポットは公開APIから除外。管理APIは作成者IDで所有マップを絞る。
-->

---
t: 0.88
layout: center
---

<div class="text-center">
  <h1 class="!text-6xl">たまりんマップ</h1>
  <p class="mt-4 text-xl">見る人はログイン不要、作る人は自分で更新できる</p>
</div>

<div class="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3 text-center text-sm">
  <div class="panel !p-4">地域の作成者に<br />使ってもらい改善</div>
  <div class="panel !p-4">通報・<br />モデレーション</div>
  <div class="panel !p-4">印刷前に<br />独自ドメイン</div>
</div>

<!--
（約40秒）「まずは地域の情報を探しやすくするところから、渋川を訪れるきっかけを作ります。」
-->
