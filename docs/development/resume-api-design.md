# Resume API 設計文件

## 核心概念

### 履歷模式
- **Private Resume (`resumes`)**: 使用者的私人履歷,用於編輯
- **Public Resume (`published_resumes`)**: 公開版本履歷,用於分享

### 更新模式
- 每個用戶**只有一份**公開履歷
- 發布時自動移除敏感資訊
- 再次發布會**更新**現有的公開履歷 (不是建立新版本)

---

## API Endpoints

### 1. 取得使用者履歷 (私人)

```typescript
GET /api/resume

Response:
{
  success: true,
  data: Resume | null
}
```

### 2. 更新使用者履歷 (私人)

```typescript
PUT /api/resume

Body: ResumeFormData

Response:
{
  success: true,
  data: Resume
}
```

### 3. 發布公開履歷

```typescript
POST /api/resume/publish

Body: {
  public_url_slug?: string  // 可選,如果沒提供則自動生成
}

邏輯:
1. 取得使用者的 resumes
2. 檢查是否已有 published_resumes
3. 移除敏感資訊 (sanitizePrivateData)
4. 如果已存在 → UPDATE
   如果不存在 → INSERT

Response:
{
  success: true,
  data: {
    published_resume: PublishedResume,
    public_url: string  // 完整的公開 URL
  }
}
```

### 4. 取得公開履歷 (自己的)

```typescript
GET /api/resume/published

Response:
{
  success: true,
  data: PublishedResume | null
}
```

### 5. 更新公開履歷設定

```typescript
PATCH /api/resume/published

Body: {
  is_public?: boolean,        // 開啟/關閉公開
  public_url_slug?: string    // 修改公開 URL
}

Response:
{
  success: true,
  data: PublishedResume
}
```

### 6. 停止公開

```typescript
POST /api/resume/unpublish

邏輯:
將 is_public 設為 false (不刪除記錄)

Response:
{
  success: true,
  message: "履歴の公開を停止しました"
}
```

### 7. 查看公開履歷 (任何人)

```typescript
GET /api/public/resume/[slug]

Response:
{
  success: true,
  data: PublishedResume
}

注意: 這個 API 不需要驗證,任何人都可以訪問
```

---

## 資料淨化邏輯

### sanitizePrivateData()

發布時自動移除敏感資訊:

```typescript
function sanitizePrivateData(resume: Resume): Partial<Resume> {
  return {
    ...resume,
    // ❌ 移除敏感資訊
    phone: null,
    email: null,
    postal_code: null,
    city: null,
    address_line: null,
    building: null,
    birth_date: null,      // 移除出生日期
    name_kana: null,
    
    // ✅ 保留的資訊
    // - age (年齡保留,用於職涯判斷)
    // - name_romaji (英文名)
    // - name_kanji (可選,使用者可以在公開版本編輯)
    // - photo_url
    // - prefecture (只顯示都道府縣)
    // - 社群連結 (linkedin, github, portfolio)
    // - 工作經歷、學歷、技能等專業資訊
  };
}
```

---

## 頁面結構

```
/dashboard/resume              → 編輯私人履歷
/dashboard/resume/publish      → 公開履歷管理
/r/[slug]                      → 公開履歷預覽 (所有人可見)
```

---

## 資料庫操作順序

### 首次發布

```sql
-- 1. 檢查是否存在
SELECT * FROM published_resumes WHERE user_id = $1;

-- 2. 不存在,建立新的
INSERT INTO published_resumes (
  user_id,
  resume_name,
  is_public,
  public_url_slug,
  ...
) VALUES (...);
```

### 再次發布

```sql
-- 1. 檢查是否存在
SELECT * FROM published_resumes WHERE user_id = $1;

-- 2. 已存在,更新
UPDATE published_resumes
SET 
  resume_name = $2,
  name_kanji = $3,
  ...
  updated_at = NOW()
WHERE user_id = $1;
```

### 使用 UPSERT (推薦)

```sql
INSERT INTO published_resumes (
  user_id,
  resume_name,
  ...
) VALUES ($1, $2, ...)
ON CONFLICT (user_id)
DO UPDATE SET
  resume_name = EXCLUDED.resume_name,
  ...
  updated_at = NOW();
```

---

## 實作優先順序

1. ✅ 資料庫結構調整 (執行 02c_simplify_published_resumes.sql)
2. 📝 建立 API Routes
   - POST /api/resume/publish
   - GET /api/resume/published
   - PATCH /api/resume/published
3. 🎨 建立 UI 頁面
   - /dashboard/resume/publish
4. 🔗 公開頁面
   - /r/[slug]

---

## 注意事項

- ⚠️ 發布前要提醒使用者「即將公開履歷」
- ⚠️ 明確告知哪些資訊會被移除
- ⚠️ 公開 URL slug 一旦設定,建議不要隨意更改 (避免分享的連結失效)
- ⚠️ 停止公開時保留資料 (只改 is_public),避免使用者誤刪

