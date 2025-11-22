/**
 * 錯誤訊息常數定義
 * 統一管理使用者友善的錯誤訊息
 */

/**
 * 應募相關錯誤訊息
 */
export const APPLICATION_ERRORS = {
  FETCH_FAILED: "応募データの取得に失敗しました",
  CREATE_FAILED: "応募の追加に失敗しました",
  UPDATE_FAILED: "応募の更新に失敗しました",
  DELETE_FAILED: "応募の削除に失敗しました",
  STATUS_UPDATE_FAILED: "ステータスの更新に失敗しました",
  VALIDATION: {
    COMPANY_NAME_REQUIRED: "会社名は必須です",
    POSITION_REQUIRED: "職種は必須です",
  },
} as const;

/**
 * 履歷相關錯誤訊息
 */
export const RESUME_ERRORS = {
  FETCH_FAILED: "履歴書の取得に失敗しました",
  CREATE_FAILED: "履歴書の作成に失敗しました",
  UPDATE_FAILED: "履歴書の更新に失敗しました",
  PUBLISH_FAILED: "履歴書の公開に失敗しました",
  NOT_FOUND: "履歴書が見つかりません",
} as const;

/**
 * 使用者相關錯誤訊息
 */
export const USER_ERRORS = {
  AUTH_REQUIRED: "認証が必要です",
  FETCH_FAILED: "ユーザー情報の取得に失敗しました",
} as const;

/**
 * 通用錯誤訊息
 */
export const COMMON_ERRORS = {
  UNEXPECTED: "予期しないエラーが発生しました",
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
  RETRY_FAILED: "操作に失敗しました。しばらくしてから再度お試しください。",
} as const;

