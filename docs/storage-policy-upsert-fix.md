# Storage Policy - UPSERT 問題修正

> **問題**: Policy 設定正確，但上傳時好時壞

---

## 🔍 問題根源

從你的 SQL 查詢結果看到：
- ✅ INSERT policy 存在且正確
- ❌ **UPDATE policy 不存在**

**程式碼使用 `upsert: true`**:
```typescript
.upload(filePath, file, {
  upsert: true, // 覆蓋舊照片
  ...
})
```

**這意味著**:
- **第一次上傳**（檔案不存在）→ 執行 **INSERT** → ✅ 成功（有 INSERT policy）
- **第二次上傳**（檔案已存在）→ 執行 **UPDATE** → ❌ 失敗（沒有 UPDATE policy）

**結果**: 上傳時好時壞！

---

## ✅ 解決方案: 建立 UPDATE Policy

### 步驟 1: 進入 Storage Policies

1. Supabase Dashboard → **Storage** → **Policies**
2. 選擇 bucket: `resume_image`
3. 點擊 **"New Policy"**

### 步驟 2: 建立 UPDATE Policy

```
Policy name:
Authenticated users can update in resume_image

Allowed operation:
☑ UPDATE

Target roles:
☑ authenticated  ← 重要！不是 public

USING expression:
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text

WITH CHECK expression:
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

**⚠️ 重要**:
- USING 和 WITH CHECK 都要包含路徑檢查
- Target roles 必須是 `authenticated`

### 步驟 3: 儲存並驗證

1. 點擊 **"Review"** → **"Save policy"**
2. 確認 policy 出現在列表中

---

## 🧪 測試步驟

建立 UPDATE policy 後：

1. **清除瀏覽器快取** (Ctrl+Shift+Delete)
2. **重新登入**應用程式
3. **進入** `/dashboard/resume/edit`
4. **第一次上傳照片** → 應該成功 ✅
5. **第二次上傳照片**（覆蓋）→ 現在也應該成功 ✅

---

## 📋 完整的 Policy 清單

`resume_image` bucket 需要 4 個 policies:

### 1. SELECT (讀取) - Public ✅
```
Policy name: allow_public_read ucsrm1_0
Operation: SELECT
Roles: public
USING: bucket_id = 'resume_image'
```

### 2. INSERT (上傳) - Authenticated ✅
```
Policy name: Authenticated users can upload to resume_image ucsrm1_0
Operation: INSERT
Roles: authenticated
WITH CHECK: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

### 3. UPDATE (更新) - Authenticated ⚠️ **需要建立！**
```
Policy name: Authenticated users can update in resume_image
Operation: UPDATE
Roles: authenticated
USING: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
WITH CHECK: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

### 4. DELETE (刪除) - Authenticated (可選)
```
Policy name: Authenticated users can delete in resume_image
Operation: DELETE
Roles: authenticated
USING: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

---

## 🔍 驗證 Policy 是否建立

在 SQL Editor 執行：

```sql
-- 檢查所有 resume_image 的 policies
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
    OR with_check LIKE '%resume_image%'
    OR qual LIKE '%resume_image%'
  )
ORDER BY cmd, policyname;
```

**預期結果**: 應該看到 4 個 policies (SELECT, INSERT, UPDATE, DELETE)

---

## 🔗 相關文件

- [Storage UI 操作指南](../supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md)
- [Storage Policy 正確設定步驟](./storage-policy-fix-step-by-step.md)

---

**最後更新**: 2025-01-XX

