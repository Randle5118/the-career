/**
 * AI 模組型別定義
 * 
 * 統一管理所有 AI 相關的型別
 */

// ============================================
// OpenAI Client 型別
// ============================================

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIOptions {
  /** 使用的模型 (預設: gpt-4o) */
  model?: string;
  /** 溫度參數，控制隨機性 (0-2, 預設: 0.1) */
  temperature?: number;
  /** 最大 token 數 (預設: 4000) */
  maxTokens?: number;
  /** 使用者 ID (用於 OpenAI 追蹤) */
  userId?: string;
  /** 是否啟用 JSON 模式 (預設: true) */
  jsonMode?: boolean;
  /** 請求超時時間 (毫秒, 預設: 60000) */
  timeout?: number;
}

export interface OpenAIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

// ============================================
// AI Service 回應型別
// ============================================

export interface AIServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: AIErrorCode;
  isRetryable?: boolean;
  usage?: OpenAIResponse['usage'];
}

export type AIErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'AI_NOT_CONFIGURED'
  | 'AI_QUOTA_EXCEEDED'
  | 'AI_RATE_LIMIT'
  | 'AI_API_ERROR'
  | 'EMPTY_RESPONSE'
  | 'JSON_PARSE_ERROR'
  | 'INTERNAL_ERROR';

// ============================================
// 履歷解析型別
// ============================================

export interface ParsedResumeData {
  // 基本資訊
  name_kanji: string | null;
  name_kana: string | null;
  name_romaji: string | null;
  birth_date: string | null;
  age: number | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address_line: string | null;

  // 連結
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;

  // 簡介
  career_summary: string | null;
  self_pr: string | null;

  // 結構化資料
  education: ParsedEducation[];
  work_experience: ParsedWorkExperience[];
  skills: ParsedSkill[];
  languages: ParsedLanguage[];
  certifications: ParsedCertification[];
  awards: ParsedAward[];
}

export interface ParsedEducation {
  school_name: string;
  major: string;
  date: string; // YYYY-MM
  comment: string | null;
}

export interface ParsedPosition {
  title: string;
  start_date: string; // YYYY-MM
  end_date: string | null;
  is_current: boolean;
  comment: string | null;
}

export interface ParsedWorkExperience {
  company_name: string;
  is_current: boolean;
  start_date: string; // YYYY-MM
  end_date: string | null;
  description: string | null;
  positions: ParsedPosition[];
}

export interface ParsedSkill {
  category: string;
  items: string[];
}

export interface ParsedLanguage {
  name: string;
  level: string;
}

export interface ParsedCertification {
  name: string;
  date: string; // YYYY-MM
}

export interface ParsedAward {
  title: string;
  date: string; // YYYY-MM
  organization: string;
}

// ============================================
// Job Description 解析型別
// ============================================

export interface ParsedJobDescription {
  // 公司資訊
  company_name: string | null;
  company_url: string | null;
  company_description: string | null;

  // 職位資訊
  position_title: string | null;
  department: string | null;
  employment_type: string | null;
  work_location: string | null;
  remote_policy: string | null;

  // 工作內容
  job_description: string | null;
  responsibilities: string[];
  requirements: string[];
  preferred_qualifications: string[];

  // 薪資福利
  salary_range: {
    min: number | null;
    max: number | null;
    currency: string;
    type: 'annual' | 'monthly';
  } | null;
  benefits: string[];

  // 其他
  application_deadline: string | null;
  start_date: string | null;
  tags: string[];
}

