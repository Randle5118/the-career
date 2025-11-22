# Storage 上傳問題診斷與解決方案

> **問題**: 照片上傳時好時壞，有時成功有時失敗 (403 Unauthorized)

---

## 🔍 問題分析

### 錯誤訊息
```
POST https://xxx.supabase.co/storage/v1/object/resume_image/{user_id}/profile.svg 400 (Bad Request)
[Storage] Upload error: {statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy'}
```

### 可能原因

1. **Storage Policies 設定不完整**
   - INSERT policy 的 WITH CHECK expression 可能有問題
   - 缺少路徑檢查 (允許用戶上傳到任何路徑)

2. **Policy 表達式錯誤**
   - 從 Dashboard 看到的表達式可能有語法錯誤
   - 例如: `1 (bucket_id = 'resume_image'::text)` 中的 `1` 可能是編輯器顯示的行號

3. **路徑格式問題**
   - 上傳路徑: `{user_id}/profile.{ext}`
   - Policy 需要檢查路徑的第一個資料夾是否等於 `auth.uid()`

---

## ✅ 解決方案

### 方案 1: 使用 SQL 腳本修正 (推薦)

執行 `supabase-migrations/05d_fix_storage_policies_complete.sql`

**這個腳本會**:
1. ✅ 刪除所有舊的 `resume_image` policies
2. ✅ 建立完整的 4 個 policies (SELECT, INSERT, UPDATE, DELETE)
3. ✅ 加入路徑檢查: `(storage.foldername(name))[1] = auth.uid()::text`
4. ✅ 確保用戶只能操作自己的資料夾

**執行步驟**:
1. 開啟 Supabase Dashboard → SQL Editor
2. 複製 `05d_fix_storage_policies_complete.sql` 的內容
3. 執行 SQL
4. 確認看到成功訊息

---

### 方案 2: 使用 Dashboard UI 手動修正

#### 步驟 1: 刪除舊的 Policies

1. 進入 **Storage** → **Policies**
2. 選擇 bucket: `resume_image`
3. 刪除所有現有的 policies (點擊 ⋮ → Delete)

#### 步驟 2: 建立新的 INSERT Policy (最重要!)

1. 點擊 **"New Policy"**
2. 選擇 **"For full customization"**
3. 填寫:

```
Policy name:
Authenticated users can upload to resume_image

Allowed operation:
☑ INSERT

Target roles:
☑ authenticated

WITH CHECK expression:
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

**⚠️ 重要**: 
- 必須包含路徑檢查: `(storage.foldername(name))[1] = auth.uid()::text`
- 這確保用戶只能上傳到自己的資料夾

#### 步驟 3: 建立其他 Policies

**SELECT Policy** (公開讀取):
```
Policy name: Public Access for resume_image
Operation: SELECT
Roles: public
USING expression: bucket_id = 'resume_image'
```

**UPDATE Policy**:
```
Policy name: Authenticated users can update in resume_image
Operation: UPDATE
Roles: authenticated
USING expression: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
WITH CHECK expression: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

**DELETE Policy**:
```
Policy name: Authenticated users can delete in resume_image
Operation: DELETE
Roles: authenticated
USING expression: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

---

## 🔍 診斷步驟

### 1. 檢查現有的 Policies

在 Supabase Dashboard → SQL Editor 執行:

```sql
-- 檢查 storage.objects 的所有 policies
SELECT 
  policyname,
  cmd AS operation,
  roles,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    policyname LIKE '%resume_image%'
    OR policyname LIKE '%allow_authenticated%'
  )
ORDER BY policyname;
```

### 2. 檢查 Bucket 設定

1. 進入 **Storage** → **Buckets**
2. 確認 `resume_image` bucket 存在
3. 確認 bucket 是 **Public** (用於公開履歷)

### 3. 測試上傳

```typescript
// 在瀏覽器 Console 執行
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 檢查認證狀態
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);

// 測試上傳
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data, error } = await supabase.storage
  .from('resume_image')
  .upload(`${user.id}/test.txt`, testFile);

console.log('Upload result:', { data, error });
```

---

## 🐛 常見問題

### Q1: 為什麼有時候成功有時候失敗?

**可能原因**:
- Policy 表達式不完整，在某些情況下會通過檢查
- 快取問題 (瀏覽器或 Supabase)
- Session 過期導致認證狀態不穩定

**解決方案**:
- 使用完整的 Policy 表達式 (包含路徑檢查)
- 清除瀏覽器快取
- 確認 Session 未過期

### Q2: WITH CHECK expression 中的 `1` 是什麼?

從圖片看到的 `1 (bucket_id = 'resume_image'::text)` 中的 `1` 可能是:
- 編輯器的行號顯示
- 或者是表達式的一部分 (但這會導致語法錯誤)

**正確的表達式應該是**:
```sql
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

### Q3: 為什麼需要路徑檢查?

**安全性考量**:
- 沒有路徑檢查: 任何認證用戶都可以上傳到任何路徑
- 有路徑檢查: 用戶只能上傳到自己的資料夾 (`{user_id}/...`)

**範例**:
```typescript
// ✅ 允許: {user_id}/profile.jpg (路徑第一層 = user_id)
// ❌ 拒絕: other_user_id/profile.jpg (路徑第一層 ≠ user_id)
```

---

## 📋 驗證清單

執行修正後，確認以下項目:

- [ ] `resume_image` bucket 存在且為 Public
- [ ] 有 4 個 Storage Policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] INSERT policy 的 WITH CHECK 包含路徑檢查
- [ ] 可以成功上傳照片
- [ ] 可以成功更新照片 (覆蓋)
- [ ] 可以成功刪除照片
- [ ] 無法上傳到其他用戶的資料夾

---

## 🔗 相關文件

- [Storage Policies 設定指南](../supabase-migrations/05_SETUP_STORAGE_POLICIES.md)
- [Storage UI 操作指南](../supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md)
- [Storage Policies SQL 腳本](../supabase-migrations/05d_fix_storage_policies_complete.sql)

---

**最後更新**: 2025-01-XX

