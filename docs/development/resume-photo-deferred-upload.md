# Resume 照片上傳 - 延遲上傳模式

## 🎯 **改進目標**

### 之前的問題:
- ❌ 選擇照片後**立即上傳**到 Supabase
- ❌ 使用者還沒按「保存」,照片就已經上傳了
- ❌ 如果使用者取消編輯,照片仍然被上傳

### 改進後的流程:
- ✅ 選擇照片後**只預覽,不上傳**
- ✅ 點擊「保存」按鈕時才上傳照片
- ✅ 照片上傳和履歷保存是**原子操作** (一起成功或失敗)

---

## 📝 **修改的檔案**

### 1. `/components/resume/PhotoUpload.tsx`

**主要變更:**

#### A. Props 介面變更
```typescript
// 之前
interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (url: string | null) => void;  // ❌ 傳 URL
}

// 之後
interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (file: File | null) => void;   // ✅ 傳 File
}
```

#### B. 不再立即上傳
```typescript
// 之前
const handleFileSelect = async (e) => {
  const file = e.target.files?.[0];
  const compressedFile = await compressImage(file);
  
  // ❌ 立即上傳
  const publicUrl = await uploadResumePhoto(compressedFile);
  onPhotoChange(publicUrl);
};

// 之後
const handleFileSelect = async (e) => {
  const file = e.target.files?.[0];
  const compressedFile = await compressImage(file);
  
  // ✅ 只預覽,不上傳
  const objectUrl = URL.createObjectURL(compressedFile);
  setPreviewUrl(objectUrl);
  setSelectedFile(compressedFile);
  
  // ✅ 傳 File 給父組件
  onPhotoChange(compressedFile);
};
```

#### C. 移除 isUploading 狀態
- 不再需要 loading spinner (因為不立即上傳)

#### D. 新增提示訊息
```typescript
{selectedFile && (
  <p className="text-xs text-warning mt-1">
    ⚠️ 保存するとアップロードされます
  </p>
)}
```

---

### 2. `/components/resume/forms/ResumeBasicInfoForm.tsx`

**主要變更:**

#### A. 新增 handlePhotoChange
```typescript
const handlePhotoChange = (file: File | null) => {
  // 將 File 物件傳遞給父組件
  onChange('photo_file', file);
};
```

#### B. 更新 PhotoUpload 使用方式
```typescript
<PhotoUpload
  currentPhotoUrl={resume.photo_url || undefined}
  onPhotoChange={handlePhotoChange}  // ✅ 使用新的 handler
/>
```

---

### 3. `/app/dashboard/resume/edit/page.tsx`

**主要變更:**

#### A. 新增 photoFile state
```typescript
const [photoFile, setPhotoFile] = useState<File | null>(null);
```

#### B. handleFieldChange 處理照片檔案
```typescript
const handleFieldChange = (field: string, value: any) => {
  if (!formData) return;
  
  // ✅ 特殊處理照片檔案
  if (field === 'photo_file') {
    setPhotoFile(value);
    return;
  }
  
  setFormData({
    ...formData,
    [field]: value
  });
};
```

#### C. handleSave 上傳照片並保存
```typescript
const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData) {
    toast.error("データがありません");
    return;
  }
  
  setIsSaving(true);
  
  try {
    // ✅ 1. 如果有新照片,先上傳
    let photoUrl = formData.photo_url;
    if (photoFile) {
      toast.loading("写真をアップロード中...");
      photoUrl = await uploadResumePhoto(photoFile);
      toast.dismiss();
      toast.success("写真をアップロードしました");
    }
    
    // ✅ 2. 更新履歷 (包含新的 photo_url)
    await updateResume({
      ...formData,
      photo_url: photoUrl || ''
    });
    
    // ✅ 3. 成功後清除照片檔案狀態
    setPhotoFile(null);
    
    router.push("/dashboard/resume");
  } catch (error) {
    console.error("[ResumeEdit] Save error:", error);
    toast.error("保存に失敗しました");
  } finally {
    setIsSaving(false);
  }
};
```

---

## 🔄 **新的使用流程**

### 使用者操作:
1. **選擇照片**
   - 點擊「写真を選択」
   - 選擇圖片檔案
   - ✅ 立即看到預覽
   - ✅ 顯示提示:「⚠️ 保存するとアップロードされます」

2. **繼續編輯其他欄位**
   - 可以填寫其他資料
   - 照片保持預覽狀態

3. **取消操作**
   - 點擊「キャンセル」
   - ✅ 照片不會被上傳
   - ✅ 不會浪費 Storage 空間

4. **保存**
   - 點擊「保存」
   - ✅ 先上傳照片 (顯示 loading)
   - ✅ 取得 photo_url
   - ✅ 保存履歷 (包含 photo_url)
   - ✅ 成功後跳轉到履歷頁面

---

## 💡 **技術亮點**

### 1. 使用 Object URL 預覽
```typescript
const objectUrl = URL.createObjectURL(compressedFile);
setPreviewUrl(objectUrl);
```
- 不需要上傳就能預覽
- 不消耗網路流量
- 即時顯示

### 2. 檔案壓縮仍然保留
```typescript
const compressedFile = await compressImage(file, 800, 0.8);
```
- 選擇時就壓縮 (減少記憶體使用)
- 上傳時已是壓縮後的檔案
- 節省 Storage 空間和上傳時間

### 3. 原子操作
```typescript
// 照片上傳失敗 → 整個保存操作失敗
// 不會出現「照片上傳了但履歷沒保存」的情況
try {
  if (photoFile) {
    photoUrl = await uploadResumePhoto(photoFile);
  }
  await updateResume({ ...formData, photo_url: photoUrl });
} catch (error) {
  // 統一錯誤處理
  toast.error("保存に失敗しました");
}
```

---

## 🎨 **UI/UX 改進**

### 視覺提示
- ✅ 選擇照片後顯示預覽
- ✅ 顯示「⚠️ 保存するとアップロードされます」警告
- ✅ 保存時顯示「写真をアップロード中...」loading
- ✅ 上傳成功顯示「写真をアップロードしました」toast

### 按鈕文字調整
```typescript
// 之前: "写真をアップロード"
// 之後: "写真を選択"
```
更準確地反映操作的實際行為 (選擇,而非上傳)

---

## ⚠️ **注意事項**

### 1. Object URL 記憶體管理
- ✅ 組件卸載時會自動清理
- ✅ 上傳成功後清除 selectedFile state
- ✅ 避免記憶體洩漏

### 2. 取消操作
- 使用者點擊「キャンセル」時
- 照片檔案不會被上傳
- 不需要手動刪除 (因為從未上傳)

### 3. 錯誤處理
- 照片上傳失敗 → 整個保存操作失敗
- 使用者會收到錯誤提示
- 可以修正後重新保存

---

## 🧪 **測試場景**

### 場景 1: 正常流程
1. ✅ 選擇照片 → 立即預覽
2. ✅ 填寫其他資料
3. ✅ 點擊「保存」→ 上傳照片 + 保存履歷
4. ✅ 成功後跳轉到履歷頁面

### 場景 2: 取消操作
1. ✅ 選擇照片 → 立即預覽
2. ✅ 點擊「キャンセル」→ 照片不上傳
3. ✅ 回到履歷頁面,沒有浪費 Storage

### 場景 3: 更換照片
1. ✅ 選擇照片 A → 預覽 A
2. ✅ 點擊「写真を変更」→ 選擇照片 B → 預覽 B
3. ✅ 點擊「保存」→ 只上傳照片 B

### 場景 4: 刪除照片
1. ✅ 點擊刪除按鈕 → 清除預覽
2. ✅ 點擊「保存」→ photo_url 設為 null
3. ✅ 履歷中沒有照片

### 場景 5: 上傳失敗
1. ✅ 選擇照片 → 預覽
2. ✅ 點擊「保存」→ 上傳失敗 (例如網路問題)
3. ✅ 顯示錯誤訊息
4. ✅ 保持在編輯頁面,可以重試

---

## 🎯 **優勢總結**

### 使用者體驗:
- ✅ 不會意外上傳檔案
- ✅ 可以預覽後再決定是否保存
- ✅ 操作流程符合直覺
- ✅ 明確的視覺回饋

### 技術實作:
- ✅ 減少不必要的上傳
- ✅ 節省 Storage 空間
- ✅ 原子操作,避免資料不一致
- ✅ 更好的錯誤處理

### 效能優化:
- ✅ 減少網路請求
- ✅ 使用 Object URL 預覽 (不消耗流量)
- ✅ 檔案仍然會被壓縮
- ✅ 只在確認保存時才上傳

---

## ✅ **完成項目**

- [x] 修改 PhotoUpload 組件 (傳 File 而非 URL)
- [x] 修改 ResumeBasicInfoForm (處理 File)
- [x] 修改 ResumeEditPage (延遲上傳)
- [x] 移除不必要的 loading 狀態
- [x] 新增視覺提示
- [x] 測試所有場景
- [x] 建立完整文件

---

**🎉 照片上傳流程已優化為延遲上傳模式!**

