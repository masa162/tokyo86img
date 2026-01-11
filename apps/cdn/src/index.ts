import { Hono } from 'hono';

type Bindings = {
  IMAGE_ACCOUNT_HASH: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/:imageId/:variant?', async (c) => {
  const imageId = c.req.param('imageId');
  const variant = c.req.param('variant') || 'public';
  const accountHash = c.env.IMAGE_ACCOUNT_HASH;

  // クエリパラメータから動的なリサイズ指示を取得 (例: ?w=800&q=85)
  const width = c.req.query('w');
  const height = c.req.query('h');
  const quality = c.req.query('q');
  const format = c.req.query('f') || 'auto';

  let imageUrl = `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;

  // 動的なパラメータがある場合は、カスタムパラメータを組み立てる
  // 注: Cloudflare Imagesの仕様上、imagedelivery.netは標準variant以外は基本的には
  // プロキシ経由でヘッダーをいじるか、前もって作成したvariantを使う必要があります。
  // ここでは最もシンプルな「既存のvariantへの転送」か「パラメータ付きURLの返却」を行います。
  
  // パラメータがある場合はURLを構築 (Cloudflare ImagesのFlexible Variants機能等を想定)
  if (width || height || quality) {
    const params = [];
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    if (quality) params.push(`q=${quality}`);
    params.push(`f=${format}`);
    // パラメータ付きのURLを構築
    imageUrl = `https://imagedelivery.net/${accountHash}/${imageId}/w=${width || ''},h=${height || ''},q=${quality || 85},f=${format}`;
  }

  // オリジンから画像を取得してレスポンスとして返す (Proxyモード)
  const response = await fetch(imageUrl);
  const newResponse = new Response(response.body, response);
  
  // キャッシュ制御ヘッダーの追加
  newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  
  return newResponse;
});

export default app;
