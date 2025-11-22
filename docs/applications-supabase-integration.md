# Applications Supabase Integration

## 概要
`useApplications` hook 已經從 mock data 改為使用 Supabase 資料庫。

## 改動內容

### 1. Hook 改動 (`libs/hooks/useApplications.ts`)

#### 資料獲取
- ✅ 使用 `createClient()` 建立 Supabase client
- ✅ 自動獲取當前登入用戶
- ✅ 從 `applications` 資料表查詢資料
- ✅ RLS 自動過濾,只顯示當前用戶的應募
- ✅ 資料欄位從 `snake_case` 轉換為 `camelCase`

#### CRUD 操作
所有操作都改為 async 函式:

```typescript
// 新增
const addApplication = async (data: ApplicationFormData) => {
  // INSERT INTO applications
  await fetchApplications(); // 重新獲取
}

// 更新
const updateApplication = async (id: string, data: ApplicationFormData) => {
  // UPDATE applications WHERE id = ?
  await fetchApplications();
}

// 刪除
const deleteApplication = async (id: string) => {
  // DELETE FROM applications WHERE id = ?
  await fetchApplications();
}

// 更新狀態
const updateApplicationStatus = async (id: string, status: ApplicationStatus) => {
  // UPDATE applications SET status = ? WHERE id = ?
  await fetchApplications();
}
```

### 2. 資料庫欄位對應

| TypeScript (camelCase) | Database (snake_case) |
|------------------------|----------------------|
| `userId` | `user_id` |
| `companyName` | `company_name` |
| `companyUrl` | `company_url` |
| `employmentType` | `employment_type` |
| `applicationMethod` | `application_method` |
| `jobDescriptionFile` | `job_description_file` |
| `offerFile` | `offer_file` |
| `postedSalary.minAnnualSalary` | `posted_salary_min` |
| `postedSalary.maxAnnualSalary` | `posted_salary_max` |
| `postedSalary.notes` | `posted_salary_notes` |
| `desiredSalary` | `desired_salary` |
| `offerSalary` | `offer_salary` (JSONB) |
| `schedule` | `schedule` (JSONB) |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

### 3. Loading 狀態
- 初始 `isLoading = true`
- 每次操作時設為 `true`
- 完成後設為 `false`

### 4. 錯誤處理
- ✅ 使用者錯誤: 顯示日文錯誤訊息
- ✅ Console 錯誤: 使用 `[functionName]` prefix 方便 debug
- ✅ Toast 通知: 成功/失敗都有提示

## 使用方式

### 基本使用 (不變)
```typescript
import { useApplications } from "@/libs/hooks/useApplications";

const {
  applications,
  filteredApplications,
  statusStats,
  addApplication,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  isLoading,
} = useApplications();
```

### 操作變更 (需要 await)
```typescript
// ❌ 舊的方式 (同步)
const handleAdd = (data) => {
  addApplication(data);
};

// ✅ 新的方式 (異步)
const handleAdd = async (data) => {
  await addApplication(data);
};
```

## 測試資料

### 建立測試資料
1. 執行 `02_create_applications_table_only.sql` 建立資料表
2. 執行 `02_insert_applications_test_data.sql` 插入測試資料

### 測試資料內容
- 7 筆應募記錄
- 涵蓋所有狀態 (bookmarked, applied, interview, offer, rejected)
- 包含不同應募方法 (job_site, referral, direct)
- 綁定到真實用戶: `acf4956d-740f-4dfd-b9da-aca3b60e61d1`

## 注意事項

### 1. 認證要求
- 使用者必須登入才能看到資料
- RLS policies 自動保護資料安全

### 2. 效能
- 使用索引優化查詢
- 按 `updated_at` 降序排列
- Composite index 支援狀態過濾

### 3. 資料驗證
- ✅ ENUM 類型確保狀態值正確
- ✅ Foreign key 確保 user_id 有效
- ✅ JSONB 欄位支援複雜結構

### 4. 實時更新
每次操作後都會 `fetchApplications()` 重新獲取最新資料。

## 未來改進

### 可選優化
1. **Realtime Subscriptions**: 監聽資料變化
   ```typescript
   supabase
     .channel('applications')
     .on('postgres_changes', { 
       event: '*', 
       schema: 'public', 
       table: 'applications' 
     }, fetchApplications)
     .subscribe();
   ```

2. **Optimistic Updates**: 先更新 UI,再同步資料庫
   ```typescript
   // 立即更新 UI
   setApplications(prev => [...prev, newApp]);
   // 背景同步
   await supabase.from('applications').insert(newApp);
   ```

3. **Pagination**: 大量資料時分頁載入
   ```typescript
   .range(0, 19) // 第一頁 20 筆
   ```

## 相關檔案

- `libs/hooks/useApplications.ts` - Hook 實作
- `types/application.ts` - TypeScript 類型定義
- `supabase-migrations/02_create_applications_table_only.sql` - 資料表結構
- `supabase-migrations/02_insert_applications_test_data.sql` - 測試資料
- `libs/supabase/client.ts` - Browser Supabase client
- `libs/supabase/server.ts` - Server Supabase client

## Migration Checklist

- [x] 建立資料表
- [x] 建立 ENUM 類型
- [x] 建立索引
- [x] 設定 RLS policies
- [x] 建立測試資料
- [x] 修改 `useApplications` hook
- [x] 測試 CRUD 操作
- [ ] 測試 RLS 安全性
- [ ] 效能測試
- [ ] 正式環境部署

## 疑難排解

### 看不到資料
1. 確認用戶已登入: `supabase.auth.getUser()`
2. 確認 RLS policies 已啟用
3. 檢查 Console 錯誤訊息

### 操作失敗
1. 檢查網路連線
2. 確認 Supabase 環境變數
3. 查看 Supabase Dashboard Logs

### 資料格式錯誤
1. 確認 JSONB 欄位格式正確
2. 檢查 ENUM 值是否合法
3. 驗證必填欄位是否提供

