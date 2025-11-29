import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse } from "@/libs/api-helpers";
import {
  checkRateLimit,
  createRateLimitResponse,
} from "@/libs/rate-limit";
import { parseResume } from "@/libs/services/ai-service";

/**
 * Rate Limit 設定 (每分鐘 5 次，因為 AI 分析成本較高)
 */
const RESUME_PARSER_RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 5,
};

/**
 * POST /api/ai/resume-parser
 * 
 * 使用 AI 解析履歷純文字
 * - 需要認證
 * - 有 Rate Limit
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. 認證檢查
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 2. Rate Limit 檢查
    const identifier = `resume-parser:${user.id}`;
    const rateLimitResult = checkRateLimit({
      ...RESUME_PARSER_RATE_LIMIT,
      identifier,
    });

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetAt);
    }

    // 3. 取得輸入
    const body = await req.json().catch(() => ({}));
    const { textContent } = body;

    if (!textContent || typeof textContent !== 'string') {
      return NextResponse.json(
        { error: "テキスト内容は必須です" },
        { status: 400 }
      );
    }

    // 4. 呼叫 AI Service
    const result = await parseResume(textContent, user.id);

    if (!result.success) {
      // 根據錯誤類型回傳適當的狀態碼
      const statusCode = getStatusCodeFromErrorCode(result.errorCode);
      return NextResponse.json(
        { 
          error: result.errorCode,
          message: result.error,
          isRetryable: result.isRetryable,
        },
        { status: statusCode }
      );
    }

    // 5. 成功回傳
    const successResponse = NextResponse.json({
      success: true,
      data: result.data
    });

    // 加入 Rate Limit headers
    successResponse.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    successResponse.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toString());

    return successResponse;

  } catch (error) {
    console.error("[Resume Parser] Unexpected Error:", error);
    return handleApiErrorResponse(error);
  }
}

/**
 * 根據錯誤碼取得 HTTP 狀態碼
 */
function getStatusCodeFromErrorCode(errorCode?: string): number {
  switch (errorCode) {
    case 'UNAUTHORIZED':
      return 401;
    case 'VALIDATION_ERROR':
      return 400;
    case 'AI_NOT_CONFIGURED':
      return 500;
    case 'AI_QUOTA_EXCEEDED':
      return 503;
    case 'AI_RATE_LIMIT':
      return 429;
    case 'AI_API_ERROR':
    case 'EMPTY_RESPONSE':
    case 'JSON_PARSE_ERROR':
      return 502;
    default:
      return 500;
  }
}
