// Types for resume management

export interface Education {
  id?: string; // 用於前端排序 (UUID)
  date: string;
  school_name: string;
  major: string;
  degree: string;
  comment?: string; // 備考 (學歷相關備註資訊)
}

export interface Position {
  id?: string; // 用於前端排序 (UUID)
  title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  comment?: string; // 升職或職種變更的備註
}

export interface WorkExperience {
  id?: string; // 用於前端排序 (UUID)
  company_name: string;
  industry: string;
  employment_type?: string; // 雇用形態 (整個公司統一，可選)
  department?: string; // 部署 (整個公司統一，可選)
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description?: string; // 職務內容・担当業務・実績 (整個工作經驗的說明，支援換行)
  positions: Position[]; // 職位列表 (升職/職種變更)
  // Career 匯入追蹤（選填）
  imported_from_career_ids?: string[];  // 來源 Career IDs
  imported_at?: string;                  // 匯入時間
}

export interface Certification {
  date: string;
  name: string;
}

export interface Award {
  date: string;
  title: string;
  organization: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Preferences {
  job_types: string[];
  locations: string[];
  employment_types: string[];
  work_styles: string[];
}

export interface Resume {
  id: string;
  user_id: string;
  resume_name: string;
  is_primary: boolean;
  is_public: boolean;
  is_archived: boolean; // 封存狀態
  public_url_slug: string;
  completeness: number;
  
  name_kanji: string;
  name_kana: string;
  name_romaji: string;
  birth_date: string;
  age: number;
  gender: string;
  photo_url: string;
  
  phone: string;
  email: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_line: string;
  building: string;
  
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  other_url: string;
  
  career_summary: string;
  self_pr: string;
  
  education: Education[];
  work_experience: WorkExperience[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  skills: Skill[];
  preferences: Preferences;
  
  source_type: string;
  source_file_url: string | null;
  
  // 新增欄位
  internal_memo?: string; // 內部備註
  public_expires_at?: string | null; // 公開到期日
  version?: number; // 版本號
  
  created_at: string;
  updated_at: string;
}

export interface ResumeFormData {
  resume_name?: string;
  
  // 公開設定相關
  is_public?: boolean;
  public_url_slug?: string;
  internal_memo?: string;
  public_expires_at?: string | null;

  name_kanji?: string;
  name_kana?: string;
  name_romaji?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  photo_url?: string;
  
  phone?: string;
  email?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address_line?: string;
  building?: string;
  
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_url?: string;
  
  career_summary?: string;
  self_pr?: string;
  
  education?: Education[];
  work_experience?: WorkExperience[];
  certifications?: Certification[];
  awards?: Award[];
  languages?: Language[];
  skills?: Skill[];
  preferences?: Preferences;
}

// Published Resume 型別 (發布版履歷)
// 注意: 採用「更新模式」,每個用戶只有一份公開履歷
export interface PublishedResume extends Resume {
  published_at: string;  // 首次發布時間 (不會改變)
  version: number;       // 固定為 1 (保留欄位供未來使用)
}

