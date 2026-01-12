/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_HASH: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // パターン1: 単品イラスト /{id}.webp (4-6桁)
    const singleMatch = path.match(/^\/([a-z0-9]{4,6})\.(webp|jpg|jpeg|png|gif)$/i);
    
    if (singleMatch) {
      const [, shortId, ext] = singleMatch;
      
      try {
        // D1 から画像 ID を取得（batch_id が NULL のもの）
        const result = await env.DB.prepare(
          'SELECT id FROM images WHERE id LIKE ? AND batch_id IS NULL LIMIT 1'
        ).bind(`${shortId}%`).first<{ id: string }>();

        if (!result) {
          return new Response('Image not found', { status: 404 });
        }

        // Cloudflare Images の URL にリダイレクト
        const imageUrl = `https://imagedelivery.net/${env.CLOUDFLARE_ACCOUNT_HASH}/${result.id}/public`;
        
        return Response.redirect(imageUrl, 302);
      } catch (error) {
        console.error('Error fetching single image:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    // パターン2: バッチ画像 /{batch_id}/{sequence}.webp
    const batchMatch = path.match(/^\/([a-z0-9]{6})\/(\d{3})\.(webp|jpg|jpeg|png|gif)$/i);
    
    if (batchMatch) {
      const [, batchId, sequenceStr, ext] = batchMatch;
      const sequence = parseInt(sequenceStr, 10);

      try {
        // D1 から画像 ID を取得
        const result = await env.DB.prepare(
          'SELECT id FROM images WHERE batch_id = ? AND sequence_number = ?'
        ).bind(batchId, sequence).first<{ id: string }>();

        if (!result) {
          return new Response('Image not found', { status: 404 });
        }

        // Cloudflare Images の URL にリダイレクト
        const imageUrl = `https://imagedelivery.net/${env.CLOUDFLARE_ACCOUNT_HASH}/${result.id}/public`;
        
        return Response.redirect(imageUrl, 302);
      } catch (error) {
        console.error('Error fetching batch image:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    return new Response('Invalid URL format. Expected: /{id}.webp or /{batch_id}/{seq}.webp', { status: 400 });
  },
};
