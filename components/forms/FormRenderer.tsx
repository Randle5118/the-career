import React, { useState } from "react";
import { FormConfig, FormRendererProps, FormTabConfig } from "./types";
import { FormFieldComponent } from "./FormFieldComponent";
import { TabList } from "./TabComponents";

export const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  formData,
  errors,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    config.layout === "tabs" && config.tabs ? config.tabs[0].id : ""
  );

  // 間距配置
  const getSpacingClasses = () => {
    switch (config.spacing) {
      case "compact":
        return "space-y-3";
      case "spacious":
        return "space-y-8";
      default: // comfortable
        return "space-y-6";
    }
  };

  const getFieldSpacingClasses = () => {
    switch (config.spacing) {
      case "compact":
        return "space-y-3";
      case "spacious":
        return "space-y-6";
      default: // comfortable
        return "space-y-4";
    }
  };

  // 渲染字段
  const renderFields = (fields: any[]) => {
    return (
      <div className={getFieldSpacingClasses()}>
        {fields.map((field) => (
          <FormFieldComponent
            key={field.id}
            field={field}
            value={formData[field.name]}
            error={errors[field.name]}
            onChange={(value) => onChange(field.name, value)}
            formData={formData}
          />
        ))}
      </div>
    );
  };

  // 渲染 Tab 內容
  const renderTabContent = () => {
    if (config.layout === "tabs" && config.tabs) {
      const activeTabConfig = config.tabs.find(tab => tab.id === activeTab);
      if (!activeTabConfig) return null;

      return (
        <div className="py-6">
          {renderFields(activeTabConfig.fields)}
        </div>
      );
    }

    // 單頁面模式
    if (config.fields) {
      return renderFields(config.fields);
    }

    return null;
  };

  // 渲染操作按鈕
  const renderActions = () => {
    if (!onSubmit && !onCancel) return null;

    return (
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {config.cancelText || "キャンセル"}
          </button>
        )}
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "処理中..." : (config.submitText || "保存")}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Tab 導航 */}
      {config.layout === "tabs" && config.tabs && (
        <TabList
          tabs={config.tabs.map(tab => ({
            id: tab.id,
            label: tab.label,
            description: tab.description,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-0"
        />
      )}

      {/* 表單內容 */}
      <div className={getSpacingClasses()}>
        {renderTabContent()}
      </div>

      {/* 操作按鈕 */}
      {renderActions()}
    </div>
  );
};
