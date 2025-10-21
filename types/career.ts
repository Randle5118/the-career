// Types for career history management
import type { EmploymentType } from "./application";
export type { EmploymentType };

export type EmploymentStatus = "current" | "left"; // 現職 | 退職

export type SalaryStructure = "monthly_with_bonus" | "annual"; // 月給＋賞与 | 年俸

// Offer salary with breakdown (確定薪資)
export interface OfferSalary {
  currency: Currency;                 // 貨幣種類
  salaryBreakdown: SalaryComponent[]; // オファー給与の内訳（確定金額）
  notes?: string;                     // 給与に関する備考
}

// Supported currencies (JPY only for Japan market)
export type Currency = 'JPY'; // 日本円

// Currency display config
export interface CurrencyConfig {
  symbol: string;      // 貨幣符號
  code: string;        // 貨幣代碼
  displayUnit: string; // 顯示單位（k, 万, 千 等）
  conversionRate: number; // 從 k 轉換為顯示單位的比率
}

// Individual salary component for pie chart
export interface SalaryComponent {
  salary: number;      // 金額（統一使用 k 為單位，1k = 1,000）
  salaryType: string;  // 種類（基本給、賞与、手当 など）
}

// Salary change record with breakdown
export interface SalaryChange {
  yearMonth: string;                  // YYYY-MM format
  currency: Currency;                 // 貨幣種類
  salaryBreakdown: SalaryComponent[]; // 給与の内訳（複數，統一用 k 為單位）
  position?: string;                  // 役職・ポジション
  notes?: string;                     // 備考
}

export interface Career {
  id: string;
  companyName: string;
  position: string;
  status: EmploymentStatus;
  startDate: string;           // YYYY-MM format
  endDate?: string;            // YYYY-MM format (optional for current jobs)
  employmentType: EmploymentType;
  offerSalary?: OfferSalary;   // 初期オファー給与
  overtimePay?: string;        // 残業代の詳細
  salaryNotes?: string;        // 給与に関する備考
  offerDocumentUrl?: string;   // オファーレターPDFのURL
  tags?: string[];             // タグ
  notes?: string;              // メモ
  salaryHistory?: SalaryChange[]; // 給与変化履歴
  createdAt: string;
  updatedAt: string;
}

export interface CareerFormData {
  companyName: string;
  position: string;
  status: EmploymentStatus;
  startDate: string;
  endDate?: string;
  employmentType: EmploymentType;
  tags?: string;               // Comma-separated string for form
  notes?: string;
}

