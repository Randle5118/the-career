import React from "react";

// 基礎表單字段類型
export type FormFieldType = 
  | "text" 
  | "email" 
  | "password" 
  | "number" 
  | "date" 
  | "datetime-local"
  | "url"
  | "textarea"
  | "select"
  | "tags"
  | "custom";

// 表單字段配置
export interface FormFieldConfig {
  id: string;
  type: FormFieldType;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  
  // 字段特定配置
  options?: Array<{ value: string; label: string }>; // for select
  min?: number; // for number
  max?: number; // for number
  step?: number; // for number
  rows?: number; // for textarea
  
  // 自定義組件
  customComponent?: React.ComponentType<any>;
  
  // 條件顯示
  showWhen?: (formData: any) => boolean;
}

// Tab 配置
export interface FormTabConfig {
  id: string;
  label: string;
  description?: string;
  fields: FormFieldConfig[];
}

// 表單配置
export interface FormConfig {
  id: string;
  title?: string;
  description?: string;
  layout: "tabs" | "single";
  tabs?: FormTabConfig[];
  fields?: FormFieldConfig[]; // 當 layout 為 "single" 時使用
  spacing?: "compact" | "comfortable" | "spacious";
  submitText?: string;
  cancelText?: string;
}

// 表單渲染器 Props
export interface FormRendererProps {
  config: FormConfig;
  formData: any;
  errors: Record<string, string>;
  onChange: (name: string, value: any) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

// 表單字段組件 Props
export interface FormFieldComponentProps {
  field: FormFieldConfig;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  formData: any;
}
