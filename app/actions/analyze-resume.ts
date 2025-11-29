"use server";

import { createClient } from "@/libs/supabase/server";
import { parseResume } from "@/libs/services/ai-service";
import type { AIServiceResponse, ParsedResumeData } from "@/libs/ai";

/**
 * 履歷解析 Server Action
 * 
 * 接收 PDF 純文字並進行 AI 分析
 * - 用於前端直接呼叫 (不經過 API Route)
 * - 需要認證
 */
export async function analyzeResumeAction(
  text: string,
  fileName?: string
): Promise<AIServiceResponse<ParsedResumeData>> {
  try {
    // 1. 認證檢查
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "認証が必要です。再度ログインしてください。",
        errorCode: "UNAUTHORIZED",
        isRetryable: false,
      };
    }

    // 2. 輸入驗證
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: "テキストが空です",
        errorCode: "VALIDATION_ERROR",
        isRetryable: false,
      };
    }

    console.log(
      `[AnalyzeResume] Processing file: ${fileName || 'unknown'}, text length: ${text.length}, User: ${user.id}`
    );

    // 3. 呼叫 AI Service
    const result = await parseResume(text, user.id);

    if (result.success) {
      console.log("[AnalyzeResume] Parse successful");
    } else {
      console.error("[AnalyzeResume] Parse failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("[AnalyzeResume] Unexpected Error:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
      errorCode: "INTERNAL_ERROR",
      isRetryable: true,
    };
  }
}
