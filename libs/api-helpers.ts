/**
 * API 輔助函數
 * 
 * 提供統一的錯誤處理、資料清理等功能
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ============================================
// 錯誤處理
// ============================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 處理 Supabase 錯誤
 */
export function handleSupabaseError(error: any): ApiError {
  // Supabase 錯誤碼參考: https://supabase.com/docs/reference/javascript/error-codes
  
  if (error.code === "PGRST116") {
    // 找不到記錄
    return new ApiError(404, "リソースが見つかりません", "NOT_FOUND");
  }
  
  if (error.code === "23505") {
    // Unique constraint violation
    return new ApiError(409, "このリソースは既に存在します", "DUPLICATE");
  }
  
  if (error.code === "23503") {
    // Foreign key violation
    return new ApiError(400, "参照先のリソースが存在しません", "FOREIGN_KEY_VIOLATION");
  }
  
  if (error.code === "42501") {
    // Insufficient privilege (RLS)
    return new ApiError(403, "この操作を実行する権限がありません", "FORBIDDEN");
  }
  
  // 預設錯誤
  console.error("[Supabase Error]", error);
  return new ApiError(500, "サーバーエラーが発生しました", "INTERNAL_ERROR", error.message);
}

/**
 * 處理 Zod 驗證錯誤
 */
export function handleZodError(error: ZodError): NextResponse {
  const details = error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  
  return NextResponse.json(
    {
      error: "入力データが不正です",
      code: "VALIDATION_ERROR",
      details,
    },
    { status: 400 }
  );
}

/**
 * 處理 API 錯誤並回傳 Response
 */
export function handleApiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof ZodError) {
    return handleZodError(error);
  }
  
  // 未知錯誤
  console.error("[API Error]", error);
  return NextResponse.json(
    {
      error: "予期しないエラーが発生しました",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

// ============================================
// 資料清理
// ============================================

/**
 * 清理 Resume 更新資料
 * 移除不應該更新的系統欄位
 */
export function cleanResumeUpdateData(data: Record<string, unknown>): Record<string, unknown> {
  const SYSTEM_FIELDS = [
    "id",
    "user_id",
    "is_primary", // 系統管理，由 trigger 或 API 邏輯控制
    "completeness", // 系統計算欄位
    "created_at",
    "updated_at", // 由 trigger 自動更新
    "version", // 版本號，由系統管理
  ];
  
  const cleaned: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // 跳過系統欄位
    if (SYSTEM_FIELDS.includes(key)) {
      continue;
    }
    
    // 跳過 undefined (允許清空欄位，但保留 null)
    if (value === undefined) {
      continue;
    }
    
    cleaned[key] = value;
  }
  
  return cleaned;
}

/**
 * 清理 Published Resume 更新資料
 */
export function cleanPublishedResumeUpdateData(data: Record<string, unknown>): Record<string, unknown> {
  const SYSTEM_FIELDS = [
    "id",
    "user_id",
    "published_at", // 首次發布時間不變
    "created_at",
    "updated_at", // 由 trigger 自動更新
  ];
  
  const cleaned: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (SYSTEM_FIELDS.includes(key)) {
      continue;
    }
    
    if (value === undefined) {
      continue;
    }
    
    cleaned[key] = value;
  }
  
  return cleaned;
}

// ============================================
// Request 驗證
// ============================================

/**
 * 檢查 Request Body Size
 */
export function validateRequestBodySize(
  contentLength: string | null,
  maxSizeBytes: number = 10 * 1024 * 1024 // 預設 10MB
): void {
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    throw new ApiError(413, "リクエストボディが大きすぎます", "PAYLOAD_TOO_LARGE");
  }
}

/**
 * 安全地解析 JSON
 */
export async function safeJsonParse<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new ApiError(400, "リクエストボディの解析に失敗しました", "INVALID_JSON");
  }
}

