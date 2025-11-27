// Types for job application management

export type ApplicationStatus =
  | "bookmarked"         // ブックマーク - Bookmarked/Interested
  | "applied"            // 応募済み - Applied (includes document screening)
  | "interview"          // 面談・面接 - Interview process (casual + formal)
  | "offer"              // 内定 - Offer received
  | "rejected";          // 終了 - Rejected/Withdrawn/Ended

export type EmploymentType = 
  | "full_time"          // 正社員
  | "contract"           // 契約社員
  | "temporary"          // 派遣社員
  | "part_time"          // パート・アルバイト
  | "freelance"          // フリーランス
  | "side_job"           // 副業
  | "dispatch";          // 派遣 (保留向後相容性)

export type ApplicationMethodType = 
  | "job_site" // from all types of job site
  | "referral" // from referral
  | "direct" // from direct application

export interface JobSiteMethod {
  type: "job_site";
  siteName: string;      // 媒体名 (e.g., "Green", "Bizreach", "Indeed")
  siteUrl: string;       // 求人サイトURL (統一為必填)
  scoutType?: "direct" | "recruiter"; // スカウトのタイプ, from recruiter or direct from company
  recruiterName?: string; // リクルーター名
  recruiterCompany?: string; // リクルート会社名
  scoutName?: string;     // スカウトを送った人の名前
  scoutCompany?: string; // スカウトを送った会社名
  scoutEmail?: string;   // スカウトの連絡先メール
  memo?: string;         // メモ
}

export interface ReferralMethod {
  type: "referral";
  referrerName: string;   // 紹介者名
  personFrom: string; // 紹介者との関係（友人、同僚、知人など）
  referrerEmail?: string; // 紹介者メール
  siteUrl?: string; // 紹介された求人サイトのURL
  memo?: string;         // メモ
}

export interface DirectMethod {
  type: "direct";
  siteUrl: string; // 応募したサイトのURL (統一為必填)
  contactPerson: string;  // 連絡先担当者
  contactEmail?: string;  // 連絡先メール
  memo?: string;         // メモ
}

export type ApplicationMethod = JobSiteMethod | ReferralMethod | DirectMethod;

// 簡化的薪資結構 - 只保留年薪範圍和備註
export type SalaryStructureType = "monthly_with_bonus" | "annual";

export interface SalaryDetails {
  type?: SalaryStructureType;
  
  // Common / Simple
  minAnnualSalary?: number;
  maxAnnualSalary?: number;
  
  // Monthly details
  monthlyMin?: number;
  monthlyMax?: number;
  bonusMonths?: number;
  
  // Annual details (specific to annual type input)
  annualMin?: number;
  annualMax?: number;
  
  notes?: string;
}

export interface SalaryBreakdown {
  salary: number;             // 給与額（万円）
  salaryType: string;         // 給与種別 (e.g., "基本給", "賞与", "手当")
}

export interface OfferSalaryDetails {
  currency?: string;          // 通貨 (e.g., "JPY", "USD")
  salaryBreakdown?: SalaryBreakdown[]; // 給与内訳
  notes?: string;             // 備考
}

export type InterviewMethodType = "in_person" | "online";

export interface InPersonInterview {
  type: "in_person";
  address: string;            // 住所
  notes?: string;             // 備考 (e.g., "本社ビル 3階 会議室A")
}

export interface OnlineInterview {
  type: "online";
  url: string;                // オンラインURL
}

export type InterviewMethod = InPersonInterview | OnlineInterview;

export interface Schedule {
  nextEvent?: string;         // 次回イベント
  deadline?: string;          // 期日＋時間（ISO datetime）
  interviewMethod?: InterviewMethod; // 面接方法
}

export interface Application {
  // 基本情報
  id: string;                 // UUID
  userId: string;             // ユーザーID
  companyName: string;        // 会社名
  companyUrl?: string;        // 会社URL
  position: string;           // 職種
  status: ApplicationStatus;  // ステータス
  employmentType?: EmploymentType; // 雇用形態
  
  // 応募方法
  applicationMethod: ApplicationMethod; // 応募方法（求人サイト or Headhunter）
  
  // ファイル
  jobDescriptionFile?: string; // 求人情報（PDF URL or Base64）
  offerFile?: string;          // オファーファイル（PDF URL or Base64）
  
  // 給与情報
  postedSalary?: SalaryDetails; // 掲載給与
  desiredSalary?: number;       // 提示した希望給与（万円）
  offerSalary?: OfferSalaryDetails;  // オファー給与
  
  // メモ・タグ
  tags?: string[];              // タグメモ
  notes?: string;               // メモ
  
  // 日程管理
  schedule?: Schedule;          // 日程管理
  
  // システム情報
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFormData {
  companyName: string;
  companyUrl?: string;
  position: string;
  status: ApplicationStatus;
  employmentType?: EmploymentType;
  applicationMethod: ApplicationMethod;
  jobDescriptionFile?: string;
  offerFile?: string;
  postedSalary?: SalaryDetails;
  desiredSalary?: string; // Form field as string for input
  offerSalary?: SalaryDetails;
  tags?: string[];
  notes?: string;
  schedule?: Schedule;
}
