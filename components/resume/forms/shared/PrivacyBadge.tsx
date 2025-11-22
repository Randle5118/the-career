/**
 * PrivacyBadge - 隱私標記統一組件
 * 
 * 用途：統一顯示 "非公開" 標記
 * 影響範圍：所有非公開欄位
 */

import React from "react";

interface PrivacyBadgeProps {
  /** 額外的 CSS class */
  className?: string;
  /** 自定義文字（預設為 "非公開"） */
  text?: string;
}

/**
 * PrivacyBadge 組件
 * 
 * @example
 * ```tsx
 * <label>
 *   生年月日 <PrivacyBadge />
 * </label>
 * ```
 */
export function PrivacyBadge({ className = "", text = "非公開" }: PrivacyBadgeProps) {
  return (
    <span className={`badge badge-ghost badge-xs ${className}`}>
      {text}
    </span>
  );
}

