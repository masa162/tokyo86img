# システムアーキテクチャ定義書

## 1. 全体構造
本プロジェクトは、1つのバックエンド・管理リポジトリと、複数の公開用フロントエンド・リポジトリで構成される。

## 2. Cloudflare コンポーネント詳細

### A. unbelong-api (Worker)
- **ソース**: `unbelong.git` / `apps/api`
- **役割**: 全ての動的データの提供。
- **データストア**: Cloudflare D1 (Database名: `unbelong-db`)
- **主なエンドポイント**:
  - `/api/illustrations`: イラスト一覧・個別取得 (ID or Slug)・作成・更新
  - `/api/works`: 作品（マンガ・イラスト集）の一覧・個別取得 (ID or Slug)・作成・更新・削除
  - `/api/episodes`: コミックエピソード管理の一覧・個別取得 (ID or Slug)・作成・更新・削除
  - `/api/upload`: Cloudflare Images への直接アップロード
  - `/api/batches`: 画像バッチ（箱）の一覧・作成・詳細・削除・Markdown生成
  - `/api/images`: 最近のアップロード一覧・個別/一括削除（CF Images連動）

### B. unbelong-hono-admin (Pages)
- **ソース**: `unbelong.git` / `apps/admin`
- **役割**: 全プロジェクト共通の唯一の管理UI。
- **機能**:
  - ダッシュボードでのクイック画像アップロード & 最近のギャラリー表示
  - 画像の個別/選択一括削除（実体ファイル含む完全消去）
  - 「箱（バッチ）」単位での一括アップロードとMarkdownパス生成
  - 作品、エピソード、イラストの管理・編集
- **認証**: Basic認証 (localStorage によりログイン状態を永続化)

### C. unbelong-img-cdn (Worker)
- **ソース**: `unbelong.git` / `apps/img-cdn`
- **役割**: `img.unbelong.xyz` ドメインによる画像配信。
- **URL構造**:
  - イラスト: `img.unbelong.xyz/{random-6-char}.webp` (D1でID引き当て)
  - コミック: `img.unbelong.xyz/{batch_id}/{seq-3-digit}.webp` (バッチIDと連番で引き当て)

### D. 各フロントエンド (Pages)
- **unbelongillust**: イラスト閲覧用。 APIからデータを取得してレスポンシブに表示。
- **unbelongcomic**: コミックビューアー。Markdown形式の画像URLをパースし、隙間なく連続表示するビューアーを実装。

## 3. 画像配信・削除の仕組み
1. `unbelong-hono-admin` で画像をアップロード
2. Cloudflare Images に実体が保存され、メタデータがD1に保存される
3. 管理画面から削除を行うと、APIが Cloudflare API を叩いて実体ファイルを消去し、同時に D1 のレコードも削除する（完全同期）
4. 公開サイトでは、Short URL 経由で `img.unbelong.xyz` にアクセスし、Worker が適切な実体 URL へリダイレクトする
