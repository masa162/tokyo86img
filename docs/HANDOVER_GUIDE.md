# 開発・運用引き継ぎガイド

## 関連ドキュメント
- [システムアーキテクチャ](./SYSTEM_ARCHITECTURE.md)
- [画像運用ロジック (単品 vs 箱)](./IMAGE_MANAGEMENT_LOGIC.md)
- [プロジェクト要件定義書 (PRD)](./PRD.md)

## 1. 開発環境のセットアップ
- `unbelong.git` はモノレポ構成であるため、`pnpm` または `npm` でワークスペース全体を管理可能。
- 各 `apps/` 直下で `wrangler login` を行い、Cloudflareアカウントと連携すること。

## 2. 実装のルール (最重要)
**「管理画面は一箇所のみ」を徹底すること。**
- 新たな機能を管理したい（例：コミックのタグを編集したい）場合は、必ず `unbelong/apps/admin` に画面を追加する。
- `unbelongillust.git` や `unbelongcomic.git` には管理用のコード（認証、フォーム、PUT/POST API呼び出し）を **1行も書いてはならない**。

## 3. コミックサイト (unbelongcomic) 追加の手順
1. `unbelong/apps/admin` でコミックの投稿機能が正常か確認。
2. `unbelongcomic.git` を作成（Vite + React）。
3. `unbelong-api` からエピソード一覧を取得するように実装。
4. ビューアー機能を実装する。
5. Cloudflare Pages でデプロイする際、`VITE_API_URL` を設定する。

## 4. 共通パッケージ `@unbelong/shared`
- `unbelong/packages/shared` には、APIの型定義やユーティリティ（Slug生成、画像URL生成）が含まれている。
- データの整合性を保つため、原則としてこの型定義を使用して開発すること。

## 5. 環境変数の管理 (Security & Config)
**ソースコードへの認証情報・秘匿情報のハードコードは厳禁。**

### ローカル開発
- 各 `apps/` 直下に `.env` ファイルを作成し、環境変数を定義する。
- `.env` は絶対に戻さない（`.gitignore` で除外済み）。
- `libs/api.ts` などで `import.meta.env.VITE_xxx` を通じてアクセスする。

### 本番環境 (Cloudflare)
- **Pages (Admin/Illust)**: Cloudflare Dashboard の `Settings > Functions > Environment variables` にて手動で設定する。
- **Workers (API)**: `wrangler.toml` の `[vars]` または Dashboard の `Settings > Variables` にて設定する。

### 必須の環境変数
- `VITE_API_URL`: バックエンドAPIのURL。
- `VITE_ADMIN_USERNAME`: 管理画面のログインID。
- `VITE_ADMIN_PASSWORD`: 管理画面のログインパスワード。
