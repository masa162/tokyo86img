/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_HASH: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // パスのパース: /{batch_id}/{sequence}.webp
    const match = path.match(/^\/([a-z0-9]{6})\/(\d{3})\.(webp|jpg|jpeg|png|gif)$/i);
    
    if (!match) {
      return new Response('Invalid URL format. Expected: /batch_id/001.webp', { status: 400 });
    }

    const [, batchId, sequenceStr, ext] = match;
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
      console.error('Error fetching image:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
