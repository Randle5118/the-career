/**
 * Application 相關常數定義
 * 統一管理狀態標籤、顏色、選項等
 */

import type { ApplicationStatus, EmploymentType } from "@/types/application";

/**
 * 應募狀態標籤
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  bookmarked: "ブックマーク",
  applied: "応募済み",
  interview: "面談・面接",
  offer: "内定",
  rejected: "終了",
};

/**
 * 應募狀態顏色配置
 */
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  bookmarked: "badge-ghost",
  applied: "badge-info",
  interview: "badge-primary",
  offer: "badge-success",
  rejected: "badge-error",
};

/**
 * 應募狀態邊框顏色配置
 */
export const APPLICATION_STATUS_BORDER_COLORS: Record<ApplicationStatus, string> = {
  bookmarked: "border-l-base-300",
  applied: "border-l-info",
  interview: "border-l-warning",
  offer: "border-l-success",
  rejected: "border-l-error",
};

/**
 * 雇用形態標籤
 */
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "正社員",
  contract: "契約社員",
  temporary: "派遣社員",
  part_time: "パート・アルバイト",
  freelance: "フリーランス",
  side_job: "副業",
  dispatch: "派遣", // 保留向後相容性
};

/**
 * 應募狀態選項（用於表單）
 */
export const APPLICATION_STATUS_OPTIONS: Array<{
  value: ApplicationStatus;
  label: string;
}> = [
  { value: "bookmarked", label: APPLICATION_STATUS_LABELS.bookmarked },
  { value: "applied", label: APPLICATION_STATUS_LABELS.applied },
  { value: "interview", label: APPLICATION_STATUS_LABELS.interview },
  { value: "offer", label: APPLICATION_STATUS_LABELS.offer },
  { value: "rejected", label: APPLICATION_STATUS_LABELS.rejected },
];

/**
 * 雇用形態選項（用於表單）
 */
export const EMPLOYMENT_TYPE_OPTIONS: Array<{
  value: EmploymentType;
  label: string;
}> = [
  { value: "full_time", label: EMPLOYMENT_TYPE_LABELS.full_time },
  { value: "contract", label: EMPLOYMENT_TYPE_LABELS.contract },
  { value: "part_time", label: EMPLOYMENT_TYPE_LABELS.part_time },
  { value: "dispatch", label: EMPLOYMENT_TYPE_LABELS.dispatch },
];

