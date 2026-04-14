# tokyo86img - 画像CDN・管理システム

## 概要
tokyo86プロジェクトの画像配信基盤・管理システムです。Cloudflare Workers/Pages/D1/Imagesを活用し、高速で安全な画像配信を実現します。

## プロジェクト構成

### コンポーネント

#### 1. tokyo86-api (Worker)
- **デプロイURL**: `https://tokyo86-api-production.belong2jazz.workers.dev`
- **役割**: 全データの管理・提供API
- **データストア**: Cloudflare D1 Database
- **主なエンドポイント**:
  - `/api/works`: 作品管理（マンガ・イラスト集）
  - `/api/episodes`: コミックエピソード管理
  - `/api/illustrations`: イラスト管理
  - `/api/batches`: 画像バッチ（箱）管理
  - `/api/images`: 画像一覧・削除
  - `/api/upload`: Cloudflare Imagesへのアップロード

#### 2. tokyo86-admin (Pages)
- **デプロイURL**: `https://tokyo86-admin.belong2jazz.workers.dev`
- **役割**: 全プロジェクト共通の管理UI
- **認証**: Basic認証（localStorage永続化）
- **主な機能**:
  - ダッシュボードでの画像アップロード・ギャラリー表示
  - 画像の個別/一括削除（実体ファイル完全消去）
  - **バッチ（箱）管理**: 複数画像を一括管理
    - webtoon公開/CDN専用の用途切り替えトグル
    - バッチ編集機能（名前・説明・用途の変更）
    - Markdownパス自動生成
  - 作品・エピソード・イラストの管理

#### 3. tokyo86-img-cdn (Worker)
- **役割**: `img.tokyo86.com`ドメインでの画像配信
- **URL構造**:
  - イラスト: `img.tokyo86.com/{random-6-char}.webp`
  - コミック: `img.tokyo86.com/{batch_id}/{seq-3-digit}.webp`

### 関連プロジェクト
- **tokyo86comic**: フロントエンド（`https://tokyo86.com/`）
  - 本リポジトリ: `d:/github/tokyo86comic`

## バッチ（箱）機能

### 概要
Webtoonやイラストセットを「箱」として一括管理する機能です。

### 用途設定
- **cdn**: CDN専用（フィード非表示）
- **toon**: webtoon公開用（tokyo86.comのフィードに表示）

### 編集機能（2026-04-14追加）
管理画面のバッチ一覧で各バッチを編集可能:
- バッチ名の変更
- 説明の変更
- **用途トグル**: アップロード後もcdn/toonを切り替え可能

## 開発環境

### セットアップ
```bash
npm install
```

### ローカル開発
```bash
# API開発
npm run dev --workspace=@tokyo86/api

# 管理画面開発
npm run dev --workspace=@tokyo86/admin

# 画像CDN開発
npm run dev --workspace=@tokyo86/img-cdn
```

### デプロイ
```bash
# API
npm run deploy --workspace=@tokyo86/api

# 管理画面
npm run deploy --workspace=@tokyo86/admin

# 画像CDN
npm run deploy --workspace=@tokyo86/img-cdn
```

## データベース

### D1データベース
- **Database名**: `tokyo86-db`（本番環境）
- **スキーマ**: `packages/database/schema.sql`
- **マイグレーション**: `packages/database/migrations/`

### 主要テーブル
- `works`: 作品マスター
- `episodes`: コミックエピソード
- `illustrations`: イラスト作品
- `image_batches`: 画像バッチ（purpose列でcdn/toon管理）
- `images`: 画像メタデータ

## アーキテクチャの変遷
- 当初は`unbelong`プロジェクトとして開発
- 2026-04頃に`tokyo86`へリブランディング
- 詳細は [MIGRATION_HISTORY.md](./MIGRATION_HISTORY.md) を参照

## ドキュメント
- [移行履歴](./MIGRATION_HISTORY.md)
- [アーカイブ](./archive/) - 旧ドキュメント保管場所
