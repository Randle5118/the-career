# Resume API Endpoints 完整列表

## 📝 私人履歷 API

### 1. 取得使用者履歷
```http
GET /api/resumes
Authorization: Required

Response:
{
  "data": Resume | null
}
```

### 2. 更新/建立履歷
```http
PUT /api/resumes
Authorization: Required
Content-Type: application/json

Body: ResumeFormData

Response:
{
  "success": true,
  "data": Resume,
  "message": "履歴書を作成しました" | "履歴書を更新しました"
}
```

---

## 🌐 公開履歷 API

### 3. 發布公開履歷
```http
POST /api/resumes/[id]/publish
Authorization: Required
Content-Type: application/json

Body (optional):
{
  "is_public": true,  // 預設 true
  "public_url_slug": "john-doe"  // 可選,不提供則自動生成
}

Response:
{
  "success": true,
  "data": PublishedResume,
  "public_url": "/r/john-doe",
  "message": "履歴書を公開しました" | "履歴書を更新しました"
}

行為:
- 如果用戶還沒有公開履歷 → 建立新的
- 如果用戶已有公開履歷 → 更新現有的
- 自動移除敏感資訊 (phone, email, 詳細地址等)
```

### 4. 取得自己的公開履歷
```http
GET /api/resume/published
Authorization: Required

Response:
{
  "data": PublishedResume | null
}
```

### 5. 更新公開設定
```http
PATCH /api/resume/published
Authorization: Required
Content-Type: application/json

Body:
{
  "is_public": false,  // 開啟/關閉公開
  "public_url_slug": "new-slug"  // 修改公開 URL
}

Response:
{
  "success": true,
  "data": PublishedResume,
  "message": "設定を更新しました"
}
```

### 6. 停止公開
```http
DELETE /api/resume/published
Authorization: Required

Response:
{
  "success": true,
  "message": "履歴書の公開を停止しました"
}

注意: 不會真的刪除記錄,只是將 is_public 設為 false
```

### 7. 查看公開履歷 (任何人)
```http
GET /api/published-resumes/[slug]
Authorization: Not Required

Response:
{
  "data": PublishedResume
}

錯誤:
{
  "error": "履歴書が見つかりません"
}

注意: 此 endpoint 不需要驗證,任何人都可以訪問
```

---

## 🔒 資料隱私處理

### 發布時自動移除的敏感資訊:
- ❌ `phone` - 電話號碼
- ❌ `email` - Email
- ❌ `postal_code` - 郵遞區號
- ❌ `city` - 城市
- ❌ `address_line` - 詳細地址
- ❌ `building` - 建築名稱
- ❌ `birth_date` - 出生日期
- ❌ `name_kana` - 假名姓名

### 保留的公開資訊:
- ✅ `name_romaji` - 羅馬字姓名 (英文名)
- ✅ `name_kanji` - 漢字姓名
- ✅ `age` - 年齡 (用於職涯判斷,但不顯示出生日期)
- ✅ `photo_url` - 照片
- ✅ `prefecture` - 都道府縣 (只顯示區域)
- ✅ `linkedin_url` - LinkedIn
- ✅ `github_url` - GitHub
- ✅ `portfolio_url` - 作品集
- ✅ `career_summary` - 經歷摘要
- ✅ `self_pr` - 自我PR
- ✅ `work_experience` - 工作經驗
- ✅ `education` - 學歷
- ✅ `skills` - 技能
- ✅ `certifications` - 證照
- ✅ `languages` - 語言能力
- ✅ `awards` - 獲獎紀錄

---

## 🧪 測試用 cURL 指令

### 取得履歷
```bash
curl -X GET http://localhost:3000/api/resumes \
  -H "Cookie: your-session-cookie"
```

### 更新履歷
```bash
curl -X PUT http://localhost:3000/api/resumes \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name_romaji": "John Doe",
    "name_kanji": "田中太郎",
    "email": "john@example.com"
  }'
```

### 發布公開履歷
```bash
curl -X POST http://localhost:3000/api/resumes/1/publish \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "is_public": true,
    "public_url_slug": "john-doe"
  }'
```

### 查看公開履歷 (不需認證)
```bash
curl -X GET http://localhost:3000/api/published-resumes/john-doe
```

---

## 📊 錯誤處理

### 常見錯誤碼
- `401` - 未認證 (需要登入)
- `404` - 找不到資源
- `409` - URL slug 已被使用
- `500` - 伺服器錯誤

### 錯誤回應格式
```json
{
  "error": "錯誤訊息 (日文)"
}
```

---

## 🔄 資料流程

### 完整的履歷發布流程

```
1. 使用者編輯私人履歷
   ↓
   PUT /api/resumes
   
2. 使用者點擊「發布」
   ↓
   POST /api/resumes/[id]/publish
   ↓
   系統檢查是否已有公開履歷
   ├─ 沒有 → INSERT 新記錄
   └─ 已有 → UPDATE 現有記錄
   ↓
   自動移除敏感資訊
   ↓
   返回公開 URL

3. 任何人可以透過 URL 查看
   ↓
   GET /api/published-resumes/[slug]
   或
   瀏覽器: https://cafka.jp/r/[slug]
```

---

## 📝 注意事項

1. **一個用戶一份履歷**: 
   - `resumes` 表: 每個用戶只有一筆記錄
   - `published_resumes` 表: 每個用戶只有一筆記錄

2. **更新模式**:
   - 再次發布會「更新」現有的公開履歷,不是建立新版本
   - `version` 欄位固定為 1 (保留供未來使用)

3. **URL Slug**:
   - 首次發布時可以指定
   - 如果沒指定,系統自動生成: `{name_romaji}-{user_id前8碼}`
   - 一旦設定後建議不要更改 (避免分享的連結失效)

4. **RLS (Row Level Security)**:
   - 私人履歷: 只有本人可以讀寫
   - 公開履歷: 本人可以讀寫,其他人只能讀 (當 `is_public=true`)

