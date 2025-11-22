# Storage Policy 常見錯誤

> 為什麼設定成 default (public) 還是報錯？

---

## 🚨 錯誤 1: Target roles 選成 `public` (最常見)

### 症狀

從 Dashboard 看到：
- Policy name: `allow_public_insrt` 或類似名稱
- Target roles: `public` 或 `Defaults to all (public) roles if none selected`

### 為什麼會失敗？

**Supabase 的 Role 系統**:
- `public`: **未登入的訪客** (anonymous users)
- `authenticated`: **已登入的用戶** (logged-in users)

**你的應用程式**:
- 使用 `createBrowserClient()` 建立 Supabase client
- 用戶必須**登入**才能上傳照片
- 登入後的用戶屬於 `authenticated` role

**問題**:
- Policy 設成 `public` → 只允許**未登入訪客**上傳
- 但你的用戶是**已登入**的 → 屬於 `authenticated` role
- 結果: 403 Unauthorized！

### 修正方法

1. **刪除**現有的 `public` INSERT policy
2. **重新建立**，Target roles 選擇 `authenticated`
3. 確認顯示的是 `authenticated`，不是 `public`

---

## 🚨 錯誤 2: WITH CHECK 表達式不完整

### 症狀

WITH CHECK expression 只有：
```sql
bucket_id = 'resume_image'
```

缺少路徑檢查：
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

### 為什麼會不穩定？

**沒有路徑檢查的問題**:
- 任何認證用戶都可以上傳到**任何路徑**
- 例如: 用戶 A 可以上傳到 `user_b/profile.jpg`
- 在某些情況下 Supabase 會拒絕，某些情況下會通過
- 導致上傳時好時壞

**有路徑檢查的好處**:
- 用戶只能上傳到 `{自己的_user_id}/...`
- 確保安全性
- 上傳穩定

### 修正方法

編輯 Policy，WITH CHECK expression 改為：
```sql
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

---

## 🚨 錯誤 3: 使用 SQL 建立 Policy

### 症狀

在 SQL Editor 執行：
```sql
CREATE POLICY "..." ON storage.objects FOR INSERT ...
```

Policy 建立成功，但上傳仍失敗。

### 為什麼會失敗？

**Supabase Cloud 限制**:
- Storage policies **不能**用 SQL 建立
- 必須透過 **Dashboard UI** 建立
- SQL 建立的 policy 可能不會正確生效

### 修正方法

1. 刪除 SQL 建立的 policy
2. 使用 Dashboard UI 重新建立
3. 參考 `supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md`

---

## 🚨 錯誤 4: Policy 名稱衝突

### 症狀

建立 Policy 時出現錯誤：
```
policy "xxx" already exists
```

### 為什麼會失敗？

- 舊的 policy 沒有完全刪除
- Policy 名稱重複

### 修正方法

1. 檢查所有 policies
2. 刪除重複的 policy
3. 使用不同的名稱重新建立

---

## ✅ 正確設定檢查清單

建立 INSERT policy 時，確認：

- [ ] **Policy name**: 使用描述性名稱 (例如: `Authenticated users can upload to resume_image`)
- [ ] **Operation**: 選擇 `INSERT`
- [ ] **Target roles**: ✅ 選擇 `authenticated` (不是 `public`)
- [ ] **WITH CHECK expression**: 
  ```sql
  bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- [ ] **建立方式**: 使用 Dashboard UI (不是 SQL)

---

## 🔍 如何確認設定正確？

### 方法 1: 檢查 Dashboard

進入 **Storage** → **Policies** → `resume_image`:

應該看到：
- Policy name: `Authenticated users can upload to resume_image`
- Operation: `INSERT`
- Target roles: `authenticated` ← **關鍵！**

### 方法 2: 檢查 SQL

在 SQL Editor 執行：
```sql
SELECT 
  policyname,
  cmd AS operation,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND cmd = 'INSERT'
  AND policyname LIKE '%resume_image%';
```

**預期結果**:
- `roles` 應該是 `{authenticated}` (不是 `{public}`)
- `with_check` 應該包含路徑檢查

---

## 🧪 測試步驟

設定完成後：

1. **清除瀏覽器快取** (Ctrl+Shift+Delete)
2. **重新登入**應用程式
3. **進入** `/dashboard/resume/edit`
4. **上傳照片**
5. **檢查 Console** (F12)

**預期結果**:
- ✅ Console 顯示: `[Storage] Upload successful: {user_id}/profile.{ext}`
- ✅ 沒有 403 錯誤
- ✅ 照片成功上傳到 Storage

---

## 🔗 相關文件

- [Storage Policy 正確設定步驟](./storage-policy-fix-step-by-step.md)
- [Storage UI 操作指南](../supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md)
- [Storage 上傳除錯指南](./storage-upload-debug-guide.md)

---

**最後更新**: 2025-01-XX

