# 🚨 Storage 權限問題快速修復

## 錯誤訊息
```
Error: アップロード権限がありません。Storage Policiesを確認してください。
```

## 問題原因
`resume_image` bucket 沒有正確的 Storage Policies,導致無法上傳檔案。

---

## ✅ 快速修復步驟

### 1. 進入 Supabase Dashboard

1. 開啟 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案: `the-career-dev`
3. 左側選單點擊 **Storage**
4. 上方切換到 **Policies** Tab
5. 在 Bucket 下拉選單選擇: **`resume_image`**

---

### 2. 建立 INSERT Policy (上傳權限) ⭐ 最重要!

點擊 **"New Policy"** 按鈕,填寫:

#### Policy 設定
```
Policy name: allow_authenticated_uploads

Allowed operation:
☑️ INSERT

Target roles:
☑️ authenticated

WITH CHECK expression:
bucket_id = 'resume_image'
```

#### 點擊 "Save policy"

---

### 3. 建立 SELECT Policy (讀取權限)

再次點擊 **"New Policy"**:

```
Policy name: allow_public_read

Allowed operation:
☑️ SELECT

Target roles:
☑️ public

USING expression:
bucket_id = 'resume_image'
```

#### 點擊 "Save policy"

---

### 4. 建立 UPDATE Policy (更新權限)

```
Policy name: allow_authenticated_updates

Allowed operation:
☑️ UPDATE

Target roles:
☑️ authenticated

USING expression:
bucket_id = 'resume_image'

WITH CHECK expression:
bucket_id = 'resume_image'
```

---

### 5. 建立 DELETE Policy (刪除權限)

```
Policy name: allow_authenticated_deletes

Allowed operation:
☑️ DELETE

Target roles:
☑️ authenticated

USING expression:
bucket_id = 'resume_image'
```

---

## 🧪 驗證設定

### 檢查 Policies 列表

在 Storage > Policies 頁面,應該看到 4 個 policies:

```
resume_image bucket:
✅ allow_authenticated_uploads  (INSERT, authenticated)
✅ allow_public_read           (SELECT, public)
✅ allow_authenticated_updates (UPDATE, authenticated)
✅ allow_authenticated_deletes (DELETE, authenticated)
```

---

## 🎯 測試上傳

### 1. 重新載入頁面
```bash
# 在瀏覽器按 Cmd+R (Mac) 或 Ctrl+R (Windows)
```

### 2. 測試上傳
1. 進入 `/dashboard/resume/edit`
2. 點擊上傳照片
3. 選擇圖片檔案
4. 應該成功上傳

### 3. 驗證結果
- ✅ 沒有錯誤訊息
- ✅ 照片顯示在預覽
- ✅ 儲存成功

---

## 🔍 疑難排解

### 問題 1: 還是看到權限錯誤

**解決方案:**
1. 確認你已登入 (在 `/dashboard`)
2. 清除瀏覽器快取和 cookies
3. 重新登入
4. 檢查 Console 是否有其他錯誤

### 問題 2: Bucket 不存在

**錯誤訊息:**
```
Error: Storageバケットが見つかりません。
```

**解決方案:**
1. 進入 Storage 頁面
2. 檢查是否有 `resume_image` bucket
3. 如果沒有,點擊 "New bucket":
   - Name: `resume_image`
   - Public: ☑️ (勾選)
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

### 問題 3: Policy 建立失敗

**可能原因:**
- 語法錯誤
- 欄位填錯

**解決方案:**
1. 刪除失敗的 policy
2. 重新建立
3. 確保 `bucket_id = 'resume_image'` 正確
4. 確保單引號是標準的 `'` 不是 `'` 或 `'`

---

## 📸 參考截圖位置

詳細的截圖指南請查看:
- `supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md`

---

## ✅ 完成檢查清單

修復完成後,確認以下項目:

- [ ] `resume_image` bucket 存在
- [ ] Bucket 設定為 Public
- [ ] 4 個 policies 都建立完成
- [ ] 測試上傳成功
- [ ] 照片可以顯示
- [ ] Console 無錯誤

---

## 🎉 修復完成!

完成以上步驟後:
1. 重新整理頁面
2. 嘗試上傳履歷照片
3. 應該可以正常運作了!

如果還有問題,請提供:
- Console 完整錯誤訊息
- Supabase Dashboard Policies 截圖
- 當前登入的 User ID

---

## 📚 相關文件

- [完整 Storage 設定指南](./supabase-migrations/05c_STORAGE_POLICIES_UI_GUIDE.md)
- [Supabase Storage 文件](https://supabase.com/docs/guides/storage)
- [RLS Policies 文件](https://supabase.com/docs/guides/auth/row-level-security)

