/**
 * 資料轉換工具函數
 * 統一處理資料庫欄位 (snake_case) 與前端型別 (camelCase) 的轉換
 */

import type { Application, ApplicationFormData } from "@/types/application";
import type { Resume, ResumeFormData } from "@/types/resume";

/**
 * 資料庫 Application 記錄型別
 */
interface ApplicationRow {
  id: string;
  user_id: string;
  company_name: string;
  company_url?: string;
  position: string;
  status: string;
  employment_type?: string;
  application_method: unknown;
  job_description_file?: string;
  offer_file?: string;
  posted_salary_min?: number;
  posted_salary_max?: number;
  posted_salary_notes?: string;
  desired_salary?: number;
  offer_salary?: unknown;
  tags?: string[];
  notes?: string;
  schedule?: unknown;
  created_at: string;
  updated_at: string;
}

/**
 * 將資料庫記錄轉換為 Application 型別
 */
export function transformApplicationFromDB(row: ApplicationRow): Application {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    companyUrl: row.company_url,
    position: row.position,
    status: row.status as Application['status'],
    employmentType: row.employment_type as Application['employmentType'],
    applicationMethod: row.application_method as Application['applicationMethod'],
    jobDescriptionFile: row.job_description_file,
    offerFile: row.offer_file,
    postedSalary: row.posted_salary_min || row.posted_salary_max
      ? {
          minAnnualSalary: row.posted_salary_min,
          maxAnnualSalary: row.posted_salary_max,
          notes: row.posted_salary_notes,
        }
      : undefined,
    desiredSalary: row.desired_salary,
    offerSalary: row.offer_salary as Application['offerSalary'],
    tags: row.tags,
    notes: row.notes,
    schedule: row.schedule as Application['schedule'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 將 ApplicationFormData 轉換為資料庫格式
 */
export function transformApplicationToDB(
  data: ApplicationFormData
): Partial<ApplicationRow> {
  return {
    company_name: data.companyName,
    company_url: data.companyUrl,
    position: data.position,
    status: data.status,
    employment_type: data.employmentType,
    application_method: data.applicationMethod,
    job_description_file: data.jobDescriptionFile,
    offer_file: data.offerFile,
    posted_salary_min: data.postedSalary?.minAnnualSalary,
    posted_salary_max: data.postedSalary?.maxAnnualSalary,
    posted_salary_notes: data.postedSalary?.notes,
    desired_salary:
      typeof data.desiredSalary === 'string'
        ? parseFloat(data.desiredSalary) || undefined
        : data.desiredSalary,
    offer_salary: data.offerSalary,
    tags: data.tags,
    notes: data.notes,
    schedule: data.schedule,
  };
}

/**
 * 將資料庫記錄轉換為 Resume 型別
 * 注意: 這裡需要根據實際的資料庫結構來實作
 */
export function transformResumeFromDB(row: unknown): Resume {
  // TODO: 實作 Resume 轉換邏輯
  // 目前先回傳型別斷言，實際應該根據資料庫結構轉換
  return row as Resume;
}

/**
 * 將 ResumeFormData 轉換為資料庫格式
 */
export function transformResumeToDB(data: ResumeFormData): Partial<unknown> {
  // TODO: 實作 Resume 轉換邏輯
  return data as Partial<unknown>;
}

