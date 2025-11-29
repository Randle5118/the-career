/**
 * @deprecated 此檔案已棄用，請使用 @/libs/ai 模組
 * 
 * 遷移指南:
 * - 舊: import { sendOpenAi } from '@/libs/gpt'
 * - 新: import { callOpenAI, callOpenAIWithJSON } from '@/libs/ai'
 * 
 * 新的 AI 模組提供:
 * - 更好的錯誤處理 (OpenAIError class)
 * - JSON 模式支援 (callOpenAIWithJSON)
 * - 統一的型別定義
 * - Token 使用量追蹤
 * 
 * @see libs/ai/openai-client.ts
 * @see libs/services/ai-service.ts
 */

import { callOpenAI } from '@/libs/ai';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * @deprecated 請使用 callOpenAI 或 callOpenAIWithJSON
 */
export const sendOpenAi = async (
  messages: OpenAIMessage[],
  userId: number,
  max = 100,
  temp = 1
): Promise<string | null> => {
  console.warn(
    '[DEPRECATED] sendOpenAi is deprecated. Please use callOpenAI from @/libs/ai'
  );

  if (messages.length < 2) {
    console.error('[sendOpenAi] Need at least system and user message');
    return null;
  }

  const systemMessage = messages.find(m => m.role === 'system');
  const userMessage = messages.find(m => m.role === 'user');

  if (!systemMessage || !userMessage) {
    console.error('[sendOpenAi] Missing system or user message');
    return null;
  }

  try {
    const response = await callOpenAI(
      systemMessage.content,
      userMessage.content,
      {
        userId: String(userId),
        maxTokens: max,
        temperature: temp,
        jsonMode: false, // 舊版不強制 JSON
      }
    );
    return response.content;
  } catch (error) {
    console.error('[sendOpenAi] Error:', error);
    return null;
  }
};
