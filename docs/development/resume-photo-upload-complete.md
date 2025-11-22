# Resume 照片上傳功能 - 完整實作總結

## ✅ 已完成的檔案

### 1. 後端處理 (`/libs/storage/resume-image.ts`)

**功能:**
- ✅ `uploadResumePhoto(file, userId?)` - 上傳照片
- ✅ `deleteResumePhoto(userId?)` - 刪除照片
- ✅ `compressImage(file, maxWidth, quality)` - 壓縮圖片
- ✅ `validateImageFile(file)` - 檔案驗證
- ✅ `getResumePhotoUrl(userId, filename)` - 取得 URL

**特點:**
- 自動壓縮圖片 (800px, 80% 品質)
- 檔案大小限制: 5MB
- 檔案路徑: `resume_image/{user_id}/profile.{ext}`
- 覆蓋上傳 (upsert: true)

---

### 2. UI 組件 (`/components/resume/PhotoUpload.tsx`)

**功能:**
- ✅ 圓形頭像預覽 (128x128px)
- ✅ 點擊或拖曳上傳
- ✅ Hover 顯示變更按鈕
- ✅ 刪除照片功能
- ✅ Loading 狀態顯示
- ✅ 即時預覽

**重要修正:**
- ✅ 所有按鈕加上 `type="button"` 防止 form submit

**Props:**
```typescript
interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (url: string | null) => void;
  className?: string;
}
```

---

### 3. 表單整合 (`/components/resume/forms/ResumeBasicInfoForm.tsx`)

**位置:** 基本情報區塊頂部 (在姓名欄位之前)

**整合方式:**
```tsx
<PhotoUpload
  currentPhotoUrl={resume.photo_url || undefined}
  onPhotoChange={(url) => onChange('photo_url', url || '')}
/>
```

**UI 設計:**
- 照片上傳區域用 `border-b` 分隔
- 顯示檔案限制說明文字
- 移除了舊的「写真URL」文字輸入框

---

### 4. Supabase Storage 設定 (Dashboard 手動操作)

**Bucket Name:** `resume_image`  
**Public:** ✅ Yes (任何人可讀取)  
**File Size Limit:** 5MB  
**Allowed MIME Types:** `image/*`

**RLS Policies (已在 Dashboard 設定):**

#### Policy 1: INSERT (上傳)
```
Policy name: Users can upload their own resume photos
Operation: INSERT
Target roles: authenticated
WITH CHECK: (bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 2: UPDATE (更新)
```
Policy name: Users can update their own resume photos
Operation: UPDATE
Target roles: authenticated
USING: (bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK: (bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 3: DELETE (刪除)
```
Policy name: Users can delete their own resume photos
Operation: DELETE
Target roles: authenticated
USING: (bucket_id = 'resume_image' AND (storage.foldername(name))[1] = auth.uid()::text)
```

---

## 📂 檔案結構

```
resume_image/          (Supabase Storage Bucket)
├── {user_id_1}/
│   └── profile.jpg    (用戶 1 的照片)
├── {user_id_2}/
│   └── profile.png    (用戶 2 的照片)
└── ...
```

---

## 🧪 測試步驟

### 1. 上傳照片
1. 前往 `/dashboard/resume/edit`
2. 點擊「基本資料」Tab
3. 點擊「写真を追加」或「写真をアップロード」按鈕
4. 選擇圖片檔案 (最大 5MB)
5. ✅ 照片自動壓縮並上傳
6. ✅ 即時顯示預覽
7. 點擊「保存」按鈕保存履歷

### 2. 更換照片
1. Hover 到照片上
2. 點擊中間的相機圖示
3. 選擇新照片
4. ✅ 舊照片被覆蓋

### 3. 刪除照片
1. 點擊照片右上角的「X」按鈕
2. 確認刪除
3. ✅ 照片從 Storage 和履歷中移除

### 4. 驗證 Storage
1. 前往 Supabase Dashboard > Storage > resume_image
2. ✅ 應該看到: `{your_user_id}/profile.jpg`

### 5. 公開履歷測試
1. 發布履歷為公開
2. 訪問公開頁面 (`/r/[slug]`)
3. ✅ 照片應該可以正常顯示

---

## 🔒 安全性

### RLS 保護
- ✅ 只有認證用戶可以上傳
- ✅ 只能上傳到自己的資料夾 (`{user_id}/...`)
- ✅ 只能更新/刪除自己的照片
- ✅ Public bucket 允許任何人讀取 (公開履歷需要)

### 檔案驗證
- ✅ 檔案大小限制: 5MB
- ✅ 只接受圖片檔案 (`image/*`)
- ✅ 自動壓縮減少儲存空間

---

## 🎨 UI/UX 特點

### 響應式設計
- ✅ 桌面: 圓形頭像 128x128px
- ✅ 手機: 自動縮放
- ✅ 拖曳上傳在所有裝置都可用

### 互動設計
- ✅ Hover 顯示變更按鈕 (半透明遮罩)
- ✅ Loading 狀態 (上傳/刪除時顯示 spinner)
- ✅ Toast 通知 (成功/失敗訊息)
- ✅ 即時預覽 (不需重新整理頁面)

### 使用者體驗
- ✅ 點擊或拖曳上傳 (兩種方式)
- ✅ 清晰的檔案限制說明
- ✅ 刪除前確認對話框
- ✅ 錯誤訊息友善 (日文)

---

## 🐛 已修正的問題

### 問題 1: 點擊按鈕導致頁面跳轉
**原因:** 按鈕在 `<form>` 內部,預設 `type` 是 `submit`

**解決:** 所有按鈕加上 `type="button"`

**修正位置:**
- Hover 變更按鈕
- 刪除按鈕
- 「写真を追加」按鈕
- 「写真をアップロード」按鈕

---

## 💡 使用方式

### 在其他組件中使用

```tsx
import PhotoUpload from "@/components/resume/PhotoUpload";

<PhotoUpload
  currentPhotoUrl={resume?.photo_url}
  onPhotoChange={(url) => {
    // 處理照片 URL 變更
    updateResume({ photo_url: url });
  }}
/>
```

### 手動上傳 (程式碼)

```typescript
import { uploadResumePhoto, compressImage } from "@/libs/storage/resume-image";

// 壓縮並上傳
const file = /* File 物件 */;
const compressedFile = await compressImage(file, 800, 0.8);
const publicUrl = await uploadResumePhoto(compressedFile);
```

### 手動刪除 (程式碼)

```typescript
import { deleteResumePhoto } from "@/libs/storage/resume-image";

await deleteResumePhoto(); // 自動偵測當前用戶
```

---

## 📊 效能優化

### 圖片壓縮
- **原始檔案:** 可能 2-5MB
- **壓縮後:** 通常 < 500KB
- **壓縮設定:** 800px 寬度, 80% 品質
- **格式轉換:** 統一轉為 JPEG

### 快取策略
- **Cache-Control:** 3600 秒 (1 小時)
- **檔案覆蓋:** upsert = true (不產生多個版本)

---

## 🔄 未來可能的改進

1. **進階功能:**
   - [ ] 照片裁剪功能
   - [ ] 濾鏡效果
   - [ ] 多張照片上傳

2. **效能優化:**
   - [ ] 使用 WebP 格式
   - [ ] 漸進式上傳 (大檔案)
   - [ ] CDN 整合

3. **使用者體驗:**
   - [ ] 拖曳放置動畫
   - [ ] 上傳進度條
   - [ ] 批次上傳

---

## 📝 注意事項

1. **Supabase Cloud 限制:**
   - Storage policies 不能用 SQL 建立
   - 必須透過 Dashboard UI 設定

2. **檔案路徑:**
   - 固定格式: `{user_id}/profile.{ext}`
   - 每次上傳會覆蓋舊檔案

3. **Public Bucket:**
   - 任何人都可以讀取檔案
   - 適合公開履歷的照片
   - 不適合敏感資料

4. **瀏覽器相容性:**
   - Canvas API 需要現代瀏覽器
   - FileReader API 廣泛支援
   - 拖曳上傳 IE11+ 支援

---

## ✅ Checklist

- [x] 建立 `resume-image.ts` helper
- [x] 建立 `PhotoUpload.tsx` 組件
- [x] 整合到 `ResumeBasicInfoForm.tsx`
- [x] 在 Supabase Dashboard 設定 Storage Policies
- [x] 修正 form submit 問題 (`type="button"`)
- [x] 測試上傳功能
- [x] 測試刪除功能
- [x] 測試更換照片
- [x] 驗證 RLS 權限
- [x] 建立完整文件

---

**🎉 照片上傳功能已完整實作並測試完成!**

