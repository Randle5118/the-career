// 基礎表單組件
export { FormField } from "./FormField";
export { FormSelect } from "./FormSelect";
export { FormTextarea } from "./FormTextarea";
export { FormTags } from "./FormTags";

// 專門表單組件
export { CurrencySelect } from "./CurrencySelect";
export { SalaryBreakdownInput } from "./SalaryBreakdownInput";
export { MonthYearInput } from "./MonthYearInput";
export { CareerDateRangeInput } from "./CareerDateRangeInput";

// Application 相關組件
export { ApplicationMethodInput } from "./ApplicationMethodInput";
export { InterviewMethodInput } from "./InterviewMethodInput";
export { SalaryDetailsInput } from "./SalaryDetailsInput";

// Career 相關組件
export { OfferSalarySection } from "./OfferSalarySection";
export { SalaryHistorySection } from "./SalaryHistorySection";

// 新的配置化表單系統
export { FormRenderer } from "./FormRenderer";
export { FormFieldComponent } from "./FormFieldComponent";
export { Tab, TabList } from "./TabComponents";
export { 
  createFieldConfig, 
  createTabConfig, 
  createFormConfig,
  createApplicationFormConfig,
  createCareerFormConfig 
} from "./configGenerators";

// 類型導出
export type { FormFieldProps } from "./FormField";
export type { SelectOption, FormSelectProps } from "./FormSelect";
export type { FormTextareaProps } from "./FormTextarea";
export type { FormTagsProps } from "./FormTags";
export type { CurrencySelectProps } from "./CurrencySelect";
export type { SalaryBreakdownInputProps } from "./SalaryBreakdownInput";
export type { MonthYearInputProps } from "./MonthYearInput";
export type { CareerDateRangeInputProps } from "./CareerDateRangeInput";

// 新的配置系統類型
export type {
  FormFieldType,
  FormFieldConfig,
  FormTabConfig,
  FormConfig,
  FormRendererProps,
  FormFieldComponentProps,
} from "./types";
