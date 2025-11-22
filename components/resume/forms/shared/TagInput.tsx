/**
 * TagInput - 標籤輸入統一組件
 * 
 * 用途：統一管理 Tag 型輸入的 UI 和邏輯
 * 影響範圍：Skills, Preferences 等需要 Tag 輸入的地方
 */

import { Plus, X } from "lucide-react";
import React, { useState, KeyboardEvent } from "react";

interface TagInputProps {
  /** 標籤名稱（用於顯示） */
  label: string;
  /** 目前的標籤列表 */
  items: string[];
  /** 新增標籤的回調 */
  onAdd: (item: string) => void;
  /** 刪除標籤的回調 */
  onRemove: (index: number) => void;
  /** 輸入框的 placeholder */
  placeholder?: string;
  /** 是否為必填 */
  required?: boolean;
  /** Badge 樣式（primary, outline, ghost） */
  badgeStyle?: "primary" | "outline" | "ghost";
  /** 額外的 CSS class */
  className?: string;
  /** 隱私標記（顯示 "非公開" badge） */
  showPrivacyBadge?: boolean;
}

/**
 * TagInput 組件
 * 
 * @example
 * ```tsx
 * <TagInput
 *   label="希望職種"
 *   items={jobTypes}
 *   onAdd={(item) => setJobTypes([...jobTypes, item])}
 *   onRemove={(index) => setJobTypes(jobTypes.filter((_, i) => i !== index))}
 *   placeholder="希望職種を入力してEnter"
 *   badgeStyle="primary"
 * />
 * ```
 */
export function TagInput({
  label,
  items,
  onAdd,
  onRemove,
  placeholder = "入力してEnter",
  required = false,
  badgeStyle = "outline",
  className = "",
  showPrivacyBadge = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAdd(trimmedValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const badgeClasses = {
    primary: "badge-primary",
    outline: "badge-outline",
    ghost: "badge-ghost",
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-base-content">
        {label}
        {required && <span className="text-error ml-1">*</span>}
        {showPrivacyBadge && (
          <span className="badge badge-ghost badge-xs ml-2">非公開</span>
        )}
      </label>

      {/* Tags 顯示 */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className={`badge badge-lg ${badgeClasses[badgeStyle]} gap-2`}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-error transition-colors"
                aria-label={`削除: ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 輸入框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="input input-bordered flex-1 input-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-sm btn-primary"
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>
    </div>
  );
}

