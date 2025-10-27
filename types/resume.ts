// Types for resume management

export interface Education {
  date: string;
  school_name: string;
  major: string;
  degree: string;
}

export interface Position {
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  department: string;
  title: string;
  employment_type: string;
  description: string;
  responsibilities: string[];
  achievements: string[];
}

export interface WorkExperience {
  company_name: string;
  industry: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  positions: Position[];
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
  id: number;
  user_id: string;
  resume_name: string;
  is_primary: boolean;
  is_public: boolean;
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
  
  created_at: string;
  updated_at: string;
}

export interface ResumeFormData {
  resume_name?: string;
  
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

