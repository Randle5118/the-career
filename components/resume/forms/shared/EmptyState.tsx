/**
 * EmptyState - 空狀態統一顯示
 * 
 * 用途：統一管理列表為空時的顯示樣式
 * 影響範圍：所有列表型表單
 */

import { Plus, LucideIcon } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  /** 顯示的圖標（預設為 Plus） */
  icon?: LucideIcon;
  /** 提示訊息 */
  message: string;
  /** 操作按鈕文字 */
  actionText: string;
  /** 操作按鈕的點擊事件 */
  onAction: () => void;
  /** 額外的 CSS class */
  className?: string;
}

/**
 * EmptyState 組件
 * 
 * @example
 * ```tsx
 * {education.length === 0 && (
 *   <EmptyState
 *     message="学歴がありません"
 *     actionText="学歴を追加"
 *     onAction={handleAdd}
 *   />
 * )}
 * ```
 */
export function EmptyState({
  icon: Icon = Plus,
  message,
  actionText,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bg-base-100 border border-base-300 rounded-lg p-8 text-center ${className}`}
    >
      <Icon className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
      <p className="text-base-content/50 mb-4">{message}</p>
      <button type="button" onClick={onAction} className="btn btn-primary">
        <Plus className="w-4 h-4" />
        {actionText}
      </button>
    </div>
  );
}

