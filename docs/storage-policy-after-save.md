# Storage Policy 儲存後的檢查步驟

> Policy 儲存後還是 403？按照以下步驟檢查

---

## ✅ 步驟 1: 確認 Policy 已儲存

從你的截圖看到 Review modal，確認：

1. **點擊 "Save policy"** 按鈕
2. 等待儲存完成（通常會顯示成功訊息）
3. 回到 **Storage > Policies** 頁面
4. 確認 policy 出現在列表中

---

## 🔍 步驟 2: 檢查實際建立的 Policy

在 Supabase Dashboard → SQL Editor 執行：

```sql
-- 檢查 INSERT policy 的詳細資訊
SELECT 
  policyname,
  cmd AS operation,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND cmd = 'INSERT'
  AND (
    policyname LIKE '%resume_image%'
    OR policyname LIKE '%upload%'
  )
ORDER BY policyname;
```

**預期結果**:
- 應該看到 1 個 INSERT policy
- `roles` 應該是 `{authenticated}` (不是 `{public}`)
- `with_check` 應該包含路徑檢查

---

## 🚨 步驟 3: 檢查是否有衝突的 Policies

執行：

```sql
-- 檢查所有 resume_image 相關的 policies
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
    OR with_check LIKE '%resume_image%'
  )
ORDER BY cmd, policyname;
```

**可能發現的問題**:
- 有多個 INSERT policies（可能衝突）
- 有舊的 `public` policy 還在
- Policy 的 `roles` 不是 `{authenticated}`

---

## 🔧 步驟 4: 如果 Policy 設定正確但還是失敗

### 4.1 清除瀏覽器快取

1. 按 **Ctrl+Shift+Delete** (Windows) 或 **Cmd+Shift+Delete** (Mac)
2. 選擇清除 "Cached images and files"
3. 重新整理頁面 (F5)

### 4.2 重新登入

1. 登出應用程式
2. 清除瀏覽器 cookies
3. 重新登入
4. 再次嘗試上傳

### 4.3 檢查認證狀態

在瀏覽器 Console 執行：

```javascript
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 檢查用戶
const { data: { user }, error } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
console.log('Error:', error);

// 檢查 Session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? 'Active' : 'None');
console.log('Access Token:', session?.access_token ? 'Present' : 'Missing');
```

**預期結果**:
- `User ID`: 應該看到 UUID (例如: `acf4956d-740f-4dfd-b9da-aca3b60e61d1`)
- `Session`: 應該顯示 `Active`
- `Access Token`: 應該顯示 `Present`

---

## 🐛 常見問題

### Q1: Policy 儲存後還是 403？

**可能原因**:
1. Policy 還沒完全生效（等待幾秒）
2. 瀏覽器快取了舊的認證狀態
3. Session token 過期

**解決方案**:
- 等待 5-10 秒後重試
- 清除瀏覽器快取
- 重新登入

---

### Q2: 有多個 INSERT policies？

**問題**:
- 多個 policies 可能衝突
- Supabase 使用 OR 邏輯，但如果有 `public` policy 可能會干擾

**解決方案**:
- 刪除所有舊的 INSERT policies
- 只保留一個正確的 `authenticated` INSERT policy

---

### Q3: Policy 的 roles 顯示 `{public}` 而不是 `{authenticated}`？

**問題**:
- Policy 建立時選錯了 role
- 或舊的 policy 還在

**解決方案**:
- 刪除這個 policy
- 重新建立，確認選擇 `authenticated`

---

## 📋 完整檢查清單

Policy 儲存後，確認：

- [ ] Policy 已出現在 Storage > Policies 列表
- [ ] SQL 查詢確認 `roles` 是 `{authenticated}`
- [ ] SQL 查詢確認 `with_check` 包含路徑檢查
- [ ] 沒有其他衝突的 INSERT policies
- [ ] 清除瀏覽器快取
- [ ] 重新登入應用程式
- [ ] Console 確認認證狀態正常
- [ ] 重新嘗試上傳

---

## 🔗 相關文件

- [Storage Policy 正確設定步驟](./storage-policy-fix-step-by-step.md)
- [Storage Policy 常見錯誤](./storage-policy-common-mistakes.md)
- [Storage 上傳除錯指南](./storage-upload-debug-guide.md)

---

**最後更新**: 2025-01-XX

