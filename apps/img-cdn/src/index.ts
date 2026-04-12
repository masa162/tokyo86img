/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_HASH: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Pattern 1: Batch image /{batchId}/{seq}(.ext)  — check before single ID
    const batchMatch = path.match(/^\/([a-z0-9]{6})\/(\d{3})(\.(webp|jpg|jpeg|png|gif))?$/i);
    if (batchMatch) {
      const [, batchId, sequenceStr] = batchMatch;
      const sequence = parseInt(sequenceStr, 10);
      try {
        const row = await env.DB.prepare(
          'SELECT id FROM images WHERE batch_id = ? AND sequence_number = ?'
        ).bind(batchId, sequence).first<{ id: string }>();
        if (row) return buildRedirect(row.id, url.searchParams, env.CLOUDFLARE_ACCOUNT_HASH);
      } catch (e) {
        console.error('Batch lookup error:', e);
        return new Response('Internal Server Error', { status: 500 });
      }
      return new Response('Image not found', { status: 404 });
    }

    // Pattern 2: Single image /{id}(.ext)
    const idMatch = path.match(/^\/([a-z0-9-]{4,64})(\.(webp|jpg|jpeg|png|gif))?$/i);
    if (idMatch) {
      const [, idOrShortId] = idMatch;
      try {
        // Exact UUID match first
        let row = await env.DB.prepare(
          'SELECT id FROM images WHERE id = ? LIMIT 1'
        ).bind(idOrShortId).first<{ id: string }>();

        // Short ID prefix search (≤8 chars)
        if (!row && idOrShortId.length <= 8) {
          row = await env.DB.prepare(
            'SELECT id FROM images WHERE id LIKE ? AND batch_id IS NULL LIMIT 1'
          ).bind(`${idOrShortId}%`).first<{ id: string }>();
        }

        if (row) return buildRedirect(row.id, url.searchParams, env.CLOUDFLARE_ACCOUNT_HASH);
        return new Response('Image not found', { status: 404 });
      } catch (e) {
        console.error('ID lookup error:', e);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};

function buildRedirect(imageId: string, params: URLSearchParams, accountHash: string): Response {
  const w = params.get('w') || params.get('width');
  const h = params.get('h') || params.get('height');
  const fit = params.get('fit');
  const q = params.get('q') || params.get('quality');

  const parts: string[] = [];
  if (w) parts.push(`w=${w}`);
  if (h) parts.push(`h=${h}`);
  if (fit) parts.push(`fit=${fit}`);
  if (q) parts.push(`q=${q}`);

  const variant = parts.length > 0 ? parts.join(',') : 'public';
  const imageUrl = `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;

  const res = Response.redirect(imageUrl, 302);
  // Redirect itself is cacheable
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(null, { status: 302, headers });
}
