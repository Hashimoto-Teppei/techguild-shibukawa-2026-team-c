# techguild-shibukawa-2026-team-c

ハッカソン「techguild 渋川 2026」チーム「カメに懸賞金」のリポジトリです。テーマは「ITの力を使って渋川を盛り上げる」。

職員がITリテラシーが高くなくても運用できる、Googleマイマップのような観光マップサービスを作ります。

## 進め方

- 作業は GitHub Issues で管理し、マイルストーン ①価値検討 → ②仕様決定 → ③実装 の順に進めます
- ブランチ運用・ドキュメント構成・ファイル名のルールは [AGENTS.md](AGENTS.md) を参照してください（AI エージェントと人間で共通のルールです）

## 初回セットアップ

```sh
git clone git@github.com:Hashimoto-Teppei/techguild-shibukawa-2026-team-c.git
```

### Windows の場合

Git for Windows を使う前提です。クローンの前に一度だけ実行してください。

```sh
git config --global core.longpaths true   # 260文字を超えるパスでのエラーを防ぐ
git config --global core.autocrlf false   # 改行は .gitattributes で LF に統一しているため
```

- エディタは `.editorconfig` に対応したもの（VS Code など）を使ってください。文字コード UTF-8・改行 LF が自動で適用されます
- Windows PowerShell 5 の `>` や `Out-File` で書き出したファイルは UTF-16 になり文字化けします。ファイルはエディタで作成してください
