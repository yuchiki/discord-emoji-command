# discord-emoji-command

テキストから絵文字を生成・管理する Discord スラッシュコマンド Bot。

テキストを入力すると、そのテキストを絵文字化したリアクションを作成・更新できます。

## 機能

- Discord スラッシュコマンドによる絵文字管理
- テキストから絵文字画像を自動生成
- 絵文字の追加・更新

## 開発状況

> **Note:** 現在このリポジトリは [wikipedian](https://github.com/yuchiki/wikipedian) テンプレートから作成された初期状態です。今後、絵文字コマンドとしての機能を実装していきます。

## 技術スタック

- **ランタイム:** [Bun](https://bun.sh/)
- **言語:** TypeScript
- **フレームワーク:** [Discord.js](https://discord.js.org/) v14
- **リンター/フォーマッター:** [Biome](https://biomejs.dev/)

## セットアップ

### 1. Discord Application の作成

1. [Discord Developer Portal](https://discord.com/developers/applications) から Application を作成する
2. General Information タブから `APPLICATION ID` をメモする
3. Bot タブから `Reset Token` を押してトークンを生成し、メモする
4. OAuth2 タブの URL Generator から `applications.commands` と `bot` にチェックを入れてURLを生成する
5. 生成されたURLに飛び、追加するサーバーを選んで Application を追加する

### 2. `.env` ファイルの作成

リポジトリのルートに `.env` ファイルを作成する:

```env
WIKIPEDIAN_CLIENT_ID=メモしたAPPLICATION ID
WIKIPEDIAN_TOKEN=メモしたトークン
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
