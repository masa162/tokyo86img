# Changelog

変更の経緯・意思決定を記録する。コードやgit logに残らない「なぜ」を書く。

---

## 2026-04-12 unbelong → tokyo86 全面リネーム

**背景**: ドメインは tokyo86.com に移行済みだったが、GitHub リポジトリ名・Cloudflare リソース名（Worker/Pages/DB）が `unbelong` のままで混乱が生じていたため統一。

**変更内容**:
- CF Worker `unbelong-api` → `tokyo86-api`（新 URL: `tokyo86-api-production.belong2jazz.workers.dev`）
- CF Worker `unbelong-img-cdn` → `tokyo86-img-cdn`（`img.tokyo86.com` カスタムドメインは継続）
- CF D1 `unbelong-db` → `tokyo86-db`（データ移行済み、DB ID: `0614fe1a-8e77-4c8b-9a87-33584de86905`）
- モノレポ root: `"name": "unbelong"` → `"name": "tokyo86"`
- パッケージスコープ: `@unbelong/*` → `@tokyo86/*`（admin/api/img-cdn/shared/database）
- 管理画面 UI テキスト: "unbelong admin" → "tokyo86 admin"
- 全フロントエンドの VITE_API_URL フォールバックを新 Worker URL に更新

**残作業（手動）**:
- GitHub リポジトリリネーム: `unbelong` → `tokyo86`、`unbelongcomic` → `tokyo86comic`、`unbelongillust` → `tokyo86illust`
- CF Pages プロジェクトの新規作成（tokyo86comic / tokyo86illust）
- 旧 CF Worker `unbelong-api` / `unbelong-img-cdn` の削除（CF ダッシュボード）
- 旧 D1 `unbelong-db` の削除（CF ダッシュボード）

---

## 2026-04-05 tokyo86 リブランド

**背景**: unbelong（illust/comic）が習慣化できなかったため、tokyo86.com ドメインで心理的リブート。
トオル（1986年東京生まれ、リアルタイム加齢）を軸キャラに、キャラ関係性を気にせず投稿できる場にする。

**変更内容**:
- `unbelongcomic` Pages → `tokyo86.com` カスタムドメイン追加（メインサイト）
- `unbelongillust` Pages → `illust.tokyo86.com` カスタムドメイン追加
- `unbelong-api` の `ALLOWED_ORIGINS` に `tokyo86.com` / `illust.tokyo86.com` を追加
- `unbelong.xyz` 系ドメインは引き続き有効（並存）

**同時に整理したこと**:
- `tky86`（河村ユウイチ名義アダルトコミック、全くの別プロジェクト）を `yuichi` にリネーム
- `tky86-comic` → `yuichi-comic`、`tky86-illust` → `yuichi-illust`
- `yuichi` は Cloudflare アダルトアカウント（`Info@takayamalog.com`）管理のまま
- `yuichi` の `ALLOWED_ORIGINS` から `tokyo86.com` を削除

---

## 2026-01-14 画像管理機能アップデート

**背景**: 単品アップロード（slug自動生成）と箱（バッチ）一括アップロードの両立。

**変更内容**:
- `/api/upload` に単品アップロード機能追加（6文字ランダムslug自動生成）
- `/api/batches` でバッチ単位の一括アップロードとMarkdownパス生成
- 管理画面に箱機能のUIを追加

詳細: [IMAGE_MANAGEMENT_LOGIC.md](./IMAGE_MANAGEMENT_LOGIC.md)

---

## 2025-10-17 初回リリース

**内容**: unbelong プロジェクト完成・本番稼働開始。

- API (Cloudflare Workers / Hono)
- 管理画面 (unbelong-hono-admin.pages.dev)
- コミックサイト (comic.unbelong.xyz)
- イラストサイト (illust.unbelong.xyz)
- Cloudflare D1 データベース

詳細: [mn3/docs_unbelong全体/進捗管理表.md](../../../mn3/docs_unbelong全体/進捗管理表.md)
