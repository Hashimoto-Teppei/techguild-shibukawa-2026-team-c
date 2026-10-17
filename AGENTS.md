# AGENTS.md

このリポジトリで作業する AI コーディングエージェント（Claude Code、Codex、Cursor など）向けのガイド。

## プロジェクト概要

ハッカソン「techguild 渋川 2026」（テーマ: ITの力を使って渋川を盛り上げる）のチーム「カメに懸賞金」(team-c) のリポジトリ。

Googleマイマップのような観光マップWebサービスを作る。現在は**仕様検討フェーズ**で、コードはまだない。技術スタックは未定なので、勝手に決めて scaffold しないこと（提案は可）。

## 提案の柱（仕様の前提）

- **運用者は自治体・観光協会の職員**。ITリテラシーが高くなくても運用できることが最大の強み。管理画面の設計はこれを最優先する
- **旅行目的別のレイヤー**: 家族向け・デート向け・1日観光コースなど。スポットは複数レイヤーに属しうる
- **QRコード配布**: マップごとにQRを発行し、印刷・ラミネートして店舗に設置できる。つまり**公開URLは一度配ったら変えられない**前提で設計する
- **イベント時の臨時スポット**: 期間限定で追加・自動的に非表示にできる
- **マップページのLP化**: マップページをランディングページのようにカスタマイズできる（ヘッダー画像、説明文、セクション構成など）
- **ルート表示**: Googleマップ連携を検討中（例: Googleマップの経路URLを開く方式か、埋め込みAPIか未決定）

## 未決事項

- 技術スタック、ホスティング
- 地図ライブラリ（Google Maps / Leaflet + OSM など）とルート表示の実現方式
- LPカスタマイズの自由度（テンプレート選択 vs ブロック編集）
- 管理者認証の方式

仕様・技術選定が決まったら、このファイルにコマンド（dev / build / test）とアーキテクチャを追記すること。

## ブランチ運用（GitHub Flow）

- `main` は常に動く状態。直接 push しない（ブランチ保護は未設定なので運用で守る）。変更はすべて PR 経由
- 作業ブランチは `main` から `<type>/<内容>` で切る。type は `feat` / `fix` / `docs` / `chore`（例: `feat/layer-filter`）
- 1 Issue = 1 PR。本文に `Closes #<番号>` を書く。PR は小さく、半日以内のマージを目安にする
- レビュー承認は必須ではない。マージは通常のマージ（merge commit）のみ。PR 単位の履歴は `git log --first-parent main` で見る。マージ後ブランチは自動削除

## Issue の進め方

マイルストーン ①価値検討 → ②仕様決定 → ③実装 の順に進める。前後関係は GitHub の issue dependencies（blocked by）に登録してあるので、着手前に確認する。

検討系の Issue（`question`）は、議論を Issue 上で行い、結論を `docs/` に書いて PR で入れる（PR 本文の `Closes #<番号>` で Issue を閉じる）。

## ドキュメント構成

| 置き場所 | 内容 |
|---|---|
| `GLOSSARY.md` | 用語集（ドメインモデル） |
| `docs/product/` | ①価値検討の結論（ペルソナ、課題、競合比較、成功指標、運用） |
| `docs/spec/` | ②仕様（利用フロー、MVP、画面仕様） |
| `docs/adr/` | 技術判断の記録。`0001-map-library.md` のように4桁連番 |
| `docs/research/` | 調査メモ・統計などの出典 |
| `docs/agents/` | エージェントスキルの設定 |

- フォルダは最初のドキュメントを書くときに作る（空フォルダは作らない）
- 画像はそのドキュメントと同じフォルダの `images/` に置く

## ファイル管理（Mac / Windows 混在）

メンバーには Windows ユーザーがいる。改行は `.gitattributes` で LF、文字コード等は `.editorconfig` で統一している。

- ファイル名・フォルダ名は**英小文字とハイフン**（例: `user-flows.md`）。中身は日本語でよい。`README.md` / `AGENTS.md` / `GLOSSARY.md` など慣例で大文字のものは除く
  - 日本語のファイル名は使わない（Mac と Windows で Unicode 正規化が異なり、二重登録や文字化けの原因になる）
  - 大文字小文字だけが違う名前を作らない（Windows では同じファイル扱い）
  - Windows の予約名（`CON`, `PRN`, `AUX`, `NUL`, `COM1` など）と `: ? * < > | "` を使わない
- シンボリックリンクを使わない（`CLAUDE.md` は `@AGENTS.md` の読み込みで対応している）
- スクリプトやコマンドは Windows でも動くものにする（例: npm scripts で `rm -rf` や `VAR=value cmd` を使わない）

## Agent skills

### Issue tracker

Issue と仕様は GitHub Issues で管理（`gh` CLI）。See `docs/agents/issue-tracker.md`.

### Triage labels

デフォルトの5ラベル（needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix）を使用。See `docs/agents/triage-labels.md`.

### Domain docs

single-context（ルートに `GLOSSARY.md` と `docs/adr/`）。See `docs/agents/domain.md`.
