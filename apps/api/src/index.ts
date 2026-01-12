import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getUnixTimestamp } from '@unbelong/shared';

// 6桁のランダム英数字を生成
function generateBatchId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェア
app.use('*', logger());
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  const allowedOrigins = (c.env.ALLOWED_ORIGINS || '*').split(',');
  
  const corsOrigin = (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) 
    ? origin 
    : allowedOrigins[0];

  return cors({
    origin: corsOrigin,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })(c, next);
});

// --- Works API ---
app.get('/api/works', async (c) => {
  const type = c.req.query('type');
  let query = 'SELECT * FROM works';
  const params: any[] = [];
  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }
  query += ' ORDER BY created_at DESC';
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

app.get('/api/works/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare('SELECT * FROM works WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

// --- Illustrations API ---
const illustrationSchema = z.object({
  work_id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  image_id: z.string(),
  og_image_id: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()),
});

app.get('/api/illustrations', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM illustrations ORDER BY created_at DESC').all();
  return c.json({ success: true, data: results });
});

app.get('/api/illustrations/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare('SELECT * FROM illustrations WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

app.post('/api/illustrations', zValidator('json', illustrationSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = getUnixTimestamp();
  
  await c.env.DB.prepare(
    'INSERT INTO illustrations (id, work_id, title, slug, description, image_id, og_image_id, status, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id, 
    data.work_id, 
    data.title, 
    data.slug, 
    data.description ?? null, 
    data.image_id, 
    data.og_image_id ?? null, 
    data.status, 
    JSON.stringify(data.tags), 
    now, 
    now
  ).run();
  
  const result = await c.env.DB.prepare('SELECT * FROM illustrations WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

app.put('/api/illustrations/:id', zValidator('json', illustrationSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const now = getUnixTimestamp();
  
  // 動的なクエリ構築 (簡易版)
  const fields = Object.keys(data);
  if (fields.length === 0) return c.json({ success: true });
  
  const sets = fields.map(f => `${f} = ?`).join(', ') + ', updated_at = ?';
  const values = fields.map(f => {
    const val = (data as any)[f];
    return Array.isArray(val) ? JSON.stringify(val) : val;
  });
  values.push(now, id);

  await c.env.DB.prepare(`UPDATE illustrations SET ${sets} WHERE id = ?`).bind(...values).run();
  const result = await c.env.DB.prepare('SELECT * FROM illustrations WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

app.delete('/api/illustrations/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM illustrations WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// --- Images API ---
app.get('/api/images', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(
    'SELECT * FROM images ORDER BY created_at DESC LIMIT 100'
  ).all();
  return c.json({ success: true, data: results });
});

// --- Episodes API ---
const episodeSchema = z.object({
  work_id: z.string(),
  episode_number: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  content: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  thumbnail_image_id: z.string().nullable().optional(),
  og_image_id: z.string().nullable().optional(),
});

app.get('/api/episodes', async (c) => {
  const workId = c.req.query('workId');
  let query = 'SELECT * FROM episodes';
  const params: any[] = [];
  if (workId) {
    query += ' WHERE work_id = ?';
    params.push(workId);
  }
  query += ' ORDER BY episode_number DESC';
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

app.get('/api/episodes/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare('SELECT * FROM episodes WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

app.post('/api/episodes', zValidator('json', episodeSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = getUnixTimestamp();
  
  await c.env.DB.prepare(
    'INSERT INTO episodes (id, work_id, episode_number, title, slug, description, content, status, thumbnail_image_id, og_image_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id, 
    data.work_id, 
    data.episode_number, 
    data.title, 
    data.slug, 
    data.description ?? null, 
    data.content, 
    data.status, 
    data.thumbnail_image_id ?? null, 
    data.og_image_id ?? null, 
    now, 
    now
  ).run();
  
  const result = await c.env.DB.prepare('SELECT * FROM episodes WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

app.put('/api/episodes/:id', zValidator('json', episodeSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const now = getUnixTimestamp();
  
  const fields = Object.keys(data);
  if (fields.length === 0) return c.json({ success: true });
  
  const sets = fields.map(f => `${f} = ?`).join(', ') + ', updated_at = ?';
  const values = fields.map(f => (data as any)[f]);
  values.push(now, id);

  await c.env.DB.prepare(`UPDATE episodes SET ${sets} WHERE id = ?`).bind(...values).run();
  const result = await c.env.DB.prepare('SELECT * FROM episodes WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

app.delete('/api/episodes/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM episodes WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// --- Upload API ---
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['file'] as File;

    if (!file) {
      return c.json({ success: false, error: 'File is required' }, 400);
    }

    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = c.env.CLOUDFLARE_IMAGES_API_TOKEN;

    if (!accountId) {
      return c.json({ success: false, error: 'CLOUDFLARE_ACCOUNT_ID is missing' }, 500);
    }
    if (!apiToken) {
      return c.json({ success: false, error: 'CLOUDFLARE_IMAGES_API_TOKEN is missing' }, 500);
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: uploadFormData,
      }
    );

    const result: any = await response.json();

    if (!result.success) {
      return c.json({
        success: false,
        error: 'Cloudflare API error',
        details: result.errors || result.messages || result
      }, 500);
    }

    const imageId = result.result.id;
    const filename = result.result.filename || file.name;

    // DB に画像を記録
    try {
      await c.env.DB.prepare(
        'INSERT INTO images (id, filename, created_at, updated_at) VALUES (?, ?, ?, ?)'
      ).bind(
        imageId,
        filename,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      ).run();
    } catch (dbError) {
      console.error('Failed to record image in DB:', dbError);
    }

    return c.json({
      success: true,
      data: {
        id: imageId,
        filename: filename,
        variants: result.result.variants,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({
      success: false,
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// --- Batch API ---
// バッチ作成
app.post('/api/batches', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const id = crypto.randomUUID();
  let batchId = generateBatchId();
  
  // 衝突チェック（念のため）
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db.prepare('SELECT id FROM image_batches WHERE batch_id = ?').bind(batchId).first();
    if (!existing) break;
    batchId = generateBatchId();
    attempts++;
  }
  
  const now = getUnixTimestamp();
  await db.prepare(
    'INSERT INTO image_batches (id, batch_id, name, description, episode_id, total_images, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, batchId, body.name || null, body.description || null, body.episode_id || null, 0, now, now).run();
  
  const result = await db.prepare('SELECT * FROM image_batches WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: result });
});

// バッチ一覧取得
app.get('/api/batches', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare('SELECT * FROM image_batches ORDER BY created_at DESC').all();
  return c.json({ success: true, data: results });
});

// バッチ詳細取得
app.get('/api/batches/:batchId', async (c) => {
  const db = c.env.DB;
  const batchId = c.req.param('batchId');
  
  const batch = await db.prepare('SELECT * FROM image_batches WHERE batch_id = ?').bind(batchId).first();
  if (!batch) {
    return c.json({ success: false, error: 'Batch not found' }, 404);
  }
  
  const { results: images } = await db.prepare(
    'SELECT * FROM images WHERE batch_id = ? ORDER BY sequence_number ASC'
  ).bind(batchId).all();
  
  return c.json({ success: true, data: { ...batch, images } });
});

// バッチへの画像アップロード
app.post('/api/batches/:batchId/upload', async (c) => {
  const db = c.env.DB;
  const batchId = c.req.param('batchId');
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = c.env.CLOUDFLARE_IMAGES_API_TOKEN;
  
  // バッチの存在確認
  const batch = await db.prepare('SELECT * FROM image_batches WHERE batch_id = ?').bind(batchId).first<any>();
  if (!batch) {
    return c.json({ success: false, error: 'Batch not found' }, 404);
  }
  
  const formData = await c.req.formData();
  const files = formData.getAll('files');
  
  if (files.length === 0) {
    return c.json({ success: false, error: 'No files provided' }, 400);
  }
  
  const uploadedImages = [];
  let currentSequence = batch.total_images + 1;
  
  for (const fileEntry of files) {
    if (typeof fileEntry === 'string') continue;
    const file = fileEntry as File;
    try {
      // Cloudflare Images にアップロード
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          },
          body: uploadFormData,
        }
      );
      
      const result: any = await response.json();
      
      if (!result.success) {
        console.error('Cloudflare upload failed:', result);
        continue;
      }
      
      const imageId = result.result.id;
      const filename = result.result.filename || file.name;
      const now = getUnixTimestamp();
      
      // DB に画像を記録
      await db.prepare(
        'INSERT INTO images (id, filename, batch_id, sequence_number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(imageId, filename, batchId, currentSequence, now, now).run();
      
      uploadedImages.push({
        id: imageId,
        filename,
        sequence_number: currentSequence
      });
      
      currentSequence++;
    } catch (error) {
      console.error('Upload error for file:', file.name, error);
    }
  }
  
  // バッチの total_images を更新
  await db.prepare(
    'UPDATE image_batches SET total_images = ?, updated_at = ? WHERE batch_id = ?'
  ).bind(currentSequence - 1, getUnixTimestamp(), batchId).run();
  
  return c.json({ success: true, data: uploadedImages });
});

// Markdown 生成
app.get('/api/batches/:batchId/markdown', async (c) => {
  const db = c.env.DB;
  const batchId = c.req.param('batchId');
  const baseUrl = c.req.query('baseUrl') || `https://img.unbelong.xyz`;
  
  const { results: images } = await db.prepare(
    'SELECT sequence_number FROM images WHERE batch_id = ? ORDER BY sequence_number ASC'
  ).bind(batchId).all<{ sequence_number: number }>();
  
  if (!images || images.length === 0) {
    return c.json({ success: false, error: 'No images found' }, 404);
  }
  
  const markdown = images.map(img => {
    const seq = String(img.sequence_number).padStart(3, '0');
    return `![](${baseUrl}/${batchId}/${seq}.webp)`;
  }).join('\n');
  
  return c.json({ success: true, data: { markdown } });
});

export default app;
