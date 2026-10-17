# techguild-shibukawa-2026-team-c

ハッカソン「techguild 渋川 2026」チーム「カメに懸賞金」のリポジトリです。テーマは「ITの力を使って渋川を盛り上げる」。

誰でもマップを作って公開でき、ITリテラシーが高くなくても運用できる、Googleマイマップのような観光マップサービスを作ります。

## 進め方

- 作業は GitHub Issues で管理し、マイルストーン ①価値検討 → ②仕様決定 → ③実装 の順に進めます
- ブランチ運用・ドキュメント構成・ファイル名のルールは [AGENTS.md](AGENTS.md) を参照してください（AI エージェントと人間で共通のルールです）

## 初回セットアップ

```sh
git clone git@github.com:Hashimoto-Teppei/techguild-shibukawa-2026-team-c.git
cd techguild-shibukawa-2026-team-c
mise install        # Node 24 と pnpm 12 が入る（mise がなければ https://mise.jdx.dev から入れる）
pnpm install
```

`.dev.vars.example` を `.dev.vars` に、`.env.example` を `.env` にコピーします（エクスプローラーや Finder でコピーしてもよい）。Google Maps の API キーは橋本から受け取って `.env` に書きます。

```sh
pnpm db:reset       # ローカル DB を作ってデモデータを入れる
pnpm dev            # http://localhost:5173 を開く
```

管理画面は http://localhost:5173/admin/login です。デモ用アカウントは `kanko@example.com` / `demo-pass-1234` です。

PR を出す前に `pnpm lint` と `pnpm test` を通してください。ほかのコマンドは [AGENTS.md](AGENTS.md) にあります。

### Windows の場合

Git for Windows を使う前提です。クローンの前に一度だけ実行してください。

```sh
git config --global core.longpaths true   # 260文字を超えるパスでのエラーを防ぐ
git config --global core.autocrlf false   # 改行は .gitattributes で LF に統一しているため
```

- エディタは `.editorconfig` に対応したもの（VS Code など）を使ってください。文字コード UTF-8・改行 LF が自動で適用されます
- Windows PowerShell 5 の `>` や `Out-File` で書き出したファイルは UTF-16 になり文字化けします。ファイルはエディタで作成してください
