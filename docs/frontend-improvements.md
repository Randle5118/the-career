# 前端改進建議報告

> **分析日期**: 2025-01-XX  
> **分析範圍**: 前端相關的組件、Hooks、頁面、型別定義  
> **優先級**: 🔴 高 | 🟡 中 | 🟢 低

---

## 📋 目錄

1. [型別安全問題](#型別安全問題)
2. [效能優化問題](#效能優化問題)
3. [錯誤處理問題](#錯誤處理問題)
4. [程式碼品質問題](#程式碼品質問題)
5. [使用者體驗問題](#使用者體驗問題)
6. [架構設計問題](#架構設計問題)
7. [可維護性問題](#可維護性問題)

---

## 🔴 型別安全問題

### 1. `any` 型別使用過多

**問題描述**:  
在 20 個檔案中發現 `any` 型別，違反 TypeScript 最佳實踐。

**影響檔案**:
- `components/cards/ApplicationCard.tsx` (line 21, 24)
- `app/dashboard/page.tsx` (line 40, 46, 78)
- `components/modals/ApplicationModal.tsx`
- `types/application.ts`

**具體問題**:
```typescript
// ❌ 問題範例
const formatOfferSalary = (offerSalary: any): string | null => {
  if (!offerSalary || !offerSalary.salaryBreakdown) return null;
  const total = offerSalary.salaryBreakdown.reduce((sum: number, item: any) => 
    sum + (item.salary || 0), 0
  );
  return `${total}万円`;
};
```

**建議改進**:
```typescript
// ✅ 改進後
interface OfferSalary {
  currency?: string;
  salaryBreakdown: SalaryBreakdown[];
  notes?: string;
}

const formatOfferSalary = (offerSalary: OfferSalary | undefined): string | null => {
  if (!offerSalary?.salaryBreakdown?.length) return null;
  const total = offerSalary.salaryBreakdown.reduce(
    (sum, item) => sum + (item.salary || 0), 
    0
  );
  return `${total}万円`;
};
```

**優先級**: 🔴 高  
**預估工時**: 4-6 小時

---

### 2. 型別轉換不一致

**問題描述**:  
資料庫欄位 (snake_case) 與前端型別 (camelCase) 轉換邏輯分散在各處，容易出錯。

**影響檔案**:
- `libs/hooks/useApplications.ts` (line 103-126)
- `libs/hooks/useResume.ts`
- `app/api/resumes/route.ts`

**建議改進**:
建立統一的型別轉換工具函數：

```typescript
// libs/utils/transformers.ts
export function transformApplicationFromDB(row: any): Application {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    // ... 統一轉換邏輯
  };
}

export function transformApplicationToDB(app: ApplicationFormData): any {
  return {
    company_name: app.companyName,
    // ... 統一轉換邏輯
  };
}
```

**優先級**: 🟡 中  
**預估工時**: 3-4 小時

---

## ⚡ 效能優化問題

### 3. 不必要的 Re-render

**問題描述**:  
多個組件在 props 未改變時仍會重新渲染。

**影響檔案**:
- `components/cards/ApplicationCard.tsx`
- `components/ui/KanbanView.tsx`
- `app/dashboard/page.tsx`

**具體問題**:
```typescript
// ❌ 問題範例: ApplicationCard 沒有 memo
export default function ApplicationCard({ ... }) {
  // 每次父組件更新都會重新渲染
}
```

**建議改進**:
```typescript
// ✅ 使用 React.memo
export default React.memo(function ApplicationCard({ ... }) {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.application.id === nextProps.application.id &&
         prevProps.application.updatedAt === nextProps.application.updatedAt;
});
```

**優先級**: 🟡 中  
**預估工時**: 2-3 小時

---

### 4. useEffect 依賴項問題

**問題描述**:  
`useResume.ts` 中的 `useEffect` 依賴項包含函數，可能導致無限循環。

**影響檔案**:
- `libs/hooks/useResume.ts` (line 175-178)

**具體問題**:
```typescript
// ❌ 問題範例
useEffect(() => {
  fetchResume();
  fetchPublishedResume();
}, [fetchResume, fetchPublishedResume]); // 函數依賴可能導致無限循環
```

**建議改進**:
```typescript
// ✅ 改進後: 移除函數依賴，只在 mount 時執行一次
useEffect(() => {
  fetchResume();
  fetchPublishedResume();
}, []); // 只在 mount 時執行

// 或者使用 useCallback 穩定函數引用
const fetchResume = useCallback(async () => {
  // ...
}, []); // 空依賴陣列
```

**優先級**: 🟡 中  
**預估工時**: 1-2 小時

---

### 5. 大量資料未做虛擬化

**問題描述**:  
應募列表、Kanban 看板在資料量大時可能造成效能問題。

**影響檔案**:
- `app/dashboard/applications/page.tsx`
- `components/ui/KanbanView.tsx`

**建議改進**:
考慮使用虛擬滾動 (react-window 或 @tanstack/react-virtual)：

```typescript
// ✅ 改進後: 使用虛擬滾動
import { useVirtualizer } from '@tanstack/react-virtual';

function ApplicationsList({ applications }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: applications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <ApplicationCard
          key={virtualItem.key}
          application={applications[virtualItem.index]}
        />
      ))}
    </div>
  );
}
```

**優先級**: 🟢 低 (目前資料量不大，但未來可能需要)  
**預估工時**: 4-6 小時

---

## 🛡️ 錯誤處理問題

### 6. 錯誤處理不一致

**問題描述**:  
錯誤處理邏輯分散，有些地方只 console.error，有些會 toast，不一致。

**影響檔案**:
- `libs/hooks/useApplications.ts`
- `libs/hooks/useResume.ts`
- `components/modals/ApplicationModal.tsx`

**具體問題**:
```typescript
// ❌ 問題範例: 錯誤處理不一致
catch (error) {
  console.error("保存エラー:", error); // 只有 console
  toast.error("保存に失敗しました"); // 使用者看不到詳細錯誤
}
```

**建議改進**:
建立統一的錯誤處理工具：

```typescript
// libs/utils/error-handler.ts
export function handleError(error: unknown, context: string) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : '予期しないエラーが発生しました';
  
  // 開發環境顯示詳細錯誤
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
  
  // 使用者友善的錯誤訊息
  toast.error(errorMessage);
  
  // 可選: 發送到錯誤追蹤服務 (Sentry, etc.)
  // reportError(error, context);
}
```

**優先級**: 🟡 中  
**預估工時**: 2-3 小時

---

### 7. 網路請求未做 Retry 機制

**問題描述**:  
API 請求失敗時沒有自動重試機制，使用者體驗不佳。

**影響檔案**:
- `libs/hooks/useApplications.ts`
- `libs/hooks/useResume.ts`

**建議改進**:
使用 axios 或建立封裝的 fetch 函數，加入 retry 機制：

```typescript
// libs/utils/fetch-with-retry.ts
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // 只有 5xx 錯誤才重試
      if (response.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError || new Error('Request failed');
}
```

**優先級**: 🟢 低  
**預估工時**: 2-3 小時

---

## 📝 程式碼品質問題

### 8. 重複的狀態管理邏輯

**問題描述**:  
多個 Modal 組件都有類似的狀態管理邏輯（isOpen, loading, errors）。

**影響檔案**:
- `components/modals/ApplicationModal.tsx`
- `components/modals/CareerModal.tsx`
- `components/modals/PDFUploadModal.tsx`

**建議改進**:
建立通用的 Modal Hook：

```typescript
// libs/hooks/useModal.ts
export function useModal<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const open = useCallback((initialData?: T) => {
    setData(initialData || null);
    setIsOpen(true);
    setErrors({});
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    setErrors({});
    setLoading(false);
  }, []);
  
  return {
    isOpen,
    data,
    loading,
    errors,
    setLoading,
    setErrors,
    open,
    close,
  };
}
```

**優先級**: 🟡 中  
**預估工時**: 2-3 小時

---

### 9. 表單驗證邏輯分散

**問題描述**:  
表單驗證邏輯寫在組件內部，難以重用和測試。

**影響檔案**:
- `components/modals/ApplicationModal.tsx` (line 186-198)
- `components/resume/forms/*.tsx`

**建議改進**:
使用 Zod 進行統一驗證：

```typescript
// libs/validations/application.ts
import { z } from 'zod';

export const applicationSchema = z.object({
  companyName: z.string().min(1, '会社名は必須です'),
  position: z.string().min(1, '職種は必須です'),
  status: z.enum(['bookmarked', 'applied', 'interview', 'offer', 'rejected']),
  // ...
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// 在組件中使用
const validate = (data: ApplicationFormData) => {
  const result = applicationSchema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0] as string] = err.message;
      }
    });
    setErrors(errors);
    return false;
  }
  return true;
};
```

**優先級**: 🟡 中  
**預估工時**: 4-6 小時

---

### 10. 硬編碼的字串和常數

**問題描述**:  
狀態標籤、錯誤訊息等硬編碼在組件中，難以維護和國際化。

**影響檔案**:
- `components/cards/ApplicationCard.tsx` (line 36-47, 49-57)
- `app/dashboard/page.tsx` (line 12-19)
- `components/modals/ApplicationModal.tsx` (line 30-43)

**建議改進**:
建立統一的常數檔案：

```typescript
// constants/application.ts
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  bookmarked: "ブックマーク",
  applied: "応募済み",
  interview: "面談・面接",
  offer: "内定",
  rejected: "終了",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  bookmarked: "badge-ghost",
  applied: "badge-info",
  interview: "badge-primary",
  offer: "badge-success",
  rejected: "badge-error",
};

// 未來可擴展為 i18n
// import { useTranslation } from 'next-i18next';
```

**優先級**: 🟡 中  
**預估工時**: 2-3 小時

---

## 🎨 使用者體驗問題

### 11. Loading 狀態不一致

**問題描述**:  
不同頁面的 Loading 狀態顯示方式不一致，有些有 skeleton，有些只有 spinner。

**影響檔案**:
- `app/dashboard/resume/page.tsx` (line 78-84)
- `app/dashboard/applications/page.tsx`
- `app/dashboard/page.tsx`

**建議改進**:
建立統一的 Loading 組件：

```typescript
// components/ui/LoadingState.tsx
export function LoadingState({ 
  variant = 'spinner',
  message = '読み込み中...' 
}: {
  variant?: 'spinner' | 'skeleton' | 'dots';
  message?: string;
}) {
  if (variant === 'skeleton') {
    return <SkeletonLoader />;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className={`loading loading-${variant} loading-lg`}></div>
      <p className="mt-4 text-base-content/60">{message}</p>
    </div>
  );
}
```

**優先級**: 🟢 低  
**預估工時**: 1-2 小時

---

### 12. 表單提交未防止重複提交

**問題描述**:  
表單提交時沒有防止使用者快速點擊造成重複提交。

**影響檔案**:
- `components/modals/ApplicationModal.tsx` (line 200-217)
- `components/modals/CareerModal.tsx`

**具體問題**:
```typescript
// ❌ 問題範例: 雖然有 loading 狀態，但按鈕可能還是可以點擊
<button type="submit" disabled={loading}>
  {loading ? <span className="loading..." /> : "保存"}
</button>
```

**建議改進**:
確保 disabled 狀態正確，並加入防抖：

```typescript
// ✅ 改進後
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (isSubmitting) return; // 防止重複提交
  
  setIsSubmitting(true);
  try {
    await onSave(formData);
    handleClose();
  } finally {
    setIsSubmitting(false);
  }
};

// 按鈕
<button 
  type="submit" 
  disabled={loading || isSubmitting}
  className="btn btn-primary"
>
  {loading || isSubmitting ? (
    <span className="loading loading-spinner loading-xs"></span>
  ) : (
    application ? "更新" : "追加"
  )}
</button>
```

**優先級**: 🟡 中  
**預估工時**: 1 小時

---

### 13. 未優化行動裝置體驗

**問題描述**:  
部分組件在行動裝置上體驗不佳，特別是 Modal 和表單。

**影響檔案**:
- `components/modals/Modal.tsx`
- `components/modals/ApplicationModal.tsx`

**建議改進**:
優化 Modal 在行動裝置上的顯示：

```typescript
// ✅ 改進後: Modal.tsx
<Dialog.Panel className={`
  w-full ${maxWidth} 
  max-h-[90vh] 
  transform 
  overflow-y-auto 
  rounded-2xl 
  bg-base-100 
  p-0 
  text-left 
  align-middle 
  shadow-xl 
  transition-all
  ${isMobile ? 'mx-4 my-4' : ''} // 行動裝置邊距
`}>
```

**優先級**: 🟢 低  
**預估工時**: 2-3 小時

---

## 🏗️ 架構設計問題

### 14. API 呼叫邏輯分散

**問題描述**:  
API 呼叫邏輯直接寫在 Hooks 中，沒有統一的 API Client。

**影響檔案**:
- `libs/hooks/useApplications.ts` (直接使用 fetch)
- `libs/hooks/useResume.ts` (直接使用 fetch)

**建議改進**:
建立統一的 API Client：

```typescript
// libs/api/client.ts
class ApiClient {
  private baseURL = '/api';
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    
    const { data } = await response.json();
    return data;
  }
  
  async post<T>(endpoint: string, body: unknown): Promise<T> {
    // ...
  }
  
  async put<T>(endpoint: string, body: unknown): Promise<T> {
    // ...
  }
  
  async delete(endpoint: string): Promise<void> {
    // ...
  }
}

export const apiClient = new ApiClient();

// 使用
const applications = await apiClient.get<Application[]>('/applications');
```

**優先級**: 🟡 中  
**預估工時**: 3-4 小時

---

### 15. 狀態管理未使用 Context

**問題描述**:  
應用層級的狀態（如使用者資訊、主題）沒有使用 Context，可能導致 prop drilling。

**影響檔案**:
- `app/dashboard/page.tsx`
- `components/layout/DashboardNav.tsx`

**建議改進**:
建立應用層級的 Context：

```typescript
// contexts/AppContext.tsx
interface AppContextValue {
  user: User | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <AppContext.Provider value={{ user, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}
```

**優先級**: 🟢 低 (目前 prop drilling 不嚴重)  
**預估工時**: 2-3 小時

---

## 🔧 可維護性問題

### 16. 組件檔案過大

**問題描述**:  
部分組件檔案過大，職責不清，難以維護。

**影響檔案**:
- `components/modals/ApplicationModal.tsx` (469 行)
- `components/cards/ApplicationCard.tsx` (420 行)
- `app/dashboard/page.tsx` (652 行)

**建議改進**:
拆分組件：

```typescript
// ApplicationModal.tsx (主組件)
export default function ApplicationModal({ ... }) {
  return (
    <Modal>
      <ApplicationModalTabs>
        <ApplicationBasicInfoTab />
        <ApplicationMethodTab />
        <ApplicationSalaryTab />
        <ApplicationScheduleTab />
      </ApplicationModalTabs>
    </Modal>
  );
}

// ApplicationBasicInfoTab.tsx (子組件)
export function ApplicationBasicInfoTab({ formData, onChange, errors }) {
  // ...
}
```

**優先級**: 🟡 中  
**預估工時**: 4-6 小時

---

### 17. 缺少單元測試

**問題描述**:  
專案中沒有看到測試檔案，缺乏程式碼品質保障。

**建議改進**:
建立測試基礎設施：

```typescript
// __tests__/hooks/useApplications.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useApplications } from '@/libs/hooks/useApplications';

describe('useApplications', () => {
  it('should fetch applications on mount', async () => {
    const { result } = renderHook(() => useApplications());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.applications).toBeDefined();
  });
});
```

**優先級**: 🟡 中  
**預估工時**: 8-12 小時 (建立測試基礎設施)

---

### 18. 缺少 Storybook 文檔

**問題描述**:  
組件沒有 Storybook 文檔，難以展示和測試組件。

**建議改進**:
建立 Storybook：

```typescript
// components/cards/ApplicationCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ApplicationCard from './ApplicationCard';

const meta: Meta<typeof ApplicationCard> = {
  title: 'Cards/ApplicationCard',
  component: ApplicationCard,
};

export default meta;
type Story = StoryObj<typeof ApplicationCard>;

export const Default: Story = {
  args: {
    application: {
      id: '1',
      companyName: '株式会社サンプル',
      // ...
    },
  },
};
```

**優先級**: 🟢 低  
**預估工時**: 4-6 小時

---

## 📊 優先級總結

### 🔴 高優先級 (立即處理)
1. **型別安全問題** - `any` 型別使用過多
   - 影響: 型別安全、開發體驗
   - 工時: 4-6 小時

### 🟡 中優先級 (近期處理)
2. **型別轉換不一致** - 統一轉換邏輯
3. **不必要的 Re-render** - 使用 React.memo
4. **useEffect 依賴項問題** - 修正依賴項
5. **錯誤處理不一致** - 統一錯誤處理
6. **重複的狀態管理邏輯** - 建立通用 Hooks
7. **表單驗證邏輯分散** - 使用 Zod
8. **硬編碼的字串和常數** - 統一常數檔案
9. **表單提交未防止重複提交** - 加入防抖
10. **API 呼叫邏輯分散** - 建立統一 API Client
11. **組件檔案過大** - 拆分組件

### 🟢 低優先級 (未來優化)
12. **大量資料未做虛擬化** - 使用虛擬滾動
13. **網路請求未做 Retry 機制** - 加入 retry
14. **Loading 狀態不一致** - 統一 Loading 組件
15. **未優化行動裝置體驗** - 響應式優化
16. **狀態管理未使用 Context** - 建立 Context
17. **缺少單元測試** - 建立測試基礎設施
18. **缺少 Storybook 文檔** - 建立 Storybook

---

## 🎯 建議執行順序

### Phase 1: 基礎品質提升 (1-2 週)
1. 修正型別安全問題 (`any` → 正確型別)
2. 統一錯誤處理
3. 修正 useEffect 依賴項問題
4. 防止表單重複提交

### Phase 2: 程式碼重構 (2-3 週)
5. 建立統一 API Client
6. 統一型別轉換邏輯
7. 使用 Zod 進行表單驗證
8. 建立通用 Modal Hook
9. 統一常數檔案

### Phase 3: 效能優化 (1-2 週)
10. 使用 React.memo 優化 Re-render
11. 拆分過大組件
12. 優化行動裝置體驗

### Phase 4: 長期優化 (持續)
13. 建立測試基礎設施
14. 建立 Storybook
15. 加入虛擬滾動 (如需要)
16. 加入 Retry 機制

---

## 📝 備註

- 所有改進建議都應該在實作前先建立 Issue 和 PR
- 建議使用 Feature Flag 來控制新功能的發布
- 每次改進後都應該進行 Code Review
- 建議建立 Coding Guidelines 文檔來避免未來出現類似問題

