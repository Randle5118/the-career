/**
 * AI Service
 * 
 * 統一的 AI 功能入口
 * - 履歷解析
 * - Job Description 解析
 * - 未來擴展: 履歷優化建議、職缺匹配等
 */

import {
  callOpenAIWithJSON,
  OpenAIError,
  RESUME_PARSER_PROMPT,
  RESUME_PARSER_CONFIG,
  JOB_DESCRIPTION_PARSER_PROMPT,
  JOB_DESCRIPTION_PARSER_CONFIG,
} from '@/libs/ai';
import type {
  AIServiceResponse,
  ParsedResumeData,
  ParsedJobDescription,
} from '@/libs/ai';

// ============================================
// 履歷解析
// ============================================

/**
 * 解析履歷純文字
 * 
 * @param text - 履歷純文字內容
 * @param userId - 使用者 ID (用於 OpenAI 追蹤和計費)
 * @returns 解析後的履歷結構化資料
 */
export async function parseResume(
  text: string,
  userId: string
): Promise<AIServiceResponse<ParsedResumeData>> {
  try {
    // 輸入驗證
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'テキスト内容が空です',
        errorCode: 'VALIDATION_ERROR',
        isRetryable: false,
      };
    }

    // 長度限制 (防止過長輸入導致的成本問題)
    if (text.length > 30000) {
      return {
        success: false,
        error: 'テキストが長すぎます（制限: 30000文字）',
        errorCode: 'VALIDATION_ERROR',
        isRetryable: false,
      };
    }

    console.log(`[AIService.parseResume] Processing for user: ${userId}, text length: ${text.length}`);

    const result = await callOpenAIWithJSON<ParsedResumeData>(
      RESUME_PARSER_PROMPT,
      text,
      {
        ...RESUME_PARSER_CONFIG,
        userId,
      }
    );

    console.log(`[AIService.parseResume] Success, tokens used: ${result.usage.totalTokens}`);

    return {
      success: true,
      data: result.data,
      usage: result.usage,
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        isRetryable: error.isRetryable,
      };
    }

    console.error('[AIService.parseResume] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました',
      errorCode: 'INTERNAL_ERROR',
      isRetryable: true,
    };
  }
}

// ============================================
// Job Description 解析
// ============================================

/**
 * 解析 Job Description 純文字
 * 
 * @param text - Job Description 純文字內容
 * @param userId - 使用者 ID
 * @returns 解析後的職缺結構化資料
 */
export async function parseJobDescription(
  text: string,
  userId: string
): Promise<AIServiceResponse<ParsedJobDescription>> {
  try {
    // 輸入驗證
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'テキスト内容が空です',
        errorCode: 'VALIDATION_ERROR',
        isRetryable: false,
      };
    }

    // 長度限制
    if (text.length > 50000) {
      return {
        success: false,
        error: 'テキストが長すぎます（制限: 50000文字）',
        errorCode: 'VALIDATION_ERROR',
        isRetryable: false,
      };
    }

    console.log(`[AIService.parseJobDescription] Processing for user: ${userId}, text length: ${text.length}`);

    const result = await callOpenAIWithJSON<ParsedJobDescription>(
      JOB_DESCRIPTION_PARSER_PROMPT,
      text,
      {
        ...JOB_DESCRIPTION_PARSER_CONFIG,
        userId,
      }
    );

    console.log(`[AIService.parseJobDescription] Success, tokens used: ${result.usage.totalTokens}`);

    return {
      success: true,
      data: result.data,
      usage: result.usage,
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        isRetryable: error.isRetryable,
      };
    }

    console.error('[AIService.parseJobDescription] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました',
      errorCode: 'INTERNAL_ERROR',
      isRetryable: true,
    };
  }
}

// ============================================
// 未來擴展預留
// ============================================

/**
 * 履歷優化建議 (TODO: 未來實作)
 */
// export async function getResumeOptimizationSuggestions(
//   resume: ParsedResumeData,
//   targetJob?: ParsedJobDescription
// ): Promise<AIServiceResponse<OptimizationSuggestions>> { }

/**
 * 履歷與職缺匹配分析 (TODO: 未來實作)
 */
// export async function analyzeJobMatch(
//   resume: ParsedResumeData,
//   job: ParsedJobDescription
// ): Promise<AIServiceResponse<MatchAnalysis>> { }

