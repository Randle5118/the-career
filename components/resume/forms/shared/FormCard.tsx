/**
 * FormCard - 表單卡片統一容器
 * 
 * 用途：統一管理表單項目的卡片樣式、標題、刪除按鈕
 * 影響範圍：所有列表型表單項目
 */

import { Trash2, GripVertical } from "lucide-react";
import React from "react";

interface FormCardProps {
  /** 卡片標題（可選） */
  title?: string;
  /** 刪除按鈕的點擊事件，如果不提供則不顯示按鈕 */
  onRemove?: () => void;
  /** 子內容 */
  children: React.ReactNode;
  /** 額外的 CSS class */
  className?: string;
  /** 是否使用緊湊模式（減少 padding） */
  compact?: boolean;
  /** Header 的額外內容（顯示在標題右側，刪除按鈕左側） */
  headerExtra?: React.ReactNode;
  /** 拖拉手柄的 props (來自 dnd-kit) */
  dragHandleProps?: any;
}

/**
 * FormCard 組件
 * 
 * @example
 * ```tsx
 * <FormCard
 *   title="学歴 1"
 *   onRemove={() => handleRemove(0)}
 *   dragHandleProps={dragHandleProps}
 * >
 *   <div className="grid grid-cols-2 gap-4">
 *     <FormField ... />
 *     <FormField ... />
 *   </div>
 * </FormCard>
 * ```
 */
export function FormCard({
  title,
  onRemove,
  children,
  className = "",
  compact = false,
  headerExtra,
  dragHandleProps,
}: FormCardProps) {
  const paddingClass = compact ? "p-4" : "p-6";
  const showHeader = title || onRemove || headerExtra || dragHandleProps;

  return (
    <div
      className={`bg-base-100 border border-base-300 rounded-lg ${paddingClass} ${className}`}
    >
      {/* Header（如果有標題或刪除按鈕） */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* 拖拉手柄 */}
            {dragHandleProps && (
              <button
                type="button"
                className="btn btn-sm btn-ghost btn-circle cursor-grab touch-none text-base-content/40 hover:text-base-content"
                {...dragHandleProps}
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}
            
            {/* 左側：標題 */}
            {title && (
              <h5 className="font-medium text-base-content">{title}</h5>
            )}
          </div>

          {/* 右側：額外內容 + 刪除按鈕 */}
          <div className="flex items-center gap-2 ml-auto">
            {headerExtra}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="btn btn-sm btn-ghost btn-circle text-error"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 內容 */}
      {children}
    </div>
  );
}

