# Modal Components

簡化後的模態框系統，專注於清晰和可維護性。

## 架構概覽

```
components/modals/
├── Modal.tsx                     # 統一的基礎 Modal 組件
├── ApplicationModal.tsx          # 應募情報編輯模態框
├── ApplicationDetailModal.tsx    # 應募情報詳細表示（只讀）
├── CareerModal.tsx               # 職務經歴模態框
└── index.ts                      # 統一導出
```

## 設計原則

1. **統一性**: 所有模態框使用相同的 `Modal` 基礎組件
2. **簡潔性**: 直接使用表單組件，避免過度抽象
3. **直觀性**: 表單邏輯清晰，易於理解和維護

## 組件說明

### Modal.tsx
統一的模態框基礎組件，提供：
- 標準的開啟/關閉動畫 (Headless UI Transition)
- 統一的 header 樣式和關閉按鈕
- 可自訂寬度 (`maxWidth` prop)
- 自動滾動和最大高度限制

```typescript
<Modal 
  isOpen={isOpen} 
  onClose={onClose} 
  title="標題"
  maxWidth="max-w-4xl" // 可選
>
  {children}
</Modal>
```

### ApplicationModal.tsx
應募情報的新增/編輯模態框。

**功能:**
- 基本情報 (公司名、職種、狀態等)
- 應募方法 (求職網站、Headhunter 等)
- 日程管理 (下次活動、面試方法)
- 標籤和筆記

**使用方式:**
```typescript
<ApplicationModal
  isOpen={isModalOpen}
  application={editingApplication} // null 表示新增
  onClose={handleClose}
  onSave={handleSave}
/>
```

### ApplicationDetailModal.tsx
應募情報的詳細表示模態框（只讀模式）。

**功能:**
- 美觀的只讀展示介面
- 顯示所有應募相關資訊
- 快速編輯按鈕（切換到編輯模式）
- 提升用戶體驗，讓用戶可以清楚查看已填寫的資訊

**使用方式:**
```typescript
<ApplicationDetailModal
  isOpen={isDetailModalOpen}
  application={selectedApplication}
  onClose={handleClose}
  onEdit={() => {
    // 關閉詳情模態框，打開編輯模態框
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  }}
/>
```

**設計特點:**
- 使用圖示和區塊分隔，提高可讀性
- 條件式顯示，只顯示有值的欄位
- 外部連結可點擊
- Badge 和標籤視覺化顯示
- 日期自動格式化為本地時間

### CareerModal.tsx
職務經歴的新增/編輯模態框。

**功能:**
- 基本情報 (公司名、職種、在職期間)
- Offer 薪資情報
- 薪資變動履歴

**使用方式:**
```typescript
<CareerModal
  isOpen={isModalOpen}
  career={editingCareer} // null 表示新增
  onClose={handleClose}
  onSave={(data, salaryHistory, offerSalary) => {
    // 處理保存邏輯
  }}
/>
```

## 表單組件使用

所有模態框直接使用 `@/components/forms` 中的組件：

- `FormField` - 一般輸入欄位
- `FormSelect` - 下拉選單
- `FormTextarea` - 多行文字輸入
- `FormTags` - 標籤輸入
- `ApplicationMethodInput` - 應募方法專用
- `InterviewMethodInput` - 面試方法專用
- `CareerDateRangeInput` - 在職期間專用
- `CurrencySelect` - 貨幣選擇
- `SalaryBreakdownInput` - 薪資明細

## 狀態管理模式

每個模態框遵循統一的狀態管理模式：

```typescript
const [formData, setFormData] = useState<FormDataType>(initialData);
const [errors, setErrors] = useState<Record<string, string>>({});
const [loading, setLoading] = useState(false);

// 標準的 change handler
const handleChange = (e: React.ChangeEvent<...>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // 清除錯誤
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }
};

// 標準的 submit handler
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) return;
  
  try {
    onSave(formData);
    handleClose();
  } catch (error) {
    console.error("保存エラー:", error);
  } finally {
    setLoading(false);
  }
};
```

## 遷移指南

如果你的代碼還在使用舊的組件：

| 舊組件 | 新組件 | 改動 |
|--------|--------|------|
| `ApplicationEditModal` | `ApplicationModal` | 移除 `applicationId` prop，使用 `application` prop 判斷新增/編輯 |
| `CareerEditModal` | `CareerModal` | 移除 `careerId` prop，使用 `career` prop 判斷新增/編輯 |
| `ApplicationModalConfig` | `ApplicationModal` | 直接使用，無需配置 |
| `CareerModalConfig` | `CareerModal` | 直接使用，無需配置 |

### 範例: 更新 CareerEditModal

**之前:**
```typescript
<CareerEditModal
  isOpen={isModalOpen}
  careerId={editingCareerId}
  career={editingCareer}
  onClose={handleClose}
  onSave={(id, data, salary, offer) => { ... }}
/>
```

**之後:**
```typescript
<CareerModal
  isOpen={isModalOpen}
  career={editingCareer}
  onClose={handleClose}
  onSave={(data, salary, offer) => {
    // id 判斷邏輯移到這裡
    if (editingCareerId) {
      // 更新
    } else {
      // 新增
    }
  }}
/>
```

## 優點

### 之前的問題
- 過多的配置文件和抽象層
- 重複的模態框組件 (Modal / EditModal / Config)
- 表單邏輯分散在多個文件
- 難以追蹤和維護

### 重構後的優勢
- ✅ 單一真相來源：每個模態框一個文件
- ✅ 清晰的表單邏輯：所有邏輯在同一個組件
- ✅ 更容易除錯：不需要跨多個文件追蹤
- ✅ 更快的開發：直接修改組件即可
- ✅ 更好的可讀性：代碼結構清晰易懂

## 未來擴展

如果需要新增模態框：

1. 創建新的模態框組件 (例如: `SideJobModal.tsx`)
2. 使用 `Modal` 作為基礎組件
3. 直接使用 `@/components/forms` 中的表單組件
4. 遵循現有的狀態管理模式

**不要**創建額外的配置文件或抽象層，除非有明確的重複代碼需要提取。

