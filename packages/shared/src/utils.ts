// unbelong 共通ユーティリティ関数

import type { CloudflareImageVariant } from './types';

/**
 * Cloudflare ImagesのURLを生成
 */
export function getImageUrl(
  imageId: string,
  variant: string | CloudflareImageVariant = 'public',
  accountHash?: string
): string {
  // Viteの環境変数を優先的に取得
  // @ts-ignore
  const viteAccountHash = typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDFLARE_ACCOUNT_HASH;
  // @ts-ignore
  const viteCdnUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMAGE_CDN_URL;

  const finalAccountHash = accountHash || viteAccountHash || 'wdR9enbrkaPsEgUtgFORrw';

  // カスタムドメイン（CDN Worker）が設定されている場合
  if (viteCdnUrl) {
    const baseUrl = viteCdnUrl.endsWith('/') ? viteCdnUrl.slice(0, -1) : viteCdnUrl;
    if (typeof variant === 'string') {
      return `${baseUrl}/${imageId}/${variant}`;
    }
    const params = new URLSearchParams();
    if (variant.width) params.set('width', variant.width.toString());
    if (variant.height) params.set('height', variant.height.toString());
    if (variant.fit) params.set('fit', variant.fit);
    if (variant.quality) params.set('quality', variant.quality.toString());
    if (variant.format) params.set('format', variant.format);
    const queryString = params.toString();
    return `${baseUrl}/${imageId}/public${queryString ? '?' + queryString : ''}`;
  }

  // デフォルト（imagedelivery.net）
  if (typeof variant === 'string') {
    return `https://imagedelivery.net/${finalAccountHash}/${imageId}/${variant}`;
  }

  const params = new URLSearchParams();
  if (variant.width) params.set('width', variant.width.toString());
  if (variant.height) params.set('height', variant.height.toString());
  if (variant.fit) params.set('fit', variant.fit);
  if (variant.quality) params.set('quality', variant.quality.toString());
  if (variant.format) params.set('format', variant.format);

  const queryString = params.toString();
  return `https://imagedelivery.net/${finalAccountHash}/${imageId}/public${queryString ? '?' + queryString : ''}`;
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
