/**
 * 統一錯誤處理工具
 * 提供一致的錯誤處理邏輯
 */

import { toast } from "react-hot-toast";
import { APPLICATION_ERRORS, RESUME_ERRORS, USER_ERRORS, COMMON_ERRORS } from "@/constants/errors";

export interface ErrorContext {
  feature: string;
  action?: string;
  error?: unknown;
}

/**
 * 錯誤處理選項
 */
export interface ErrorHandlerOptions {
  /** 是否顯示 toast 通知 */
  showToast?: boolean;
  /** 自訂錯誤訊息 */
  customMessage?: string;
  /** 是否在開發環境顯示詳細錯誤 */
  showDetailsInDev?: boolean;
}

/**
 * 統一錯誤處理函數
 * 
 * @param error 錯誤物件
 * @param context 錯誤上下文
 * @param options 處理選項
 */
export function handleError(
  error: unknown,
  context: ErrorContext,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    customMessage,
    showDetailsInDev = true,
  } = options;

  // 取得錯誤訊息
  let errorMessage: string;
  
  if (customMessage) {
    errorMessage = customMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = COMMON_ERRORS.UNEXPECTED;
  }

  // 開發環境顯示詳細錯誤
  if (process.env.NODE_ENV === 'development' && showDetailsInDev) {
    console.error(`[${context.feature}]${context.action ? ` [${context.action}]` : ''}`, error);
  }

  // 顯示 toast 通知
  if (showToast) {
    toast.error(errorMessage);
  }

  // 可選: 發送到錯誤追蹤服務 (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   reportError(error, context);
  // }
}

/**
 * API 錯誤處理
 * 
 * @param response API 回應
 * @param context 錯誤上下文
 * @returns 是否為可處理的錯誤
 */
export async function handleApiError(
  response: Response,
  context: ErrorContext
): Promise<boolean> {
  if (response.ok) {
    return true;
  }

  let errorMessage: string;

  try {
    const errorData = await response.json();
    errorMessage = errorData.error || COMMON_ERRORS.UNEXPECTED;
  } catch {
    // 如果無法解析 JSON，使用狀態碼判斷
    switch (response.status) {
      case 401:
        errorMessage = USER_ERRORS.AUTH_REQUIRED;
        break;
      case 404:
        errorMessage = `${context.feature}が見つかりません`;
        break;
      case 500:
        errorMessage = COMMON_ERRORS.UNEXPECTED;
        break;
      default:
        errorMessage = COMMON_ERRORS.UNEXPECTED;
    }
  }

  handleError(new Error(errorMessage), context);
  return false;
}

/**
 * 根據功能取得預設錯誤訊息
 */
export function getDefaultErrorMessage(feature: string, action: string): string {
  const errorMap: Record<string, Record<string, string>> = {
    application: APPLICATION_ERRORS,
    resume: RESUME_ERRORS,
    user: USER_ERRORS,
  };

  const featureErrors = errorMap[feature];
  if (featureErrors && featureErrors[action]) {
    return featureErrors[action as keyof typeof featureErrors] as string;
  }

  return COMMON_ERRORS.UNEXPECTED;
}

