/**
 * Resume 相關的 Zod 驗證 Schema
 * 
 * 用於 API routes 的輸入驗證
 */

import { z } from "zod";

// ============================================
// 基本型別 Schema
// ============================================

export const EducationSchema = z.object({
  id: z.string().optional(), // 用於前端排序
  date: z.string().regex(/^\d{4}-\d{2}$/, "日期格式必須為 YYYY-MM"),
  school_name: z.string().max(100),
  major: z.string().max(100),
  degree: z.string().max(50),
  comment: z.string().max(500).optional(), // 備考 (學歷相關備註資訊)
});

export const PositionSchema = z.object({
  id: z.string().optional(), // 用於前端排序
  title: z.string().max(100),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, "日期格式必須為 YYYY-MM"),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, "日期格式必須為 YYYY-MM").nullable(),
  is_current: z.boolean(),
  comment: z.string().max(500).optional(), // 升職或職種變更的備註
}).refine(
  (data) => {
    // 如果 is_current 為 true，end_date 應該是 null
    if (data.is_current && data.end_date !== null) {
      return false;
    }
    return true;
  },
  {
    message: "進行中的職位不應該有結束日期",
    path: ["end_date"],
  }
);

export const WorkExperienceSchema = z.object({
  id: z.string().optional(), // 用於前端排序
  company_name: z.string().max(100),
  industry: z.string().max(100).optional(),
  employment_type: z.string().max(50).optional(), // 雇用形態 (整個公司統一，可選)
  department: z.string().max(100).optional(), // 部署 (整個公司統一，可選)
  start_date: z.string().regex(/^\d{4}-\d{2}$/, "日期格式必須為 YYYY-MM"),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, "日期格式必須為 YYYY-MM").nullable(),
  is_current: z.boolean(),
  description: z.string().max(5000).optional(), // 職務內容・担当業務・実績 (整個工作經驗的說明，支援換行)
  positions: z.array(PositionSchema).min(1),
  imported_from_career_ids: z.array(z.string().uuid()).optional(),
  imported_at: z.string().datetime().optional(),
});

export const CertificationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}$/, "日期格式必須為 YYYY-MM"),
  name: z.string().max(200),
});

export const AwardSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}$/, "日期格式必須為 YYYY-MM"),
  title: z.string().max(200),
  organization: z.string().max(100),
});

export const LanguageSchema = z.object({
  name: z.string().max(50),
  level: z.string().max(50),
});

export const SkillSchema = z.object({
  category: z.string().max(100),
  items: z.array(z.string().max(100)).max(50),
});

export const PreferencesSchema = z.object({
  job_types: z.array(z.string().max(100)).max(20).optional(),
  locations: z.array(z.string().max(100)).max(20).optional(),
  employment_types: z.array(z.string().max(50)).max(10).optional(),
  work_styles: z.array(z.string().max(50)).max(10).optional(),
});

// ============================================
// Resume Form Data Schema
// ============================================

export const ResumeFormDataSchema = z.object({
  // 履歷元資訊
  resume_name: z.string().max(100).optional(),
  is_archived: z.boolean().optional(), // 支援更新封存狀態
  internal_memo: z.string().max(500).optional(), // 內部備註
  
  // 公開設定
  is_public: z.boolean().optional(), // 公開狀態
  public_url_slug: z.string()
    .regex(/^[a-z0-9-]+$/, "URL slug 只能包含小寫字母、數字和連字號")
    .min(3)
    .max(100)
    .optional(), // 公開 URL slug
  public_expires_at: z.string().datetime().nullable().optional(), // 公開到期日
  
  // 個人基本資訊
  name_kanji: z.string().max(50).optional(),
  name_kana: z.string().max(50).optional(),
  name_romaji: z.string().max(100).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD").optional(),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.string().max(20).optional(),
  photo_url: z.string().url().max(500).optional().or(z.literal("")),
  
  // 連絡資訊
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  postal_code: z.string().max(10).optional(),
  prefecture: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  address_line: z.string().max(200).optional(),
  building: z.string().max(100).optional(),
  
  // 社群媒體
  linkedin_url: z.string().url().max(500).optional().or(z.literal("")),
  github_url: z.string().url().max(500).optional().or(z.literal("")),
  portfolio_url: z.string().url().max(500).optional().or(z.literal("")),
  other_url: z.string().url().max(500).optional().or(z.literal("")),
  
  // 履歷內容
  career_summary: z.string().max(5000).optional(),
  self_pr: z.string().max(5000).optional(),
  
  // JSONB 欄位
  education: z.array(EducationSchema).max(20).optional(),
  work_experience: z.array(WorkExperienceSchema).max(50).optional(),
  certifications: z.array(CertificationSchema).max(50).optional(),
  awards: z.array(AwardSchema).max(50).optional(),
  languages: z.array(LanguageSchema).max(20).optional(),
  skills: z.array(SkillSchema).max(20).optional(),
  preferences: PreferencesSchema.optional(),
  
  // 來源資訊
  source_type: z.enum(["manual", "pdf", "import"]).optional(),
  source_file_url: z.string().url().max(500).optional().or(z.literal("")).nullable(),
}).strict(); // 禁止額外欄位

// ============================================
// Published Resume Schema (發布用)
// ============================================

export const PublishResumeSchema = z.object({
  is_public: z.boolean().optional().default(true),
  public_url_slug: z.string()
    .regex(/^[a-z0-9-]+$/, "URL slug 只能包含小寫字母、數字和連字號")
    .min(3)
    .max(100)
    .optional(),
});

// ============================================
// Update Published Resume Settings Schema
// ============================================

export const UpdatePublishedResumeSettingsSchema = z.object({
  is_public: z.boolean().optional(),
  public_url_slug: z.string()
    .regex(/^[a-z0-9-]+$/, "URL slug 只能包含小寫字母、數字和連字號")
    .min(3)
    .max(100)
    .optional(),
  public_expires_at: z.string().datetime().nullable().optional(), // 支援更新到期日
}).refine(
  (data) => data.is_public !== undefined || data.public_url_slug !== undefined || data.public_expires_at !== undefined,
  {
    message: "至少需要提供一個更新欄位",
  }
);

// ============================================
// Type Exports
// ============================================

export type ResumeFormData = z.infer<typeof ResumeFormDataSchema>;
export type PublishResumeData = z.infer<typeof PublishResumeSchema>;
export type UpdatePublishedResumeSettingsData = z.infer<typeof UpdatePublishedResumeSettingsSchema>;

