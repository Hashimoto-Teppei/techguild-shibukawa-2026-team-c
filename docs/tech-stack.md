# 技術スタック

1日で作り切るため、**1つの Vite プロジェクトを1つの Cloudflare Worker にデプロイ**する。モノレポにはしない。

## 採用

| 区分 | 採用 |
|---|---|
| 基盤 | mise / Node 24 / pnpm 12 / Biome / Vitest |
| フロント | React / TypeScript / Vite / TailwindCSS v4 / shadcn/ui / TanStack Router / TanStack Query / react-hook-form / Zod |
| API | Hono（RPC の `hc` でフロントと型共有） / Drizzle / BetterAuth |
| インフラ | Cloudflare Workers（Static Assets） / D1 / R2 / `@cloudflare/vite-plugin` |
| 地図 | Google Maps Platform（`@vis.gl/react-google-maps`） |
| QR | `qrcode.react` |

## 決めたこと

- **構成**: SPA と Hono API を同じプロジェクトに置き、`@cloudflare/vite-plugin` で `vite dev` 1本で D1 / R2 込みのローカル開発をする
- **ログイン**: BetterAuth（Drizzle アダプタで D1 に保存）。D1 はリクエストごとの binding なので、auth インスタンスはリクエスト内で生成する
  - 公開サインアップは無効にし、職員アカウントは管理者が作る
- **公開 URL**: QR で配るので、パスと search params（キー名・値）は一度配ったら変えない
- **Google Maps API キー**: HTTP リファラー制限と、使う API だけに絞る制限をかける
- **UI**: shadcn/ui。必要なコンポーネントだけ追加する
- **URL の状態**（表示中レイヤーなど）: TanStack Router の search params を Zod で型付けして持つ。QR でレイヤーを絞った URL も配れる
- **ルート表示**: Google マップの経路 URL（`https://www.google.com/maps/dir/?api=1&destination=...`）を開く。Directions API は使わない
- **画像**: LP の画像は R2 に保存する。アップロード時に Worker 側で画像の Content-Type とサイズ上限をチェックする
- **テスト**: Vitest。臨時スポットの表示判定などの純粋関数に絞る
- **アカウント**: Google Maps API キー・Cloudflare アカウントは橋本が用意する

## 入れないもの

- pnpm workspace / turborepo: パッケージが1つなので不要
- zustand: サーバー状態は TanStack Query、URL 状態はルーターで足りる
- nuqs: TanStack Router の search params で代替
- TanStack Table: デモ規模なので素の `<table>` で足りる
- React Aria: shadcn/ui を採用
