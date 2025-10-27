/**
 * Mock 數據統一管理系統
 * 
 * 用途：
 * 1. 統一管理所有 mock 數據
 * 2. 便於後端 API 開發參考
 * 3. 便於測試和開發
 * 4. 避免重複代碼
 * 
 * 每個 mock 數據代表一個未來需要處理的資料庫表
 */

// 導入所有 mock 數據
import { MOCK_CAREERS_FULL } from "./careers";
import { MOCK_APPLICATIONS_FULL } from "./applications";
import { MOCK_SIDE_JOBS, SIDE_JOBS_STATS } from "./side-jobs";
import { MOCK_RESUME } from "./resumes";

// 導出數據
export { MOCK_CAREERS_FULL } from "./careers";
export { MOCK_APPLICATIONS_FULL } from "./applications";
export { MOCK_SIDE_JOBS, SIDE_JOBS_STATS } from "./side-jobs";
export { MOCK_RESUME } from "./resumes";

// 導出類型
export type { Career } from "@/types/career";
export type { Application } from "@/types/application";
export type { Resume } from "@/types/resume";
import type { ApplicationStatus } from "@/types/application";

// 統一的數據獲取函數
export const getMockCareers = () => MOCK_CAREERS_FULL;
export const getMockApplications = () => MOCK_APPLICATIONS_FULL;
export const getMockSideJobs = () => MOCK_SIDE_JOBS;
export const getMockResume = () => MOCK_RESUME;

// 根據 ID 獲取單一數據
export const getMockCareerById = (id: string) => 
  MOCK_CAREERS_FULL.find(career => career.id === id);

export const getMockApplicationById = (id: string) => 
  MOCK_APPLICATIONS_FULL.find(app => app.id === id);

export const getMockSideJobById = (id: string) => 
  MOCK_SIDE_JOBS.find(job => job.id === id);

// 根據狀態篩選
export const getMockCareersByStatus = (status: "current" | "left") =>
  MOCK_CAREERS_FULL.filter(career => career.status === status);

export const getMockApplicationsByStatus = (status: ApplicationStatus) =>
  MOCK_APPLICATIONS_FULL.filter(app => app.status === status);

export const getMockSideJobsByStatus = (status: "current" | "left") =>
  MOCK_SIDE_JOBS.filter(job => job.status === status);

// 根據用戶 ID 篩選
export const getMockCareersByUserId = (userId: string) =>
  MOCK_CAREERS_FULL.filter(career => true); // 目前所有 mock 數據都是同一用戶

export const getMockApplicationsByUserId = (userId: string) =>
  MOCK_APPLICATIONS_FULL.filter(app => app.userId === userId);

export const getMockSideJobsByUserId = (userId: string) =>
  MOCK_SIDE_JOBS.filter(job => true); // 目前所有 mock 數據都是同一用戶

// 搜索功能
export const searchMockCareers = (query: string) =>
  MOCK_CAREERS_FULL.filter(career => 
    career.companyName.toLowerCase().includes(query.toLowerCase()) ||
    career.position.toLowerCase().includes(query.toLowerCase())
  );

export const searchMockApplications = (query: string) =>
  MOCK_APPLICATIONS_FULL.filter(app => 
    app.companyName.toLowerCase().includes(query.toLowerCase()) ||
    app.position.toLowerCase().includes(query.toLowerCase())
  );

export const searchMockSideJobs = (query: string) =>
  MOCK_SIDE_JOBS.filter(job => 
    job.companyName.toLowerCase().includes(query.toLowerCase()) ||
    job.position.toLowerCase().includes(query.toLowerCase())
  );
