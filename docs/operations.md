# 運用リファレンス

メンテナンス時にすぐ参照できる早見表。詳細は各リンク先を参照。

---

## Cloudflare アカウント

| 用途 | Email | Account ID |
|---|---|---|
| **このプロジェクト（tokyo86）** | Belong2jazz@gmail.com | `c677241d7d66ff80103bab9f142128ab` |
| アダルト別プロジェクト（yuichi） | Info@takayamalog.com | `512387a50678415712a91baa79f7a162` |

---

## 現在のURL構成

| 役割 | URL | Pages/Workers プロジェクト名 |
|---|---|---|
| コミック（メイン） | https://tokyo86.com | `tokyo86comic` |
| イラスト | https://illust.tokyo86.com | `tokyo86illust` |
| 管理画面 | https://unbelong-hono-admin.pages.dev | `unbelong-hono-admin` |
| API | https://tokyo86-api-production.belong2jazz.workers.dev | `tokyo86-api` (env: production) |
| 画像CDN | https://img.tokyo86.com | `tokyo86-img-cdn` |

---

## 主要リソース

| リソース | 値 |
|---|---|
| D1 Database名 | `tokyo86-db` |
| D1 Database ID | `0614fe1a-8e77-4c8b-9a87-33584de86905` |
| Cloudflare Images Account Hash | `wdR9enbrkaPsEgUtgFORrw` |

---

## デプロイコマンド

```bash
# wrangler アカウント確認
npx wrangler whoami
# → belong2jazz@gmail.com であること

# API デプロイ（production）
cd unbelong/apps/api
npx wrangler deploy --env production

# img-cdn デプロイ
cd unbelong/apps/img-cdn
npx wrangler deploy

# 管理画面・フロントは GitHub push → Cloudflare Pages 自動デプロイ
```

---

## ALLOWED_ORIGINS の管理

`unbelong/apps/api/wrangler.toml` の `[env.production.vars]` を編集 → デプロイ。

新しいドメインをフロントに追加したら必ずここも更新すること。

---

## ローカル開発

```bash
# 管理画面
cd unbelong/apps/admin
cp .env.example .env  # VITE_API_URL を確認
npm run dev

# コミックフロント
cd tokyo86comic
cp .env.example .env
npm run dev

# イラストフロント
cd tokyo86illust
cp .env.example .env
npm run dev
```

---

## 関連ドキュメント

- [システムアーキテクチャ](./SYSTEM_ARCHITECTURE.md)
- [画像管理ロジック](./IMAGE_MANAGEMENT_LOGIC.md)
- [引き継ぎガイド](./HANDOVER_GUIDE.md)
- [変更履歴](./changelog.md)
