# Storage 上傳問題排查指南

> **問題**: 照片上傳時好時壞，403 Unauthorized 錯誤

---

## 🎯 快速解決方案

### 方法 1: 執行 SQL 腳本 (最快)

1. 開啟 Supabase Dashboard → SQL Editor
2. 執行 `supabase-migrations/05d_fix_storage_policies_complete.sql`
3. 重新測試上傳

### 方法 2: Dashboard UI 手動修正

參考 `supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md`

---

## 🔍 問題診斷

### 檢查 1: 確認 Policies 是否存在

在 SQL Editor 執行:

```sql
SELECT 
  policyname,
  cmd AS operation,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    policyname LIKE '%resume_image%'
    OR policyname LIKE '%allow_authenticated%'
  );
```

**預期結果**: 應該看到 4 個 policies

**如果沒有結果**: 表示 policies 不存在，需要建立

---

### 檢查 2: 確認 INSERT Policy 的 WITH CHECK 表達式

**正確的表達式**:
```sql
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

**錯誤的表達式** (會導致不穩定):
```sql
bucket_id = 'resume_image'  -- 缺少路徑檢查
```

**為什麼需要路徑檢查?**
- 沒有路徑檢查: 任何認證用戶都可以上傳到任何路徑
- 有路徑檢查: 用戶只能上傳到 `{user_id}/...` 路徑

---

### 檢查 3: 確認用戶認證狀態

在瀏覽器 Console 執行:

```javascript
// 檢查 Supabase client
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 檢查認證狀態
const { data: { user }, error } = await supabase.auth.getUser();
console.log('User:', user?.id);
console.log('Error:', error);
```

**預期結果**: 應該看到 user.id (UUID)

**如果沒有 user**: 表示未登入，需要先登入

---

## 🐛 常見問題

### Q1: 為什麼有時候成功有時候失敗?

**可能原因**:
1. **Policy 表達式不完整**
   - 只有 `bucket_id = 'resume_image'` 沒有路徑檢查
   - 在某些情況下會通過，某些情況下會失敗

2. **Session 過期**
   - 認證 token 過期導致 `auth.uid()` 返回 null
   - Policy 檢查失敗

3. **快取問題**
   - 瀏覽器快取了舊的認證狀態
   - Supabase 快取了舊的 policy

**解決方案**:
- ✅ 使用完整的 Policy 表達式 (包含路徑檢查)
- ✅ 清除瀏覽器快取
- ✅ 重新登入

---

### Q2: WITH CHECK expression 中的 `1` 是什麼?

從 Dashboard 看到的 `1 (bucket_id = 'resume_image'::text)` 中的 `1` 可能是:

1. **編輯器的行號顯示** (最可能)
   - Dashboard UI 顯示行號
   - 實際的 policy 表達式只有 `bucket_id = 'resume_image'::text`

2. **表達式的一部分** (會導致錯誤)
   - 如果 `1` 真的是表達式的一部分
   - 這會導致語法錯誤，上傳應該總是失敗

**如何確認**:
- 在 SQL Editor 執行檢查 queries (見上方)
- 查看 `with_check` 欄位的實際內容

---

### Q3: 為什麼需要路徑檢查?

**安全性考量**:

```typescript
// 上傳路徑格式: {user_id}/profile.{ext}
// 例如: acf4956d-740f-4dfd-b9da-aca3b60e61d1/profile.svg

// ❌ 沒有路徑檢查:
// - 用戶 A 可以上傳到用戶 B 的資料夾
// - 用戶 A 可以覆蓋用戶 B 的照片

// ✅ 有路徑檢查:
// - 用戶 A 只能上傳到 acf4956d-740f-4dfd-b9da-aca3b60e61d1/...
// - 用戶 A 無法上傳到其他用戶的資料夾
```

**Policy 表達式說明**:
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

- `storage.foldername(name)`: 將路徑分割成資料夾陣列
- `[1]`: 取得第一個資料夾 (user_id)
- `auth.uid()::text`: 當前登入用戶的 ID
- 比較: 路徑的第一層必須等於用戶 ID

---

## ✅ 完整修正步驟

### 步驟 1: 刪除舊的 Policies

在 Dashboard → Storage → Policies → resume_image:
1. 刪除所有現有的 policies
2. 或執行 SQL: `05d_fix_storage_policies_complete.sql` (會自動刪除)

### 步驟 2: 建立新的 Policies

**選項 A: 使用 SQL** (推薦)
- 執行 `05d_fix_storage_policies_complete.sql`

**選項 B: 使用 Dashboard UI**
- 參考 `05c_STORAGE_POLICIES_UI_GUIDE.md`
- **重要**: INSERT policy 的 WITH CHECK 必須包含路徑檢查

### 步驟 3: 驗證

```sql
-- 檢查 policies
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%resume_image%';
```

**預期看到**:
- `Public Access for resume_image` (SELECT)
- `Authenticated users can upload to resume_image` (INSERT) - WITH CHECK 包含路徑檢查
- `Authenticated users can update in resume_image` (UPDATE)
- `Authenticated users can delete in resume_image` (DELETE)

### 步驟 4: 測試上傳

1. 重新整理頁面 (F5)
2. 登入應用程式
3. 進入 `/dashboard/resume/edit`
4. 上傳照片
5. 檢查 Console 是否有錯誤

---

## 📋 驗證清單

修正後確認:

- [ ] `resume_image` bucket 存在且為 Public
- [ ] 有 4 個 Storage Policies
- [ ] INSERT policy 的 WITH CHECK 包含路徑檢查
- [ ] 可以成功上傳照片
- [ ] 可以成功更新照片 (覆蓋)
- [ ] 可以成功刪除照片
- [ ] 無法上傳到其他用戶的資料夾 (安全性測試)

---

## 🔗 相關文件

- [Storage Policies 完整修正 SQL](../supabase-migrations/05d_fix_storage_policies_complete.sql)
- [Storage UI 操作指南](../supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md)
- [Storage 上傳問題診斷](./storage-upload-issue-diagnosis.md)

---

**最後更新**: 2025-01-XX

