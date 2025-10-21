/**
 * Applications Mock 數據
 * 
 * 代表未來的 applications 資料表
 * 包含所有應募相關的完整數據結構
 */

import type { Application } from "@/types/application";

export const MOCK_APPLICATIONS_FULL: Application[] = [
  {
    id: "app-001",
    userId: "user-001",
    companyName: "株式会社サンプル",
    companyUrl: "https://www.example.com",
    position: "フロントエンドエンジニア",
    status: "interview",
    employmentType: "full_time",
    applicationMethod: {
      type: "job_site",
      siteName: "LinkedIn",
      siteUrl: "https://www.linkedin.com/jobs/123",
      scoutType: "recruiter",
      recruiterName: "田中太郎",
      recruiterCompany: "株式会社リクルート",
      scoutName: "田中太郎",
      scoutCompany: "株式会社リクルート",
      scoutEmail: "tanaka@recruit.com",
      memo: "リクルーター経由でスカウトされた"
    },
    postedSalary: {
      type: "annual",
      minAnnualSalary: 600,
      maxAnnualSalary: 800,
      notes: "経験・スキルに応じて優遇",
    },
    desiredSalary: 750,
    offerSalary: undefined,
    tags: ["リモート可", "React", "TypeScript", "在宅勤務可能", "フルリモート可"],
    notes: "リモート勤務可能。技術スタックはReact, TypeScript。",
    schedule: {
      nextEvent: "カジュアル面談",
      deadline: "2025-10-15T14:00:00+09:00",
      interviewMethod: {
        type: "online",
        url: "https://meet.google.com/abc-defg-hij",
      },
    },
    createdAt: "2025-09-28T10:00:00Z",
    updatedAt: "2025-10-05T15:30:00Z",
  },
  {
    id: "app-002",
    userId: "user-001",
    companyName: "テック株式会社",
    companyUrl: "https://tech-company.jp",
    position: "バックエンドエンジニア",
    status: "applied",
    employmentType: "contract",
    applicationMethod: {
      type: "job_site",
      siteName: "Wantedly",
      siteUrl: "https://www.wantedly.com/companies/tech-company",
      scoutType: "direct",
      scoutName: "採用担当 鈴木",
      scoutCompany: "テック株式会社",
      scoutEmail: "suzuki@tech-company.jp",
      memo: "企業から直接スカウトされた"
    },
    postedSalary: {
      type: "monthly_with_bonus",
      minMonthlySalary: 50,
      maxMonthlySalary: 80,
      bonusMonths: 4,
      notes: "スタートアップ、成長企業"
    },
    desiredSalary: 800,
    tags: ["Go", "Docker", "スタートアップ"],
    notes: "新しい技術に挑戦したい",
    schedule: {
      nextEvent: "書類選考",
      deadline: "2025-10-20T15:00:00+09:00"
    },
    createdAt: "2025-09-15T09:00:00Z",
    updatedAt: "2025-10-01T14:45:00Z",
  },
  {
    id: "app-003",
    userId: "user-001",
    companyName: "リモートファースト企業",
    position: "フルリモートエンジニア",
    status: "bookmarked",
    employmentType: "full_time",
    applicationMethod: {
      type: "referral",
      referrerName: "佐藤健",
      personFrom: "元同僚",
      referrerEmail: "sato.ken@example.com",
      siteUrl: "https://remote-first.co.jp/careers",
      memo: "元同僚からの紹介、社風が良いらしい"
    },
    postedSalary: {
      type: "annual",
      minAnnualSalary: 850,
      maxAnnualSalary: 1000,
      notes: "グローバル、英語"
    },
    desiredSalary: 850,
    tags: ["フルリモート", "グローバル", "英語"],
    notes: "完全リモート、時間柔軟",
    schedule: undefined,
    createdAt: "2025-09-10T11:30:00Z",
    updatedAt: "2025-09-25T16:20:00Z",
  },
  {
    id: "app-004",
    userId: "user-001",
    companyName: "スタートアップXYZ",
    position: "CTO",
    status: "offer",
    employmentType: "full_time",
    applicationMethod: {
      type: "direct",
      siteUrl: "https://startup-xyz.com/careers",
      contactPerson: "CEO 山田さん",
      contactEmail: "yamada@startup-xyz.com",
      memo: "CEO直接連絡、ストックオプションあり"
    },
    postedSalary: undefined,
    desiredSalary: 1100,
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salaryType: "基本給", salary: 800 },
        { salaryType: "役職手当", salary: 200 },
        { salaryType: "業績賞与", salary: 100 }
      ],
      notes: "ストックオプション別"
    },
    tags: ["スタートアップ", "エグゼクティブ"],
    notes: "興味深いプロジェクト、後で詳細を確認する。",
    schedule: {
      nextEvent: "最終面接",
      deadline: "2025-10-18T15:00:00+09:00",
      interviewMethod: {
        type: "online",
        url: "https://meet.google.com/xyz-123-456"
      }
    },
    createdAt: "2025-09-20T13:45:00Z",
    updatedAt: "2025-10-05T17:15:00Z",
  }
];

/**
 * 資料庫設計參考 - Applications 表
 * 
 * Table: applications
 * ├─ id (uuid, primary key)
 * ├─ user_id (uuid, foreign key -> auth.users)
 * ├─ company_name (text, not null)
 * ├─ company_url (text, nullable)
 * ├─ position (text, not null)
 * ├─ status (text, not null) -- 'bookmarked' | 'applied' | 'first_interview' | etc.
 * ├─ employment_type (text, not null)
 * ├─ application_method (jsonb, not null) -- { type, ...fields }
 * ├─ posted_salary (jsonb, nullable) -- { type, minAnnualSalary, maxAnnualSalary, notes }
 * ├─ desired_salary (numeric, nullable) -- 万円単位
 * ├─ offer_salary (jsonb, nullable) -- { currency, salaryBreakdown, notes }
 * ├─ tags (text[], nullable)
 * ├─ notes (text, nullable)
 * ├─ schedule (jsonb, nullable) -- { nextEvent, deadline, interviewMethod }
 * ├─ created_at (timestamptz, not null, default: now())
 * └─ updated_at (timestamptz, not null, default: now())
 * 
 * === Indexes 建議 ===
 * - applications(user_id, status) -- 查詢用戶的應募狀態
 * - applications(user_id, created_at DESC) -- 依時間排序
 * - applications(status, created_at DESC) -- 依狀態和時間排序
 * 
 * === RLS Policies 建議 ===
 * - SELECT: user_id = auth.uid()
 * - INSERT: user_id = auth.uid()
 * - UPDATE: user_id = auth.uid()
 * - DELETE: user_id = auth.uid()
 */
