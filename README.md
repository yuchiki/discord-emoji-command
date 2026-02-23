# discord-emoji-command

テキストから絵文字を生成・管理する Discord スラッシュコマンド Bot。

テキストを入力すると、そのテキストを絵文字化した画像を生成し、サーバーのカスタム絵文字として登録します。

## 機能

- `/emoji` スラッシュコマンドでテキストからカスタム絵文字を生成・登録
- テキスト色・背景色・フォントサイズのカスタマイズ
- テキスト長に応じた自動フォントサイズ調整
- 日本語・Unicode テキスト対応

## コマンド

### `/emoji`

| オプション | 必須 | 説明 |
|---|---|---|
| `text` | はい | 絵文字にするテキスト |
| `name` | はい | 絵文字の名前 (英数字と `_`、2〜32文字) |
| `color` | いいえ | テキストの色 (例: `red`, `#ff0000`。デフォルト: `white`) |
| `bg` | いいえ | 背景色 (例: `blue`, `#0000ff`。デフォルト: 透明) |
| `font-size` | いいえ | フォントサイズ (8〜128。省略時は自動設定) |

**使用例:**

```
/emoji text:Hi name:test_hi color:red bg:#333333
```

## 技術スタック

- **ランタイム:** [Bun](https://bun.sh/)
- **言語:** TypeScript
- **フレームワーク:** [Discord.js](https://discord.js.org/) v14
- **画像生成:** [Sharp](https://sharp.pixelplumbing.com/) (SVG → PNG)
- **リンター/フォーマッター:** [Biome](https://biomejs.dev/)

## セットアップ

### 1. Discord Application の作成

1. [Discord Developer Portal](https://discord.com/developers/applications) から Application を作成する
2. General Information タブから `APPLICATION ID` をメモする
3. Bot タブから `Reset Token` を押してトークンを生成し、メモする
4. OAuth2 タブの URL Generator から `applications.commands` と `bot` にチェックを入れ、Bot Permissions で `Manage Emojis and Stickers` を選択してURLを生成する
5. 生成されたURLに飛び、追加するサーバーを選んで Application を追加する

### 2. `.env` ファイルの作成

リポジトリのルートに `.env` ファイルを作成する:

```env
DISCORD_CLIENT_ID=メモしたAPPLICATION ID
DISCORD_TOKEN=メモしたトークン
```

### 3. 実行

```sh
git clone https://github.com/yuchiki/discord-emoji-command.git
cd discord-emoji-command
bun install
bun run start
```

## 開発コマンド

| コマンド | 説明 |
|---|---|
| `bun install` | 依存関係のインストール |
| `bun run start` | Bot の起動 |
| `bun test` | テストの実行 |
| `bun run format` | コードフォーマット (Biome) |
| `bun run lint` | Lint (Biome) |
| `bun run check` | フォーマット + Lint (Biome) |
| `bun run typecheck` | TypeScript 型チェック |
