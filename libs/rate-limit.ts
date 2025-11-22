/**
 * Rate Limiting 實作
 * 
 * 使用簡單的記憶體快取 (適合開發和小型應用)
 * 生產環境建議使用 Upstash Redis
 */

import type { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// 記憶體快取 (開發用)
// 注意: 在多實例環境中，每個實例會有獨立的計數器
const memoryCache = new Map<string, RateLimitEntry>();

/**
 * Rate Limiting 配置
 */
export interface RateLimitConfig {
  /** 時間窗口 (毫秒) */
  windowMs: number;
  /** 允許的最大請求數 */
  maxRequests: number;
  /** 識別符號 (通常是 IP 或 user ID) */
  identifier: string;
}

/**
 * Rate Limiting 結果
 */
export interface RateLimitResult {
  /** 是否允許請求 */
  allowed: boolean;
  /** 剩餘請求數 */
  remaining: number;
  /** 重置時間 (Unix timestamp, 毫秒) */
  resetAt: number;
}

/**
 * 簡單的 Rate Limiting (記憶體快取)
 * 
 * @param config Rate Limiting 配置
 * @returns Rate Limiting 結果
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { windowMs, maxRequests, identifier } = config;
  const now = Date.now();
  const key = identifier;

  // 取得現有記錄
  const entry = memoryCache.get(key);

  // 如果沒有記錄或已過期，建立新記錄
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryCache.set(key, newEntry);

    // 清理過期記錄 (每 100 次請求清理一次，避免效能問題)
    if (memoryCache.size > 1000) {
      cleanupExpiredEntries(now);
    }

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // 檢查是否超過限制
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // 增加計數
  entry.count++;
  memoryCache.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * 清理過期的記錄
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of memoryCache.entries()) {
    if (now > entry.resetAt) {
      memoryCache.delete(key);
    }
  }
}

/**
 * 從 Request 取得識別符號 (IP)
 */
export function getRateLimitIdentifier(req: NextRequest): string {
  // 優先使用 X-Forwarded-For (如果有 proxy)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // 使用 X-Real-IP (如果有)
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // 使用 IP (Next.js 15)
  const ip = req.ip || "unknown";
  return ip;
}

/**
 * 建立 Rate Limit Response (429 Too Many Requests)
 */
export function createRateLimitResponse(resetAt: number): NextResponse {
  const resetSeconds = Math.ceil((resetAt - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: "リクエストが多すぎます。しばらく待ってから再度お試しください。",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: resetSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": resetSeconds.toString(),
        "X-RateLimit-Reset": resetAt.toString(),
      },
    }
  );
}

// ============================================
// 預設配置
// ============================================

/**
 * 公開 API 的 Rate Limit 配置
 * - 每分鐘 10 次請求
 */
export const PUBLIC_API_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 分鐘
  maxRequests: 10,
};

/**
 * 認證 API 的 Rate Limit 配置
 * - 每分鐘 30 次請求
 */
export const AUTHENTICATED_API_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 分鐘
  maxRequests: 30,
};


