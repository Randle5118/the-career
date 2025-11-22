/**
 * TabNavigation - 統一的 Tab 導航組件
 * 
 * 用途：提供一致的 Tab 切換 UI
 * 影響範圍：ApplicationModal, ApplicationDetailModal 等
 */

import React from "react";

export interface Tab {
  /** Tab 的唯一識別碼 */
  id: string;
  /** Tab 顯示的標籤文字 */
  label: string;
  /** 可選的圖標 */
  icon?: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
}

interface TabNavigationProps {
  /** Tab 列表 */
  tabs: Tab[];
  /** 當前啟用的 Tab 索引 */
  activeTab: number;
  /** Tab 切換的回調函數 */
  onChange: (index: number) => void;
  /** 額外的 CSS class */
  className?: string;
  /** Tab 樣式變體 */
  variant?: "default" | "pills" | "bordered";
}

/**
 * TabNavigation 組件
 * 
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'basic', label: '基本情報' },
 *   { id: 'advanced', label: '詳細設定' },
 * ];
 * 
 * <TabNavigation
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onChange={setActiveTab}
 * />
 * ```
 */
export function TabNavigation({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "default",
}: TabNavigationProps) {
  const getTabStyles = (isActive: boolean, isDisabled: boolean) => {
    if (variant === "pills") {
      return `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        isActive
          ? "bg-primary text-primary-content"
          : isDisabled
          ? "text-base-content/30 cursor-not-allowed"
          : "text-base-content/60 hover:text-base-content hover:bg-base-200"
      }`;
    }

    if (variant === "bordered") {
      return `px-4 py-3 font-medium text-sm border-2 rounded-t-lg transition-colors ${
        isActive
          ? "border-primary border-b-base-100 text-primary -mb-[2px]"
          : isDisabled
          ? "border-transparent text-base-content/30 cursor-not-allowed"
          : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
      }`;
    }

    // default variant
    return `px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
      isActive
        ? "border-primary text-primary"
        : isDisabled
        ? "border-transparent text-base-content/30 cursor-not-allowed"
        : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
    }`;
  };

  const containerStyles = {
    default: "border-b border-base-300",
    pills: "",
    bordered: "border-b-2 border-base-300",
  };

  return (
    <div className={`${containerStyles[variant]} ${className}`}>
      <div
        className={`flex ${
          variant === "pills" ? "gap-2" : "gap-4"
        }`}
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          const isDisabled = tab.disabled || false;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(index)}
              className={getTabStyles(isActive, isDisabled)}
            >
              {tab.icon && (
                <span className="inline-flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              )}
              {!tab.icon && tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * TabPanel - Tab 內容容器組件
 * 
 * 用於包裝 Tab 的內容，提供一致的間距和可訪問性
 * 
 * @example
 * ```tsx
 * <TabPanel id="basic" isActive={activeTab === 0}>
 *   <div>基本情報內容</div>
 * </TabPanel>
 * ```
 */
interface TabPanelProps {
  /** Panel 的 ID，應該與對應的 Tab ID 一致 */
  id: string;
  /** 是否為當前啟用的 Panel */
  isActive: boolean;
  /** Panel 的內容 */
  children: React.ReactNode;
  /** 額外的 CSS class */
  className?: string;
}

export function TabPanel({
  id,
  isActive,
  children,
  className = "",
}: TabPanelProps) {
  if (!isActive) return null;

  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={className}
    >
      {children}
    </div>
  );
}

