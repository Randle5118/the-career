/**
 * AI 模組統一匯出
 */

// Client
export { callOpenAI, callOpenAIWithJSON, OpenAIError } from './openai-client';

// Types
export type {
  OpenAIMessage,
  OpenAIOptions,
  OpenAIResponse,
  AIServiceResponse,
  AIErrorCode,
  ParsedResumeData,
  ParsedJobDescription,
  ParsedEducation,
  ParsedWorkExperience,
  ParsedPosition,
  ParsedSkill,
  ParsedLanguage,
  ParsedCertification,
  ParsedAward,
} from './types';

// Prompts
export {
  RESUME_PARSER_PROMPT,
  RESUME_PARSER_CONFIG,
  JOB_DESCRIPTION_PARSER_PROMPT,
  JOB_DESCRIPTION_PARSER_CONFIG,
} from './prompts';

