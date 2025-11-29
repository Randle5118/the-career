/**
 * OpenAI API Client
 * 
 * 統一的 OpenAI API 呼叫封裝
 * - 統一錯誤處理
 * - 自動重試機制
 * - Token 使用量追蹤
 */

import axios, { AxiosError } from 'axios';
import type { OpenAIOptions, OpenAIResponse, AIErrorCode } from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_TEMPERATURE = 0.1;
const DEFAULT_MAX_TOKENS = 4000;
const DEFAULT_TIMEOUT = 60000;

/**
 * OpenAI API 錯誤
 */
export class OpenAIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public isRetryable: boolean = false,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

/**
 * 呼叫 OpenAI Chat Completions API
 * 
 * @param systemPrompt - System prompt
 * @param userMessage - User message
 * @param options - 選項配置
 * @returns OpenAI 回應
 * @throws OpenAIError
 */
export async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  options: OpenAIOptions = {}
): Promise<OpenAIResponse> {
  const {
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS,
    userId,
    jsonMode = true,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  // 檢查 API Key
  if (!process.env.OPENAI_API_KEY) {
    throw new OpenAIError(
      'OpenAI API Key が設定されていません',
      'AI_NOT_CONFIGURED',
      false
    );
  }

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature,
    max_tokens: maxTokens,
    ...(jsonMode && { response_format: { type: 'json_object' } }),
    ...(userId && { user: userId }),
  };

  try {
    console.log(`[OpenAI] Calling ${model}, tokens limit: ${maxTokens}`);

    const response = await axios.post(OPENAI_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout,
    });

    const choice = response.data.choices[0];
    const usage = response.data.usage;

    console.log(
      `[OpenAI] Success - Tokens: ${usage?.total_tokens} ` +
      `(prompt: ${usage?.prompt_tokens}, completion: ${usage?.completion_tokens})`
    );

    if (!choice?.message?.content) {
      throw new OpenAIError(
        'AIからの応答が空でした',
        'EMPTY_RESPONSE',
        true
      );
    }

    return {
      content: choice.message.content,
      usage: {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      },
      model: response.data.model,
      finishReason: choice.finish_reason,
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      throw handleAxiosError(error);
    }

    console.error('[OpenAI] Unexpected error:', error);
    throw new OpenAIError(
      '予期しないエラーが発生しました',
      'INTERNAL_ERROR',
      true
    );
  }
}

/**
 * 呼叫 OpenAI 並解析 JSON 回應
 * 
 * @param systemPrompt - System prompt
 * @param userMessage - User message
 * @param options - 選項配置
 * @returns 解析後的 JSON 資料
 * @throws OpenAIError
 */
export async function callOpenAIWithJSON<T = unknown>(
  systemPrompt: string,
  userMessage: string,
  options: OpenAIOptions = {}
): Promise<{ data: T; usage: OpenAIResponse['usage'] }> {
  const response = await callOpenAI(systemPrompt, userMessage, {
    ...options,
    jsonMode: true,
  });

  try {
    const data = JSON.parse(response.content) as T;
    return {
      data,
      usage: response.usage,
    };
  } catch (e) {
    console.error('[OpenAI] JSON parse error:', e);
    console.error('[OpenAI] Raw content:', response.content.substring(0, 500));
    throw new OpenAIError(
      'AIの応答をJSONとして解析できませんでした',
      'JSON_PARSE_ERROR',
      true
    );
  }
}

/**
 * 處理 Axios 錯誤
 */
function handleAxiosError(error: AxiosError): OpenAIError {
  const status = error.response?.status;
  const errorData = error.response?.data as { error?: { type?: string; code?: string; message?: string } } | undefined;
  const errorType = errorData?.error?.type;
  const errorCode = errorData?.error?.code;

  console.error('[OpenAI] API Error:', {
    status,
    type: errorType,
    code: errorCode,
    message: errorData?.error?.message,
  });

  // Quota exceeded
  if (errorType === 'insufficient_quota' || errorCode === 'insufficient_quota') {
    return new OpenAIError(
      'AI解析サービスの利用枠が上限に達しました。管理者にお問い合わせください。',
      'AI_QUOTA_EXCEEDED',
      false,
      status
    );
  }

  // Rate limit
  if (status === 429) {
    return new OpenAIError(
      'AI解析サービスが混み合っています。数分後に再度お試しください。',
      'AI_RATE_LIMIT',
      true,
      status
    );
  }

  // Timeout
  if (error.code === 'ECONNABORTED') {
    return new OpenAIError(
      'AI解析がタイムアウトしました。再度お試しください。',
      'AI_API_ERROR',
      true
    );
  }

  // Other API errors
  return new OpenAIError(
    'AI解析サービスでエラーが発生しました。しばらく経ってから再度お試しください。',
    'AI_API_ERROR',
    true,
    status
  );
}

