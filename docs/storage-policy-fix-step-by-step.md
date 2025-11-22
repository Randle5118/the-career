# Storage Policy 正確設定步驟 (圖解版)

> ⚠️ **重要**: Target roles 必須選擇 `authenticated`，**不是** `public` (default)

---

## 🎯 問題診斷

從你的截圖看到：
- ❌ **Target roles**: `Defaults to all (public) roles if none selected` ← **這是問題！**
- ❌ **WITH CHECK expression**: 只有 `bucket_id = 'resume_image'`，缺少路徑檢查

**為什麼會失敗？**
- `public` role 代表**未登入的訪客**
- 你的應用程式使用**認證用戶** (`authenticated`) 上傳
- Policy 設成 `public` 會拒絕認證用戶的上傳！

---

## ✅ 正確設定步驟

### 步驟 1: 刪除舊的 Policy

1. 進入 **Storage** → **Policies**
2. 選擇 bucket: `resume_image`
3. 找到 `allow_public_insrt ucsrm1_0` (或類似的 policy)
4. 點擊右側的 **⋮** → **Delete**
5. 確認刪除

---

### 步驟 2: 建立新的 INSERT Policy

1. 點擊 **"New Policy"** 按鈕
2. 選擇 **"For full customization"** (或 "Create a policy from scratch")

#### 填寫以下內容：

**Policy name:**
```
Authenticated users can upload to resume_image
```

**Allowed operation:**
```
☑ INSERT
```

**Target roles:** ⚠️ **最重要！**
```
點擊下拉選單，選擇: ☑ authenticated
```

**⚠️ 不要選擇 `public`！**

**WITH CHECK expression:**
```sql
bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

**完整表達式說明**:
- `bucket_id = 'resume_image'`: 限制只能上傳到 `resume_image` bucket
- `(storage.foldername(name))[1] = auth.uid()::text`: 限制只能上傳到自己的資料夾

4. 點擊 **"Review"** → **"Save policy"**

---

### 步驟 3: 驗證設定

完成後，在 **Storage > Policies** 頁面應該看到：

| Policy Name | Operation | Target Roles | WITH CHECK |
|------------|-----------|--------------|------------|
| Authenticated users can upload to resume_image | INSERT | **authenticated** | `bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text` |

**關鍵檢查點**:
- ✅ Target roles 顯示 `authenticated` (不是 `public`)
- ✅ WITH CHECK 包含路徑檢查

---

## 🔍 常見錯誤

### ❌ 錯誤 1: Target roles 選成 `public`

**症狀**: 
- Policy 名稱顯示 `allow_public_insrt`
- Target roles 顯示 `public` 或 `Defaults to all (public) roles`

**結果**: 
- 認證用戶無法上傳 (403 Unauthorized)
- 只有未登入的訪客可以上傳 (但他們沒有認證 token，所以還是會失敗)

**修正**: 
- 刪除這個 policy
- 重新建立，Target roles 選擇 `authenticated`

---

### ❌ 錯誤 2: WITH CHECK 表達式不完整

**症狀**:
- WITH CHECK 只有 `bucket_id = 'resume_image'`
- 缺少 `(storage.foldername(name))[1] = auth.uid()::text`

**結果**:
- 上傳時好時壞
- 安全性問題 (用戶可以上傳到其他用戶的資料夾)

**修正**:
- 編輯 policy，加入路徑檢查
- 或刪除重建

---

### ❌ 錯誤 3: 使用 SQL 建立 Policy

**症狀**:
- 在 SQL Editor 執行 `CREATE POLICY` 語句
- Policy 建立成功但上傳仍失敗

**原因**:
- Supabase Cloud **不支援**用 SQL 建立 Storage policies
- 必須透過 Dashboard UI 建立

**修正**:
- 刪除 SQL 建立的 policy
- 使用 Dashboard UI 重新建立

---

## 🧪 測試步驟

設定完成後：

1. **重新整理頁面** (F5)
2. **確認已登入** (檢查右上角是否有用戶頭像)
3. **進入** `/dashboard/resume/edit`
4. **上傳照片**
5. **檢查 Console** (F12) 是否有錯誤

**預期結果**:
- ✅ 上傳成功
- ✅ Console 顯示: `[Storage] Upload successful: {user_id}/profile.{ext}`
- ✅ 照片顯示在 Storage > Files > resume_image > {user_id}

---

## 📋 完整 Policy 清單

`resume_image` bucket 需要 4 個 policies:

### 1. SELECT (讀取) - Public
```
Policy name: Public Access for resume_image
Operation: SELECT
Target roles: public
USING: bucket_id = 'resume_image'
```

### 2. INSERT (上傳) - Authenticated ⭐
```
Policy name: Authenticated users can upload to resume_image
Operation: INSERT
Target roles: authenticated  ← 重要！
WITH CHECK: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

### 3. UPDATE (更新) - Authenticated
```
Policy name: Authenticated users can update in resume_image
Operation: UPDATE
Target roles: authenticated
USING: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
WITH CHECK: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

### 4. DELETE (刪除) - Authenticated
```
Policy name: Authenticated users can delete in resume_image
Operation: DELETE
Target roles: authenticated
USING: bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text
```

---

## 🔗 相關文件

- [Storage UI 操作指南](../supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md)
- [Storage 上傳除錯指南](./storage-upload-debug-guide.md)
- [Storage 上傳問題排查](./storage-upload-troubleshooting.md)

---

**最後更新**: 2025-01-XX

