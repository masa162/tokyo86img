-- 既存の images テーブルに batch_id と sequence_number を追加
ALTER TABLE images ADD COLUMN batch_id TEXT;
ALTER TABLE images ADD COLUMN sequence_number INTEGER;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_images_batch_id ON images(batch_id);

-- image_batches テーブルを作成
CREATE TABLE IF NOT EXISTS image_batches (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  episode_id TEXT,
  total_images INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_image_batches_batch_id ON image_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_image_batches_episode_id ON image_batches(episode_id);
