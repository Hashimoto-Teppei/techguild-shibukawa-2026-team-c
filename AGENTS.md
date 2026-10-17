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
- レビュー承認は必須ではない。マージは squash merge のみ。マージ後ブランチは自動削除

## Agent skills

### Issue tracker

Issue と仕様は GitHub Issues で管理（`gh` CLI）。See `docs/agents/issue-tracker.md`.

### Triage labels

デフォルトの5ラベル（needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix）を使用。See `docs/agents/triage-labels.md`.

### Domain docs

single-context（ルートに `GLOSSARY.md` と `docs/adr/`）。See `docs/agents/domain.md`.
