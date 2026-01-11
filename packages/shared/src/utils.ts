// unbelong 共通ユーティリティ関数

import type { CloudflareImageVariant } from './types';

/**
 * Cloudflare ImagesのURLを生成
 */
export function getImageUrl(
  imageId: string,
  variant: string | CloudflareImageVariant = 'public',
  accountHash: string = 'wdR9enbrkaPsEgUtgFORrw'
): string {
  // 環境変数からカスタムドメインを取得（後ほど実装）
  const customDomain = ''; 

  if (customDomain) {
    if (typeof variant === 'string') {
      return `https://${customDomain}/${imageId}/${variant}`;
    }
    const params = new URLSearchParams();
    if (variant.width) params.set('width', variant.width.toString());
    if (variant.height) params.set('height', variant.height.toString());
    if (variant.fit) params.set('fit', variant.fit);
    if (variant.quality) params.set('quality', variant.quality.toString());
    if (variant.format) params.set('format', variant.format);
    const queryString = params.toString();
    return `https://${customDomain}/${imageId}/public${queryString ? '?' + queryString : ''}`;
  }

  if (typeof variant === 'string') {
    return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
  }

  const params = new URLSearchParams();
  if (variant.width) params.set('width', variant.width.toString());
  if (variant.height) params.set('height', variant.height.toString());
  if (variant.fit) params.set('fit', variant.fit);
  if (variant.quality) params.set('quality', variant.quality.toString());
  if (variant.format) params.set('format', variant.format);

  const queryString = params.toString();
  return `https://imagedelivery.net/${accountHash}/${imageId}/public${queryString ? '?' + queryString : ''}`;
}

/**
 * スラッグを生成（日本語対応）
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * ランダムなスラッグを生成（英数字4桁）
 */
export function generateRandomSlug(length: number = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Unix タイムスタンプを取得
 */
export function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Unix タイムスタンプを日付文字列に変換
 */
export function formatDate(
  timestamp: number,
  locale: string = 'ja-JP'
): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * JSONを安全にパース
 */
export function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}
