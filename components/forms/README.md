# Stripe 風格表單配置系統

這是一個基於配置的統一表單系統，支援 Tab 版和無 Tab 版，採用 Stripe 風格的簡潔設計。

## 核心特性

### 🎨 Stripe 風格設計
- 簡潔的視覺設計，大量留白
- 統一的間距系統（compact, comfortable, spacious）
- 優雅的焦點狀態和過渡動畫
- 清晰的視覺層次

### 📋 配置化表單
- 通過 JSON 配置生成表單
- 支援多種字段類型
- 條件顯示邏輯
- 自定義組件支援

### 🗂️ Tab 支援
- 可選的 Tab 導航
- 清晰的 Tab 切換動畫
- Tab 描述文字支援

## 快速開始

### 1. 基礎使用

```tsx
import { FormRenderer, createFormConfig, createFieldConfig } from "@/components/forms";

const formConfig = createFormConfig("my-form", "single", {
  title: "我的表單",
  fields: [
    createFieldConfig("name", "text", "姓名", "name", {
      placeholder: "請輸入姓名",
      required: true,
    }),
    createFieldConfig("email", "email", "郵箱", "email", {
      required: true,
    }),
  ],
});

export default function MyForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  return (
    <FormRenderer
      config={formConfig}
      formData={formData}
      errors={errors}
      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
      onSubmit={() => console.log("提交:", formData)}
    />
  );
}
```

### 2. Tab 版本

```tsx
import { 
  FormRenderer, 
  createFormConfig, 
  createTabConfig, 
  createFieldConfig 
} from "@/components/forms";

const tabbedFormConfig = createFormConfig("tabbed-form", "tabs", {
  title: "多步驟表單",
  tabs: [
    createTabConfig("step1", "步驟一", [
      createFieldConfig("name", "text", "姓名", "name", { required: true }),
      createFieldConfig("email", "email", "郵箱", "email", { required: true }),
    ], "基本資訊"),
    
    createTabConfig("step2", "步驟二", [
      createFieldConfig("address", "textarea", "地址", "address"),
      createFieldConfig("phone", "text", "電話", "phone"),
    ], "聯絡資訊"),
  ],
});
```

## 字段類型

### 基礎字段
- `text` - 文字輸入
- `email` - 郵箱輸入
- `password` - 密碼輸入
- `number` - 數字輸入
- `date` - 日期選擇
- `datetime-local` - 日期時間選擇
- `url` - URL 輸入

### 進階字段
- `textarea` - 多行文字
- `select` - 下拉選擇
- `tags` - 標籤輸入
- `custom` - 自定義組件

## 配置選項

### FormConfig
```typescript
interface FormConfig {
  id: string;
  title?: string;
  description?: string;
  layout: "tabs" | "single";
  tabs?: FormTabConfig[];
  fields?: FormFieldConfig[];
  spacing?: "compact" | "comfortable" | "spacious";
  submitText?: string;
  cancelText?: string;
}
```

### FormFieldConfig
```typescript
interface FormFieldConfig {
  id: string;
  type: FormFieldType;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  customComponent?: React.ComponentType<any>;
  showWhen?: (formData: any) => boolean;
}
```

## 間距系統

### Compact (緊湊)
- 字段間距: 12px
- 表單間距: 12px
- 適合密集的表單

### Comfortable (舒適) - 預設
- 字段間距: 16px
- 表單間距: 24px
- 平衡的視覺效果

### Spacious (寬鬆)
- 字段間距: 24px
- 表單間距: 32px
- 適合重要表單

## 預設配置

### Application Form
```tsx
import { createApplicationFormConfig } from "@/components/forms";

const config = createApplicationFormConfig();
// 包含: 基本資訊、給与情報、その他、スケジュール 四個 Tab
```

### Career Form
```tsx
import { createCareerFormConfig } from "@/components/forms";

const config = createCareerFormConfig();
// 包含: 基本情報、給与情報 兩個 Tab
```

## 自定義組件

支援將現有的複雜組件集成到配置系統中：

```tsx
const customField = createFieldConfig("salary", "custom", "薪資", "salary", {
  customComponent: SalaryDetailsInput,
});
```

## 條件顯示

```tsx
const conditionalField = createFieldConfig("endDate", "date", "結束日期", "endDate", {
  showWhen: (formData) => formData.status === "past",
});
```

## 樣式自定義

所有組件都使用 Tailwind CSS，可以通過 `className` 屬性自定義樣式：

```tsx
const styledField = createFieldConfig("name", "text", "姓名", "name", {
  className: "bg-blue-50 border-blue-200",
});
```

## 最佳實踐

1. **保持配置簡潔**: 避免過度複雜的配置
2. **使用預設配置**: 優先使用 `createApplicationFormConfig` 等預設配置
3. **合理使用間距**: 根據表單重要性選擇合適的間距
4. **條件顯示**: 使用 `showWhen` 來動態顯示字段
5. **錯誤處理**: 配合 `errors` 狀態來顯示驗證錯誤

## 遷移指南

### 從舊的 ApplicationModal 遷移

```tsx
// 舊方式
<ApplicationModal 
  isOpen={isOpen}
  onClose={onClose}
  onSave={onSave}
  application={application}
/>

// 新方式
<ApplicationModalConfig 
  isOpen={isOpen}
  onClose={onClose}
  onSave={onSave}
  application={application}
/>
```

### 從舊的 CareerModal 遷移

```tsx
// 舊方式
<CareerModal 
  isOpen={isOpen}
  onClose={onClose}
  onSave={onSave}
  career={career}
/>

// 新方式
<CareerModalConfig 
  isOpen={isOpen}
  onClose={onClose}
  onSave={onSave}
  career={career}
/>
```

新版本使用配置化系統，代碼更簡潔，維護更容易。

## Career 相關組件

### OfferSalarySection
專門處理オファー給与的組件：
```tsx
<OfferSalarySection
  value={offerSalary}
  onChange={setOfferSalary}
  formData={formData}
/>
```

### SalaryHistorySection
專門處理給与履歴的組件：
```tsx
<SalaryHistorySection
  value={salaryHistory}
  onChange={setSalaryHistory}
  formData={formData}
/>
```

這些組件已經集成到 `createCareerFormConfig` 中，可以直接使用。
