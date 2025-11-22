# Storage 上傳除錯指南

> 當上傳失敗時，如何診斷和解決問題

---

## 🔍 錯誤診斷步驟

### 步驟 1: 檢查瀏覽器 Console

開啟瀏覽器開發者工具 (F12) → Console，查看錯誤訊息：

#### 常見錯誤訊息

**1. RLS Policy 錯誤**
```
[Storage] Upload error: {
  message: "new row violates row-level security policy",
  statusCode: "403",
  error: "Unauthorized"
}
```

**解決方案**: 
- 執行 `supabase-migrations/05d_fix_storage_policies_complete.sql`
- 或參考 `docs/storage-upload-troubleshooting.md`

---

**2. 認證錯誤**
```
[Storage] Upload error: {
  message: "JWT expired" 或 "Invalid token",
  statusCode: "401",
  error: "Unauthorized"
}
```

**解決方案**:
- 重新登入應用程式
- 清除瀏覽器快取和 cookies
- 檢查 Session 是否過期

---

**3. Bucket 不存在**
```
[Storage] Upload error: {
  message: "Bucket not found",
  statusCode: "404"
}
```

**解決方案**:
- 確認 `resume_image` bucket 存在
- 進入 Supabase Dashboard → Storage → Buckets
- 確認 bucket 名稱完全正確 (小寫，底線)

---

**4. 檔案大小錯誤**
```
[Storage] Upload error: {
  message: "File too large",
  statusCode: "413"
}
```

**解決方案**:
- 確認檔案大小 ≤ 5MB
- 使用圖片壓縮功能 (已自動啟用)

---

### 步驟 2: 檢查認證狀態

在瀏覽器 Console 執行:

```javascript
// 檢查 Supabase 認證狀態
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 檢查用戶
const { data: { user }, error } = await supabase.auth.getUser();
console.log('User:', user?.id);
console.log('Error:', error);

// 檢查 Session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? 'Active' : 'None');
```

**預期結果**:
- `user.id`: 應該看到 UUID (例如: `acf4956d-740f-4dfd-b9da-aca3b60e61d1`)
- `session`: 應該顯示 `Active`

**如果沒有 user**:
- 需要重新登入
- 檢查登入流程是否正常

---

### 步驟 3: 檢查 Storage Policies

在 Supabase Dashboard → SQL Editor 執行:

```sql
-- 檢查 resume_image bucket 的 policies
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
    OR policyname LIKE '%Authenticated users can upload%'
  )
ORDER BY cmd, policyname;
```

**預期結果**: 應該看到 4 個 policies

**如果沒有結果**:
- 執行 `supabase-migrations/05d_fix_storage_policies_complete.sql`

**如果 policies 存在但上傳仍失敗**:
- 檢查 INSERT policy 的 `with_check` 表達式
- 應該包含: `bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text`

---

### 步驟 4: 測試上傳

在瀏覽器 Console 執行:

```javascript
// 建立測試檔案
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });

// 檢查認證
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  console.error('❌ 未登入');
} else {
  console.log('✅ User ID:', user.id);
  
  // 測試上傳
  const testPath = `${user.id}/test.txt`;
  const { data, error } = await supabase.storage
    .from('resume_image')
    .upload(testPath, testFile, { upsert: true });
  
  if (error) {
    console.error('❌ Upload failed:', error);
  } else {
    console.log('✅ Upload successful:', data.path);
    
    // 清理測試檔案
    await supabase.storage.from('resume_image').remove([testPath]);
  }
}
```

---

## 🐛 常見問題排查

### Q1: 為什麼 Console 顯示 "認証が必要です"？

**可能原因**:
- Session 過期
- 認證 token 無效
- 瀏覽器 cookies 被清除

**解決方案**:
1. 重新登入
2. 清除瀏覽器快取
3. 檢查 `middleware.ts` 是否正常運作

---

### Q2: 為什麼有時候成功有時候失敗？

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

### Q3: 如何確認 Storage Policies 是否正確？

執行以下 SQL:

```sql
-- 檢查 INSERT policy 的 WITH CHECK 表達式
SELECT 
  policyname,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND cmd = 'INSERT'
  AND (
    policyname LIKE '%resume_image%'
    OR policyname LIKE '%upload%'
  );
```

**正確的表達式應該包含**:
```sql
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

**如果只有**:
```sql
bucket_id = 'resume_image'
```

**這是不完整的，需要修正**。

---

## 📋 完整檢查清單

當上傳失敗時，依序檢查:

- [ ] **瀏覽器 Console** 是否有錯誤訊息？
- [ ] **認證狀態** 是否正常？(執行步驟 2)
- [ ] **Storage Policies** 是否存在？(執行步驟 3)
- [ ] **INSERT policy** 的 WITH CHECK 是否包含路徑檢查？
- [ ] **Bucket** 是否存在且為 Public？
- [ ] **檔案大小** 是否 ≤ 5MB？
- [ ] **檔案類型** 是否為圖片？
- [ ] **Session** 是否過期？(重新登入測試)

---

## 🔗 相關文件

- [Storage 上傳問題診斷](./storage-upload-issue-diagnosis.md)
- [Storage 上傳問題排查](./storage-upload-troubleshooting.md)
- [Storage Policies 完整修正 SQL](../supabase-migrations/05d_fix_storage_policies_complete.sql)
- [Storage UI 操作指南](../supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md)

---

**最後更新**: 2025-01-XX

