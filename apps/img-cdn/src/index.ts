/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_HASH: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // パターン1: 単品の Cloudflare Image ID (UUID等) または ショートID
    // 形式: /<id>(.<ext>)
    const idMatch = path.match(/^\/([a-z0-9-]{4,64})(\.(webp|jpg|jpeg|png|gif))?$/i);
    
    // パターン2: バッチ画像 /{batch_id}/{sequence}.webp
    const batchMatch = path.match(/^\/([a-z0-9]{6})\/(\d{3})(\.(webp|jpg|jpeg|png|gif))?$/i);

    if (batchMatch) {
      const [, batchId, sequenceStr] = batchMatch;
      const sequence = parseInt(sequenceStr, 10);

      try {
        const result = await env.DB.prepare(
          'SELECT id FROM images WHERE batch_id = ? AND sequence_number = ?'
        ).bind(batchId, sequence).first<{ id: string }>();

        if (result) {
          return redirectWithVariants(result.id, url.searchParams, env);
        }
      } catch (error) {
        console.error('Error fetching batch image:', error);
      }
    }

    if (idMatch) {
      const [, idOrShortId] = idMatch;
      
      try {
        // 1. まず完全一致（UUID）でチェック
        let imageId = idOrShortId;
        const exists = await env.DB.prepare(
          'SELECT id FROM images WHERE id = ? LIMIT 1'
        ).bind(idOrShortId).first<{ id: string }>();

        // 2. 一致しない場合はショートIDとして検索
        if (!exists && idOrShortId.length <= 8) {
          const shortResult = await env.DB.prepare(
            'SELECT id FROM images WHERE id LIKE ? AND batch_id IS NULL LIMIT 1'
          ).bind(`${idOrShortId}%`).first<{ id: string }>();
          if (shortResult) {
            imageId = shortResult.id;
          } else {
            return new Response('Image not found', { status: 404 });
          }
        } else if (!exists) {
          // UUIDっぽいがDBにない場合。暫定的にそのまま通すか、404にするか。
          // セキュリティ考慮しDBにあるもののみ許可
          return new Response('Image not found', { status: 404 });
        }

        return redirectWithVariants(imageId, url.searchParams, env);
      } catch (error) {
        console.error('Error fetching image:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    return new Response('Invalid URL format', { status: 400 });
  },
};

/**
 * Cloudflare Images の URL へリダイレクト（バリアント対応）
 */
function redirectWithVariants(imageId: string, searchParams: URLSearchParams, env: Env): Response {
  const accountHash = env.CLOUDFLARE_ACCOUNT_HASH;
  
  // クエリパラメータ w, h, fit がある場合はカスタムバリアント構成
  // 今回は一旦 imagedelivery.net の URL へのリダイレクトに留める。
  
  const width = searchParams.get('w') || searchParams.get('width');
  const height = searchParams.get('h') || searchParams.get('height');
  const fit = searchParams.get('fit');

  // 本来は Cloudflare Images の変形パラメータを URL に含めることができる
  // ここでは標準の /public バリアントを返す。
  const imageUrl = `https://imagedelivery.net/${accountHash}/${imageId}/public`;
  
  return Response.redirect(imageUrl, 302);
}
