# プロジェクト移行履歴

## プロジェクト名変更: unbelong → tokyo86

### 変更時期
2026年4月頃

### 背景
当初`unbelong`プロジェクトとして開発されたシステムを、`tokyo86`ブランドへ統一するためリブランディングを実施。

### 主な変更内容

#### ドメイン
- API: `unbelong-api.*.workers.dev` → `tokyo86-api-production.belong2jazz.workers.dev`
- 管理画面: `unbelong-hono-admin.*.pages.dev` → `tokyo86-admin.belong2jazz.workers.dev`
- 画像CDN: `img.unbelong.xyz` → `img.tokyo86.com`
- フロントエンド:
  - コミック: `comic.unbelong.xyz` → `tokyo86.com` (メインドメイン)
  - イラスト: `illust.unbelong.xyz` → `illust.tokyo86.com`

#### コードベース
- リポジトリ名: そのまま`tokyo86img`を使用（新規作成時から）
- パッケージ名: `@tokyo86/*`に統一

#### データベース
- D1 Database名: `unbelong-db` → `tokyo86-db`
- スキーマは変更なし（互換性維持）

### 旧ドキュメントの扱い
`unbelong`時代のドキュメントは[archive/](./archive/)に移動し、参考資料として保管。

### 注意事項
- 一部のコード内コメントや変数名に`unbelong`が残っている可能性あり
- 機能的には互換性を維持しており、問題なし
- 新規開発時は`tokyo86`の命名規則を使用すること

## 主要機能追加履歴

### 2026-04-14: バッチ編集機能追加
- **背景**: バッチ作成時のみ用途（cdn/toon）設定が可能だったが、後から変更できなかった
- **実装内容**:
  - API: `PUT /api/batches/:batchId`エンドポイント追加
  - 管理画面: バッチ一覧に編集ボタン・インライン編集フォーム追加
  - 編集可能項目: 名前、説明、用途（cdn/toon）
- **影響**: アップロード後も柔軟にwebtoon公開設定を変更可能に

### その他の機能
詳細は[README.md](./README.md)を参照。
