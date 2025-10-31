/**
 * Side Jobs Mock 數據
 * 
 * 代表副業/兼職相關的數據結構
 * 與主業 careers 分開管理
 * 
 * Mock User UUID: 550e8400-e29b-41d4-a716-446655440000
 * (與 Applications/Careers/Resume 使用同一測試用戶)
 * 
 * ===== 薪資單位使用規則 =====
 * Side Jobs 使用與 Careers 相同的薪資單位「k」(千円):
 * - salary: 1200 = 1200千円 = 120万円
 * - salary: 600 = 600千円 = 60万円
 * 
 * 詳細轉換關係請參考 careers.ts 的說明
 */

import type { Career } from "@/types/career";

// Mock User ID (與其他 mock data 統一)
export const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export const MOCK_SIDE_JOBS: Career[] = [
  // ===========================================
  // 範例 1: 現職副業 - フリーランス
  // 包含: 現職と並行、副業収入
  // ===========================================
  {
    id: "side-job-001",
    companyName: "フリーランス（個人事業主）",
    position: "フルスタックエンジニア",
    status: "current",
    startDate: "2023-06",
    employmentType: "freelance",
    
    offerSalary: undefined,
    
    tags: ["副業", "リモート", "React", "Node.js", "コンサル"],
    notes: "複数クライアント対応。主に週末稼働。技術コンサルティングも提供。",
    
    salaryHistory: [
      {
        yearMonth: "2023-06",
        currency: "JPY",
        position: "フリーランスエンジニア",
        notes: "副業開始",
        salaryBreakdown: [
          { salary: 1200, salaryType: "A社プロジェクト" },    // 120万円/年
          { salary: 600, salaryType: "B社コンサル" },         // 60万円/年
        ]
      },
      {
        yearMonth: "2024-01",
        currency: "JPY",
        position: "フリーランスエンジニア",
        notes: "単価アップ",
        salaryBreakdown: [
          { salary: 1800, salaryType: "A社プロジェクト" },    // 180万円/年
          { salary: 900, salaryType: "B社コンサル" },         // 90万円/年
          { salary: 300, salaryType: "C社スポット案件" },     // 30万円/年
        ]
      }
    ],
    
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-01-10T15:00:00Z",
  },

  // ===========================================
  // 範例 2: 過去副業 - 短期契約
  // 包含: 6ヶ月契約、スキルアップ目的
  // ===========================================
  {
    id: "side-job-002",
    companyName: "株式会社DeNA",
    position: "フロントエンドエンジニア（契約）",
    status: "left",
    startDate: "2020-10",
    endDate: "2021-03",
    employmentType: "contract",
    
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salary: 3000, salaryType: "基本給" },      // 300万円/年
        { salary: 0, salaryType: "賞与" },           // 契約社員は賞与なし
        { salary: 200, salaryType: "手当" }          // 20万円/年
      ],
      notes: "6ヶ月契約、スキルアップ目的"
    },
    
    tags: ["契約社員", "React", "TypeScript", "短期", "ゲーム開発"],
    notes: "モバイルゲームのフロントエンド開発。React/TypeScriptのスキルを向上。",
    
    salaryHistory: [
      {
        yearMonth: "2020-10",
        currency: "JPY",
        position: "フロントエンドエンジニア（契約）",
        notes: "契約開始",
        salaryBreakdown: [
          { salary: 3000, salaryType: "基本給" },      // 300万円/年
          { salary: 0, salaryType: "賞与" },
          { salary: 200, salaryType: "交通費" },       // 20万円/年
        ]
      }
    ],
    
    createdAt: "2020-10-01T00:00:00Z",
    updatedAt: "2021-03-31T23:59:59Z",
  },

  // ===========================================
  // 範例 3: 過去副業 - 技術コンサル
  // 包含: 技術指導、短期プロジェクト
  // ===========================================
  {
    id: "side-job-003",
    companyName: "スタートアップA社",
    position: "技術コンサルタント",
    status: "left",
    startDate: "2022-01",
    endDate: "2022-06",
    employmentType: "freelance",
    
    offerSalary: undefined,
    
    tags: ["コンサル", "技術指導", "React", "アーキテクチャ", "短期"],
    notes: "スタートアップの技術スタック構築をサポート。React/Node.jsの導入を指導。",
    
    salaryHistory: [
      {
        yearMonth: "2022-01",
        currency: "JPY",
        position: "技術コンサルタント",
        notes: "コンサル開始",
        salaryBreakdown: [
          { salary: 800, salaryType: "月額コンサル費" },    // 80万円/年
          { salary: 400, salaryType: "技術指導費" },         // 40万円/年
        ]
      }
    ],
    
    createdAt: "2022-01-01T00:00:00Z",
    updatedAt: "2022-06-30T23:59:59Z",
  },

  // ===========================================
  // 範例 4: 現職副業 - 技術ブログ執筆
  // 包含: 技術記事執筆、収益化
  // ===========================================
  {
    id: "side-job-004",
    companyName: "技術メディア",
    position: "技術ライター",
    status: "current",
    startDate: "2024-01",
    employmentType: "freelance",
    
    offerSalary: undefined,
    
    tags: ["ライティング", "技術記事", "React", "TypeScript", "収益化"],
    notes: "技術ブログの記事執筆。React/TypeScript関連の技術記事を月2本程度執筆。",
    
    salaryHistory: [
      {
        yearMonth: "2024-01",
        currency: "JPY",
        position: "技術ライター",
        notes: "執筆開始",
        salaryBreakdown: [
          { salary: 600, salaryType: "記事執筆費" },    // 60万円/年
          { salary: 200, salaryType: "広告収益" },      // 20万円/年
        ]
      }
    ],
    
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  }
];

/**
 * 副業データの統計情報
 */
export const SIDE_JOBS_STATS = {
  totalJobs: MOCK_SIDE_JOBS.length,
  currentJobs: MOCK_SIDE_JOBS.filter(job => job.status === "current").length,
  totalEarnings: MOCK_SIDE_JOBS.reduce((total, job) => {
    if (job.salaryHistory && job.salaryHistory.length > 0) {
      const latestSalary = job.salaryHistory[job.salaryHistory.length - 1];
      const jobTotal = latestSalary.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0);
      return total + jobTotal;
    }
    return total;
  }, 0),
  averageMonthlyEarnings: 0 // 計算後に設定
};

// 月平均収入を計算
SIDE_JOBS_STATS.averageMonthlyEarnings = Math.round(SIDE_JOBS_STATS.totalEarnings / 12);
