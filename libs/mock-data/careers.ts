/**
 * Careers Mock 數據
 * 
 * 代表未來的 careers 資料表
 * 包含所有職業履歷相關的完整數據結構
 */

import type { Career } from "@/types/career";

export const MOCK_CAREERS_FULL: Career[] = [
  // ===========================================
  // 範例 1: 現職 - シニアエンジニア（正社員）
  // 包含: 現職として設定、高年収
  // ===========================================
  {
    id: "career-001",
    companyName: "株式会社メルカリ",
    position: "シニアフロントエンドエンジニア",
    status: "current",
    startDate: "2024-04",
    endDate: undefined,
    employmentType: "full_time",
    
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salary: 8000, salaryType: "基本給" },      // 800万円/年
        { salary: 2000, salaryType: "賞与" },       // 200万円/年
        { salary: 1000, salaryType: "手当" }         // 100万円/年
      ],
      notes: "フルリモート対応"
    },
    
    tags: ["React", "TypeScript", "フルリモート", "マイクロサービス"],
    notes: "マイクロサービスアーキテクチャの経験を積める環境。チームリードも担当。",
    
    salaryHistory: [
      {
        yearMonth: "2024-04",
        currency: "JPY",
        position: "シニアフロントエンドエンジニア",
        notes: "入社時",
        salaryBreakdown: [
          { salary: 8000, salaryType: "基本給" },      // 800万円/年
          { salary: 2000, salaryType: "賞与" },        // 200万円/年
          { salary: 1000, salaryType: "手当" }         // 100万円/年
        ]
      },
      {
        yearMonth: "2024-10",
        currency: "JPY",
        position: "シニアフロントエンドエンジニア",
        notes: "昇給",
        salaryBreakdown: [
          { salary: 8800, salaryType: "基本給" },      // 880万円/年
          { salary: 2200, salaryType: "賞与" },        // 220万円/年
          { salary: 1000, salaryType: "手当" }         // 100万円/年
        ]
      }
    ],
    
    createdAt: "2023-04-01T00:00:00Z",
    updatedAt: "2024-04-01T10:30:00Z",
  },

  // ===========================================
  // 範例 2: 前職 - フロントエンドエンジニア
  // 包含: 2年間在職、昇給経験
  // ===========================================
  {
    id: "career-002",
    companyName: "株式会社サイバーエージェント",
    position: "フロントエンドエンジニア",
    status: "left",
    startDate: "2021-04",
    endDate: "2023-03",
    employmentType: "full_time",
    
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salary: 4000, salaryType: "基本給" },      // 400万円/年
        { salary: 1000, salaryType: "賞与" },       // 100万円/年
        { salary: 500, salaryType: "手当" }         // 50万円/年
      ],
      notes: "45時間まで固定残業代含む"
    },
    
    tags: ["React", "Vue.js", "AbemaTV", "大規模開発"],
    notes: "AbemaTV開発チームに所属。大規模サービスの開発経験を積む。",
    
    salaryHistory: [
      {
        yearMonth: "2021-04",
        currency: "JPY",
        position: "フロントエンドエンジニア",
        notes: "入社時",
        salaryBreakdown: [
          { salary: 3600, salaryType: "基本給" },       // 360万円/年
          { salary: 900, salaryType: "賞与" },         // 90万円/年
          { salary: 240, salaryType: "通勤手当" },      // 24万円/年
        ]
      },
      {
        yearMonth: "2022-04",
        currency: "JPY",
        position: "フロントエンドエンジニア",
        notes: "昇給",
        salaryBreakdown: [
          { salary: 4200, salaryType: "基本給" },       // 420万円/年
          { salary: 1050, salaryType: "賞与" },        // 105万円/年
          { salary: 240, salaryType: "通勤手当" },      // 24万円/年
        ]
      }
    ],
    
    createdAt: "2021-04-01T00:00:00Z",
    updatedAt: "2023-03-31T23:59:59Z",
  },

  // ===========================================
  // 範例 3: 新卒 - 初回転職前
  // 包含: 新卒から2年間、基礎経験
  // ===========================================
  {
    id: "career-003",
    companyName: "株式会社リクルート",
    position: "エンジニア",
    status: "left",
    startDate: "2019-04",
    endDate: "2021-03",
    employmentType: "full_time",
    
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salary: 2400, salaryType: "基本給" },      // 240万円/年
        { salary: 600, salaryType: "賞与" },         // 60万円/年
        { salary: 200, salaryType: "手当" }          // 20万円/年
      ],
      notes: "新卒採用"
    },
    
    tags: ["新卒", "Java", "Spring Boot", "チーム開発", "Web開発"],
    notes: "新卒として入社。Webアプリケーション開発を担当。チーム開発の基礎を学ぶ。",
    
    salaryHistory: [
      {
        yearMonth: "2019-04",
        currency: "JPY",
        position: "エンジニア（新卒）",
        notes: "入社時",
        salaryBreakdown: [
          { salary: 2160, salaryType: "基本給" },      // 216万円/年
          { salary: 540, salaryType: "賞与" },         // 54万円/年
          { salary: 180, salaryType: "住宅手当" },     // 18万円/年
          { salary: 120, salaryType: "通勤手当" },     // 12万円/年
        ]
      },
      {
        yearMonth: "2020-04",
        currency: "JPY",
        position: "エンジニア",
        notes: "1年目昇給",
        salaryBreakdown: [
          { salary: 2520, salaryType: "基本給" },      // 252万円/年
          { salary: 630, salaryType: "賞与" },         // 63万円/年
          { salary: 180, salaryType: "住宅手当" },
          { salary: 120, salaryType: "通勤手当" },
        ]
      }
    ],
    
    createdAt: "2019-04-01T00:00:00Z",
    updatedAt: "2021-03-31T23:59:59Z",
  },

  // ===========================================
  // 範例 4: 海外赴任 - 国際経験
  // 包含: 1年間の海外赴任経験
  // ===========================================
  {
    id: "career-004",
    companyName: "株式会社サンプル",
    position: "シニアエンジニア",
    status: "left",
    startDate: "2023-04",
    endDate: "2024-03",
    employmentType: "full_time",
    
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salary: 6000, salaryType: "基本給" },      // 600万円/年
        { salary: 1500, salaryType: "賞与" },        // 150万円/年
        { salary: 1000, salaryType: "海外手当" },    // 100万円/年
      ],
      notes: "シンガポール赴任"
    },
    
    tags: ["海外赴任", "シンガポール", "マネジメント", "Python", "国際経験"],
    notes: "シンガポール支社に1年間赴任。現地チームのマネジメントを担当。国際的な開発経験を積む。",
    
    salaryHistory: [
      {
        yearMonth: "2023-04",
        currency: "JPY",
        position: "シニアエンジニア",
        notes: "海外赴任開始",
        salaryBreakdown: [
          { salary: 5000, salaryType: "基本給" },      // 500万円/年
          { salary: 1250, salaryType: "賞与" },        // 125万円/年
          { salary: 1000, salaryType: "海外手当" },    // 100万円/年
          { salary: 500, salaryType: "住宅手当" },     // 50万円/年
        ]
      },
      {
        yearMonth: "2023-10",
        currency: "JPY",
        position: "シニアエンジニア",
        notes: "赴任手当調整",
        salaryBreakdown: [
          { salary: 5000, salaryType: "基本給" },
          { salary: 1250, salaryType: "賞与" },
          { salary: 1200, salaryType: "海外手当" },    // 120万円/年（調整）
          { salary: 500, salaryType: "住宅手当" },
        ]
      }
    ],
    
    createdAt: "2022-04-01T00:00:00Z",
    updatedAt: "2023-03-31T23:59:59Z",
  }
];

/**
 * 資料庫設計參考 - Careers 表
 * 
 * Table: careers
 * ├─ id (uuid, primary key)
 * ├─ user_id (uuid, foreign key -> auth.users)
 * ├─ company_name (text, not null)
 * ├─ position (text, not null)
 * ├─ status (text, not null) -- 'current' | 'left'
 * ├─ start_date (date, not null) -- YYYY-MM format
 * ├─ end_date (date, nullable) -- YYYY-MM format
 * ├─ employment_type (text, not null)
 * ├─ offer_salary (jsonb, nullable) -- { currency, salaryBreakdown, notes }
 * ├─ tags (text[], nullable)
 * ├─ notes (text, nullable)
 * ├─ created_at (timestamptz, not null, default: now())
 * └─ updated_at (timestamptz, not null, default: now())
 * 
 * Table: salary_history
 * ├─ id (uuid, primary key)
 * ├─ career_id (uuid, foreign key -> careers.id, on delete cascade)
 * ├─ year_month (text, not null) -- 'YYYY-MM'
 * ├─ currency (text, not null) -- 'JPY' | 'USD' | etc.
 * ├─ position (text, nullable)
 * ├─ notes (text, nullable)
 * ├─ created_at (timestamptz, not null, default: now())
 * └─ updated_at (timestamptz, not null, default: now())
 * 
 * Table: salary_breakdown
 * ├─ id (uuid, primary key)
 * ├─ salary_history_id (uuid, foreign key -> salary_history.id, on delete cascade)
 * ├─ salary (numeric, not null) -- 統一用 k 儲存
 * ├─ salary_type (text, not null) -- '基本給', 'Base Salary', etc.
 * ├─ sort_order (integer, nullable) -- 顯示順序
 * ├─ created_at (timestamptz, not null, default: now())
 * └─ updated_at (timestamptz, not null, default: now())
 */
