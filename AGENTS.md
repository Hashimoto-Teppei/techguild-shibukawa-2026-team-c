# AGENTS.md

このリポジトリで作業する AI コーディングエージェント（Claude Code、Codex、Cursor など）向けのガイド。

## プロジェクト概要

ハッカソン「techguild 渋川 2026」（テーマ: ITの力を使って渋川を盛り上げる）のチーム「カメに懸賞金」(team-c) のリポジトリ。

Googleマイマップのような観光マップWebサービスを作る。**ユーザーがマップを作って公開し、別のユーザーがそれを見る**サービスで、特定の組織専用ではない。**ハッカソンの開発時間は1日程度**。現在は**実装フェーズ**。技術スタックは `docs/tech-stack.md` で決定済み。

## 提案の柱（仕様の前提）

提案時のアイデア。MVP で段階的に作るのではなく、ハッカソンの最終成果物としてこれらを作り切ることを目指す。

- **作成者と閲覧者**: マップを作る「作成者」は誰でもサインアップでき、自分のマップだけを編集できる。マップを見る「閲覧者」はログイン不要
- **ITリテラシーが高くない作成者でも運用できる**ことが最大の強み。自治体・観光協会の職員はその代表例（ペルソナは参考例で、利用者を限定しない）。運用の仕組みはこれを最優先する
- **旅行目的別のレイヤー**: 家族向け・デート向け・1日観光コースなど。スポットは複数レイヤーに属しうる
- **QRコード配布**: マップごとにQRを発行し、印刷・ラミネートして店舗に設置できる。つまり**公開URLは一度配ったら変えられない**前提で設計する
- **イベント時の臨時スポット**: 期間限定で追加・自動的に非表示にできる
- **マップページのLP化**: マップページをランディングページのようにカスタマイズできる（ヘッダー画像、説明文、セクション構成など）
- **ルート表示**: Googleマップの経路URLを開く

## 決定済みの仕様

技術構成は `docs/tech-stack.md`、公開 URL は `docs/public-url.md`、デモシナリオは `docs/demo-scenario.md`、画面・機能の範囲と担当分けは `docs/team-plan.md`、レイヤーの項目は `docs/layer-fields.md`、配色・書体・動きは `docs/visual-design.md`、UI 改善の方針と文言（岡山弁）は `docs/ui-ux.md`、シェアと OGP・SEO は `docs/share.md`。用語は `GLOSSARY.md` に合わせる。

## コマンド

タスクは `mise.toml` で管理する（`package.json` の scripts は使わない）。`mise run <タスク名>` で実行し、一覧は `mise tasks` で見られる。

| コマンド | 内容 |
|---|---|
| `mise run dev` | 開発サーバー（http://localhost:5173）。D1 / R2 もローカルで動く |
| `mise run build` | 型チェック + ビルド |
| `mise run lint` / `mise run format` | Biome でチェック / 自動修正 |
| `mise run test` | Vitest |
| `mise run db:reset` | ローカル DB を作り直してデモデータを入れる |
| `mise run db:generate` | `schema.ts` を変えたらマイグレーションを生成（その後 `mise run db:migrate`） |
| `mise run slides:dev` | 発表スライド（http://localhost:3030）。`slides/slides.md` を書く |
| `mise run slides:build` | スライドを `dist/client/slides` にビルド（`build` の後に実行）。本番では `/slides/` で公開される |
| `mise run typegen` | `wrangler.jsonc` を変えたら `Env` の型を作り直す |
| `mise run prod:deploy` | 【本番・橋本のみ】ビルド（スライド込み）→ 本番 D1 にマイグレーション → Cloudflare Workers にデプロイ |
| `mise run prod:migrate` | 【本番・橋本のみ】本番 D1 にマイグレーションだけ適用 |

- 本番に触るタスクは `prod:` で始まり、実行前に確認が出る。それ以外のタスクはローカルにしか作用しない
- エージェントは `prod:` タスクを実行しない

## アーキテクチャ

1つの Vite プロジェクトを1つの Cloudflare Worker にデプロイする。`/api/*` だけ Worker（Hono）が受け、それ以外は SPA を返す（`wrangler.jsonc` の `assets`）。

```
src/
  worker/              API（Hono）。index.ts にルート、auth.ts に BetterAuth
    db/schema.ts       Drizzle のスキーマ（変えたら mise run db:generate）
  client/              SPA（React）
    routes/            画面。TanStack Router のファイルベースルーティング（route-tree.gen.ts は自動生成）
    components/public/ 公開ページの部品（#30）。波（wave.tsx）とトップの1日の空（day-sky.tsx）
    components/admin/  管理画面の部品（#31 #13）
    components/ui/     shadcn/ui（`pnpm dlx shadcn@latest add <名前>` で追加）
    lib/api.ts         API クライアント（Hono RPC。Worker のルートから型が付く）
    mock-data.ts       部品づくり用の仮データ
    styles.css         色のトークン（docs/visual-design.md）。fonts.css は見出しフォントで、main.tsx から後読み
  shared/              Worker とフロントで共有する純粋関数（テストはここに置く）
db/                    seed.sql（デモデータ）と reset.sql
drizzle/               マイグレーション（自動生成）
slides/                発表スライド（Slidev）。文面は slides.md、背景の空と波は global-bottom.vue（スライドごとに frontmatter の t で時刻を指定）
```

- 管理 API（`/api/admin/*`）はログイン必須。マップ単位の API は必ず `ownerId` で絞り、他人のマップは 404 を返す
- 公開 API は `published = true` のマップだけ返す。掲載期間外のスポットは API の時点で除く（`src/shared/spot-period.ts`）
- デモ用ログイン: `kanko@example.com` / `demo-pass-1234`（`db/seed.sql`）。本番では別のパスワードに変えてあり、リポジトリには置かない（橋本に聞く）

## 本番環境

- URL: https://techguild-shibukawa-2026-team-c.hashimoto-2f0.workers.dev（スライドは `/slides/`）
- D1 `team-c` / R2 `team-c-images`。`BETTER_AUTH_SECRET` は `wrangler secret`、`BETTER_AUTH_URL` は `wrangler.jsonc` の `vars`
- 本番 DB のデモデータは投入済み（大会マップ `beach-sports-demo` も含む。経緯は `docs/demo-data.md`）。`db/seed.sql` を本番に流さない（公開パスワードのアカウントができる）。入れ直しが必要なら橋本に頼む

## 開発方針

ハッカソンなので**開発速度を最優先**する。開発時間は1日程度しかない。

- **作り込まない・考えすぎない**。1日で作り切れる量に絞り、迷ったら作らない。見た目が多少粗くても、デモで一連の流れが動くことを優先する
- **検討は「決める」ことが目的**。ドキュメントは短いメモで十分で、網羅的に書かない
- **今決められることだけ決める**。決まっていないことは決まった時点でこのファイルに追記し、やってみて合わなければ変える。方針の見直し・改善そのものを方針とする
- **Issue は細かく切りすぎない**。関連する作業はなるべく1つの PR にまとめる（1 PR で複数 Issue を閉じてよい）
- **コードレビューはエージェントに任せる**。PR を作る前に Claude Code の `/code-review` でセルフレビューし、指摘を直してから PR を出す（`--fix` で修正まで任せてもよい）
  - プロジェクト固有の観点が増えてきたら、専用のレビューエージェント（`.claude/agents/`）に切り出す
- **検証はローカルで行う**。CI は今は導入しない。PR を出す前に、手元で動作確認と `mise run lint` / `mise run test` / `mise run build` を通す

## ブランチ運用（GitHub Flow）

- **エージェントはコミット・push・PR 作成を自動で行わない**。変更内容を提示していったん止まり、ユーザーの指示を受けてから実行する
- `main` は常に動く状態。直接 push しない（ブランチ保護は未設定なので運用で守る）。変更はすべて PR 経由
- 作業ブランチは `main` から `<type>/<内容>` で切る。type は `feat` / `fix` / `docs` / `chore`（例: `feat/layer-filter`）
- PR 本文に `Closes #<番号>` を書いて Issue を紐付ける（複数可）
- 人によるレビュー承認は必須ではない（上記の `/code-review` を通しておく）。マージは通常のマージ（merge commit）のみ。PR 単位の履歴は `git log --first-parent main` で見る。マージ後ブランチは自動削除

## Issue の進め方

マイルストーン ①価値検討（#16）→ ②仕様決定（#4）→ ③実装 の順に進める。前後関係は GitHub の issue dependencies（blocked by）に登録してあるので、着手前に確認する。

検討系の Issue（`question`）は、議論を Issue 上で行い、結論を `docs/` に短いメモで書いて PR で入れる（PR 本文の `Closes #<番号>` で Issue を閉じる）。

## ドキュメント構成

- 検討の結論は `docs/` 直下に1テーマ1ファイルで置く（例: `docs/personas.md`）。サブフォルダで細かく分類しない
- 機能を足すときは、`docs/team-plan.md` には画面・データの範囲を1行で足し、細かい仕様は `docs/<機能名>.md` に分ける（例: `docs/layer-fields.md`）。追加したファイルは「決定済みの仕様」に載せる
- 用語は `GLOSSARY.md`（定義だけ。仕様は書かない）
- `docs/agents/` はエージェントスキルの設定
- 画像は `docs/images/` に置く

## ファイル管理（Mac / Windows 混在）

メンバーには Windows ユーザーがいる。改行は `.gitattributes` で LF、文字コード等は `.editorconfig` で統一している。

- ファイル名・フォルダ名は**英小文字とハイフン**（例: `user-flows.md`）。中身は日本語でよい。`README.md` / `AGENTS.md` / `GLOSSARY.md` など慣例で大文字のものは除く
  - 日本語のファイル名は使わない（Mac と Windows で Unicode 正規化が異なり、二重登録や文字化けの原因になる）
  - 大文字小文字だけが違う名前を作らない（Windows では同じファイル扱い）
  - Windows の予約名（`CON`, `PRN`, `AUX`, `NUL`, `COM1` など）と `: ? * < > | "` を使わない
  - 例外: TanStack Router のルートファイル（`src/client/routes/`）は `$mapId.tsx` や `_authed` のように記法どおりの名前にする
- シンボリックリンクを使わない（`CLAUDE.md` は `@AGENTS.md` の読み込みで対応している）
- スクリプトやコマンドは Windows でも動くものにする（例: npm scripts で `rm -rf` や `VAR=value cmd` を使わない）

## Agent skills

### Issue tracker

Issue と仕様は GitHub Issues で管理（`gh` CLI）。See `docs/agents/issue-tracker.md`.

### Triage labels

デフォルトの5ラベル（needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix）を使用。See `docs/agents/triage-labels.md`.

### Domain docs

single-context（ルートに `GLOSSARY.md`、決定は `docs/` 直下）。See `docs/agents/domain.md`.
