# システムアーキテクチャ定義書

## 1. 全体構造
本プロジェクトは、1つのバックエンド・管理リポジトリと、複数の公開用フロントエンド・リポジトリで構成される。

## 2. Cloudflare コンポーネント詳細

### A. unbelong-api (Worker)
- **ソース**: `unbelong.git` / `apps/api`
- **役割**: 全ての動的データの提供。
- **データストア**: Cloudflare D1 (Database名: `unbelong-db`)
- **主なエンドポイント**:
  - `/api/illustrations`: イラスト一覧・個別取得・作成・更新
  - `/api/works`: 作品（マンガ・イラスト集）の管理
  - `/api/episodes`: コミックエピソード管理
  - `/api/upload`: Cloudflare Images への直接アップロード

### B. unbelong-hono-admin (Pages)
- **ソース**: `unbelong.git` / `apps/admin`
- **役割**: 全プロジェクト共通の唯一の管理UI。
- **機能**:
  - 画像のアップロード・画像IDコピー
  - 作品、エピソード、イラストの新規投稿・編集（ステータス管理含む）
- **認証**: Basic認証 (管理者の ID/Pass で保護)

### C. unbelong-img-cdn (Worker)
- **ソース**: `unbelong.git` / `apps/img-cdn`
- **役割**: `img.unbelong.xyz` ドメインによる画像配信。
- **ロジック**: 画像IDやバッチIDを受け取り、Cloudflare Images の実体（`imagedelivery.net`）へリダイレクト。

### D. 各フロントエンド (Pages)
- **unbelongillust**: イラスト閲覧用。 APIからデータを取得してレスポンシブに表示。
- **unbelongcomic** (予定): コミックビューアー。読み取り専用。

## 3. 画像配信の仕組み
1. `unbelong-hono-admin` で画像をアップロード
2. Cloudflare Images に実体が保存され、IDがAPI経由でD1に保存される
3. 公開サイトでは、`img.unbelong.xyz/{image_id}.webp` という形式で画像を表示
