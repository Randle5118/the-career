/**
 * Career → Resume WorkExperience 轉換邏輯
 * 
 * 用途：將 MyCareer 的職歷記錄轉換為履歷書格式
 * 重點：
 * - 同公司的多筆 Career 會合併為一個 WorkExperience（支援職能轉變）
 * - 完全過濾薪資資訊（保護隱私）
 * - 保留基本資訊（公司名、日期、職位）
 * - notes 可作為 description 的初始提示
 */

import type { Career } from "@/types/career";
import type { WorkExperience, Position } from "@/types/resume";

/**
 * 將單個 Career 轉換為 Position
 */
export function convertCareerToPosition(career: Career): Position {
  return {
    start_date: career.startDate,
    end_date: career.endDate || null,
    is_current: career.status === "current",
    department: "", // 需手動補充
    title: career.position,
    employment_type: getEmploymentTypeLabel(career.employmentType),
    description: career.notes || "", // 使用 notes 作為初始提示
    responsibilities: [], // 需手動補充
    achievements: [], // 需手動補充
  };
}

/**
 * 將同公司的多個 Career 記錄轉換為一個 WorkExperience
 * 
 * @param careers - 同一公司的所有 Career 記錄（會自動排序）
 * @param companyName - 公司名稱
 */
export function convertCareersToWorkExperience(
  careers: Career[],
  companyName: string
): WorkExperience {
  // 依照時間排序（早 → 晚）
  const sortedCareers = [...careers].sort((a, b) => 
    new Date(a.startDate + "-01").getTime() - new Date(b.startDate + "-01").getTime()
  );
  
  const firstCareer = sortedCareers[0];
  const lastCareer = sortedCareers[sortedCareers.length - 1];
  
  return {
    company_name: companyName,
    industry: "", // 需手動補充
    start_date: firstCareer.startDate,
    end_date: lastCareer.endDate || null,
    is_current: lastCareer.status === "current",
    
    // 將每個 Career 轉換為一個 Position
    positions: sortedCareers.map(career => convertCareerToPosition(career)),
  };
}

/**
 * 將 Career 列表按公司分組
 * 
 * @returns Map<公司名, Career[]>
 */
export function groupCareersByCompany(careers: Career[]): Map<string, Career[]> {
  const grouped = new Map<string, Career[]>();
  
  for (const career of careers) {
    const existing = grouped.get(career.companyName) || [];
    grouped.set(career.companyName, [...existing, career]);
  }
  
  return grouped;
}

/**
 * 取得雇用形態的日文標籤
 */
function getEmploymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    full_time: "正社員",
    contract: "契約社員",
    temporary: "派遣社員",
    part_time: "パート・アルバイト",
    freelance: "フリーランス",
    side_job: "副業",
  };
  
  return labels[type] || type;
}

/**
 * 驗證轉換後的 WorkExperience 是否完整
 */
export function validateWorkExperience(exp: WorkExperience): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  
  if (!exp.company_name) missingFields.push("会社名");
  if (!exp.industry) missingFields.push("業種");
  if (!exp.start_date) missingFields.push("入社年月");
  
  exp.positions.forEach((pos, index) => {
    if (!pos.title) missingFields.push(`職位${index + 1}の役職`);
    if (!pos.start_date) missingFields.push(`職位${index + 1}の開始年月`);
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * 計算公司的總任職期間
 */
export function calculateTenure(careers: Career[]): {
  years: number;
  months: number;
  displayText: string;
} {
  const sortedCareers = [...careers].sort((a, b) => 
    new Date(a.startDate + "-01").getTime() - new Date(b.startDate + "-01").getTime()
  );
  
  const start = new Date(sortedCareers[0].startDate + "-01");
  const lastCareer = sortedCareers[sortedCareers.length - 1];
  const end = lastCareer.endDate 
    ? new Date(lastCareer.endDate + "-01")
    : new Date();
  
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 
    + (end.getMonth() - start.getMonth());
  
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  let displayText = "";
  if (years > 0) displayText += `${years}年`;
  if (months > 0) displayText += `${months}ヶ月`;
  
  return { years, months, displayText: displayText || "1ヶ月未満" };
}




