# wikipedian

Wikipedia　を検索する discord スラッシュコマンド。

![聖徳太子を検索している様子](/docs/wikipedian_usage.png)

# 使い方

- `/wikipedia word: 伊藤博文` : 「伊藤博文」を日本語版Wikipedia で検索した結果を表示
- `/wikipedia word: Taylor Swift languages: en` : 「Taylor Swift」を英語版 Wikipediaで検索した結果を表示
- `/wikipedia word: Taylor Swift languages: en,fr` : 「Taylor Swift」を英語版とフランス語版 Wikipedia で検索した結果を表示

# セットアップ

## 1. Discord Application の作成

1. [Discord Developer Portal](https://discord.com/developers/applications) から Application を作成する
2. General Information タブから `APPLICATION ID` をメモする
3. Bot タブから `Reset Token` を押してトークンを生成し、メモする
4. OAuth2 タブの URL Generator から `applications.commands` と `bot` にチェックを入れてURLを生成する
5. 生成されたURLに飛び、追加するサーバーを選んで Application を追加する

## 2. `.env` ファイルの作成

リポジトリのルートに `.env` ファイルを作成する:

```env
WIKIPEDIAN_CLIENT_ID=メモしたAPPLICATION ID
WIKIPEDIAN_TOKEN=メモしたトークン
```

## 3. 実行

以下のいずれかの方法で実行する。

### Docker の場合

```sh
docker pull ghcr.io/yuchiki/wikipedian:latest
docker run --env-file=.env ghcr.io/yuchiki/wikipedian
```

### Kubernetes の場合

1. `kubectl create secret generic wikipedian-secret --from-env-file=.env` で Secret を作成
2. `kubectl apply -f` [manifests/wikipedian.yaml](/manifests/wikipedian.yaml) で deploy

### Bun の場合

Bun がインストールされている必要がある。

```sh
git clone https://github.com/yuchiki/wikipedian.git
cd wikipedian
bun install
bun run start
```
