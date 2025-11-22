/**
 * FormSection - 表單區塊統一容器
 * 
 * 用途：統一管理表單區塊的 Header、新增按鈕、Badge 等
 * 影響範圍：Resume 表單、Modal 表單
 */

import { Plus } from "lucide-react";
import React from "react";

interface FormSectionProps {
  /** 區塊標題 */
  title: string;
  /** 是否顯示 "非公開" badge */
  showPrivacyBadge?: boolean;
  /** 新增按鈕的點擊事件，如果不提供則不顯示按鈕 */
  onAdd?: () => void;
  /** 新增按鈕的文字，預設為 "追加" */
  addButtonText?: string;
  /** 額外的自定義按鈕（顯示在新增按鈕旁邊） */
  extraActions?: React.ReactNode;
  /** 子內容 */
  children: React.ReactNode;
  /** 額外的 CSS class */
  className?: string;
}

/**
 * FormSection 組件
 * 
 * @example
 * ```tsx
 * <FormSection
 *   title="学歴"
 *   onAdd={handleAdd}
 *   addButtonText="学歴を追加"
 * >
 *   {education.map((edu, index) => (
 *     <FormCard key={index} onRemove={() => handleRemove(index)}>
 *       // 內容
 *     </FormCard>
 *   ))}
 * </FormSection>
 * ```
 */
export function FormSection({
  title,
  showPrivacyBadge = false,
  onAdd,
  addButtonText = "追加",
  extraActions,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-base-content flex items-center gap-2">
          {title}
          {showPrivacyBadge && (
            <span className="badge badge-ghost badge-xs">非公開</span>
          )}
        </h4>

        {/* 右側按鈕區 */}
        {(onAdd || extraActions) && (
          <div className="flex items-center gap-2">
            {extraActions}
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="btn btn-sm btn-primary"
              >
                <Plus className="w-4 h-4" />
                {addButtonText}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 內容 */}
      {children}
    </div>
  );
}

