# 開発・運用引き継ぎガイド

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
