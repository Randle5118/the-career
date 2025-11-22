# 資料庫遷移狀態總覽

> **最後更新**: 2025-01-XX  
> **資料庫**: Supabase PostgreSQL  
> **遷移方式**: 手動執行 (Supabase Dashboard SQL Editor)

---

## 📊 資料庫架構總覽

### 核心資料表

| 表名 | 用途 | 設計模式 | 狀態 |
|------|------|---------|------|
| `users` | 業務用戶表 | 1:1 關聯 auth.users | ✅ 完成 |
| `resumes` | 履歷表 | 單表 + JSONB | ✅ 完成 |
| `published_resumes` | 公開履歷 | 更新模式 (每用戶一份) | ✅ 完成 |
| `applications` | 應募管理 | 單表 + JSONB | ✅ 完成 |

---

## 📋 遷移檔案執行順序

### Phase 1: 基礎架構

#### ✅ `00_create_users_table.sql`
**執行時間**: 初始建立  
**內容**:
- 建立 `users` 表 (與 `auth.users` 1:1 關聯)
- 自動同步 trigger (`handle_new_user`)
- RLS 政策 (2 個)
- 統計函數 (`update_user_applications_count`, `update_user_resumes_count`)

**關鍵特性**:
- 自動從 `auth.users` 同步用戶資料
- 支援付費功能 (`is_premium`, `premium_expires_at`)
- 統計欄位 (`total_applications`, `total_resumes`)

---

### Phase 2: Resume 系統

#### ✅ `01_create_resumes_table.sql`
**執行時間**: 初始建立  
**內容**:
- 建立 `resumes` 表 (單表設計)
- 7 個 JSONB 欄位 (education, work_experience, certifications, awards, languages, skills, preferences)
- RLS 政策 (5 個)
- Triggers (2 個: `updated_at`, `ensure_single_primary_resume`)
- 索引 (7 個，包含 3 個 GIN 索引)

**關鍵特性**:
- 單表設計，無需 JOIN
- JSONB 欄位支援複雜結構
- 自動確保每個用戶只有一個主要履歷

#### ✅ `01b_update_resumes_table.sql`
**執行時間**: 後續更新  
**內容**:
- 新增 `is_public` 欄位
- 新增 `public_url_slug` 欄位
- 更新索引和 RLS 政策

---

### Phase 3: Published Resumes 系統

#### ✅ `02_create_published_resumes_table.sql`
**執行時間**: 初始建立  
**內容**:
- 建立 `published_resumes` 表 (snapshot 模式)
- 與 `resumes` 相同的結構
- 版本號自動遞增 trigger
- RLS 政策 (5 個)

**原始設計**: Snapshot 模式 (每次發布建立新版本)

#### ✅ `02b_update_published_resumes_constraints.sql`
**執行時間**: 後續更新  
**內容**:
- 新增唯一約束: 每個用戶只能有一個 `is_public=true` 的履歷
- 建立 trigger 自動取消舊的公開狀態

**設計變更**: 從多版本改為單一公開履歷

#### ✅ `02c_simplify_published_resumes.sql`
**執行時間**: 最終簡化  
**內容**:
- **移除版本號邏輯** (改為固定 version=1)
- **改為更新模式**: 每個用戶只有一份公開履歷
- 建立唯一索引: `idx_published_resumes_one_per_user`
- 清理舊版本資料

**最終設計**: 更新模式 (UPSERT)
- 如果沒有 → 建立新的
- 如果已有 → 更新現有的
- `published_at` 保留首次發布時間
- `updated_at` 記錄每次更新時間

---

### Phase 4: Applications 系統

#### ✅ `02_create_applications_table_only.sql`
**執行時間**: 初始建立  
**內容**:
- 建立 `applications` 表
- 建立 5 個 ENUM 類型 (application_status, employment_type, application_method_type, scout_type, interview_method_type)
- JSONB 欄位: `application_method`, `offer_salary`, `schedule`
- RLS 政策 (4 個)
- 索引 (9 個，包含全文搜尋索引)
- Trigger (`update_applications_updated_at`)

**關鍵特性**:
- 完整的應募流程管理
- 支援複雜的應募方法結構 (job_site/referral/direct)
- 薪資資訊管理 (刊登/希望/Offer)
- 日程管理 (面試方法、截止日期)

---

### Phase 5: Storage 設定

#### ✅ `05_SETUP_STORAGE_POLICIES.md`
**執行時間**: 手動設定  
**內容**:
- Storage bucket: `resume_image`
- Storage Policies 設定指南
- 使用 Dashboard UI 設定 (無法用 SQL)

**設定方式**: Supabase Dashboard → Storage → Policies

#### ✅ `05b_fix_storage_policies.sql`
**執行時間**: 修正 Storage Policies  
**內容**:
- 刪除所有現有的 `storage.objects` policies
- 建立 4 個新的 policies:
  - `Public Access for resume_image` (SELECT - 公開讀取)
  - `Authenticated users can upload to resume_image` (INSERT)
  - `Authenticated users can update in resume_image` (UPDATE)
  - `Authenticated users can delete in resume_image` (DELETE)

**⚠️ 注意**: 
- 這個 SQL 腳本**可以執行** (Storage Policies 可以用 SQL 設定)
- 但 Supabase Cloud 有時會限制，建議先用 Dashboard UI 設定
- 如果 SQL 執行失敗，參考 `05c_STORAGE_POLICIES_UI_GUIDE.md`

#### ✅ `05c_STORAGE_POLICIES_UI_GUIDE.md`
**執行時間**: Dashboard UI 設定指南  
**內容**:
- 詳細的 Dashboard UI 操作步驟
- 每個 Policy 的完整設定內容
- 疑難排解指南

**使用時機**: 當 SQL 無法執行時，使用 Dashboard UI 手動設定

---


## 🔄 設計演進歷程

### Published Resumes 的演進

1. **初始設計** (`02_create_published_resumes_table.sql`)
   - Snapshot 模式
   - 每次發布建立新版本
   - 自動版本號遞增

2. **第一次優化** (`02b_update_published_resumes_constraints.sql`)
   - 限制每個用戶只能有一個公開履歷
   - 保留版本歷史

3. **最終簡化** (`02c_simplify_published_resumes.sql`)
   - 移除版本號邏輯
   - 改為更新模式 (UPSERT)
   - 每個用戶只有一份公開履歷

---

## 📐 資料表關聯圖

```
auth.users (Supabase Auth)
    ↓ (1:1)
public.users
    ↓ (1:N)
public.resumes
    ↓ (1:1, snapshot)
public.published_resumes

public.users
    ↓ (1:N)
public.applications
```

---

## 🔒 RLS 政策總覽

### users 表
- ✅ Users can view own profile
- ✅ Users can update own profile

### resumes 表
- ✅ Users can view own resumes
- ✅ Anyone can view public resumes
- ✅ Users can insert own resumes
- ✅ Users can update own resumes
- ✅ Users can delete own resumes

### published_resumes 表
- ✅ Users can view own published resumes
- ✅ Anyone can view public published resumes
- ✅ Users can insert own published resumes
- ✅ Users can update own published resumes
- ✅ Users can delete own published resumes

### applications 表
- ✅ Users can view own applications
- ✅ Users can insert own applications
- ✅ Users can update own applications
- ✅ Users can delete own applications

---

## ⚡ Triggers 總覽

### 自動更新時間戳記
- `handle_updated_at()` - 所有表的 `updated_at` 欄位

### 業務邏輯 Triggers
- `ensure_single_primary_resume()` - 確保每個用戶只有一個主要履歷
- `handle_new_user()` - 自動建立 `public.users` 記錄

---

## 📊 索引策略

### 基本索引
- `user_id` - 所有表都有
- `created_at`, `updated_at` - 時間排序
- `is_public` - 公開查詢

### JSONB 索引 (GIN)
- `resumes.education`
- `resumes.work_experience`
- `resumes.skills`
- `published_resumes.education`
- `published_resumes.work_experience`
- `published_resumes.skills`
- `applications.tags`

### 全文搜尋索引
- `applications.company_name` (GIN)
- `applications.position` (GIN)

### 唯一索引
- `resumes.public_url_slug` (UNIQUE)
- `published_resumes.public_url_slug` (UNIQUE)
- `published_resumes.user_id` (UNIQUE) - 確保每用戶一份

---

## 🎯 設計原則

### 1. 單表 + JSONB 設計
- ✅ 減少 JOIN 查詢
- ✅ 提升讀取效能
- ✅ 符合 TypeScript 型別定義
- ✅ 適合 Supabase Realtime

### 2. RLS 優先
- ✅ 所有表都啟用 RLS
- ✅ 資料庫層級的安全保護
- ✅ API 層只需檢查認證

### 3. 自動化
- ✅ 自動更新 `updated_at`
- ✅ 自動同步 `auth.users` → `public.users`
- ✅ 自動確保唯一性 (主要履歷、公開履歷)

---

## ⚠️ 注意事項

### 1. 手動操作項目
- Storage Policies 需要在 Dashboard UI 設定
- 無法透過 SQL 直接建立 Storage policies

### 2. 資料一致性
- `published_resumes` 是 `resumes` 的副本 (snapshot)
- 發布時需要手動同步資料
- API 層負責資料清理 (移除敏感資訊)

### 3. 版本控制
- `published_resumes.version` 固定為 1 (保留欄位)
- 未來如需版本功能，可以重新啟用版本號邏輯

---

## 📝 檔案分類

### 核心遷移檔案 (必須執行，按順序)

1. `00_create_users_table.sql` - 業務用戶表
2. `01_create_resumes_table.sql` - 履歷表
3. `01b_update_resumes_table.sql` - 履歷表更新 (is_public, public_url_slug)
4. `02_create_published_resumes_table.sql` - 公開履歷表
5. `02b_update_published_resumes_constraints.sql` - 公開履歷約束
6. `02c_simplify_published_resumes.sql` - 公開履歷簡化 (更新模式)
7. `02_create_applications_table_only.sql` - 應募管理表
8. `05b_fix_storage_policies.sql` - Storage Policies (或使用 Dashboard UI)

### 文件檔案
- `README.md` - 遷移指南
- `CHECKLIST.md` - 執行檢查清單
- `05_SETUP_STORAGE_POLICIES.md` - Storage 設定指南
- `05c_STORAGE_POLICIES_UI_GUIDE.md` - Storage UI 操作指南

---

## 📝 待辦事項

### 資料庫層面
- [x] ✅ 建立所有核心表結構
- [x] ✅ 建立 RLS 政策
- [x] ✅ 建立索引和 Triggers
- [ ] 考慮加入 `careers` 表 (職涯歷史)
- [ ] 優化 JSONB 查詢效能
- [ ] 加入資料庫層級的 JSONB 驗證 (CHECK constraints)

### API 層面
- [x] ✅ 實作 UPSERT 邏輯 (published_resumes)
- [x] ✅ 加入資料驗證 (Zod)
- [x] ✅ 加入 Rate Limiting

---

## 🗂️ 檔案清單總覽

### 核心遷移檔案 (按執行順序)

| 檔案名 | 類型 | 狀態 | 說明 |
|--------|------|------|------|
| `00_create_users_table.sql` | 核心表 | ✅ 必須 | 業務用戶表 |
| `01_create_resumes_table.sql` | 核心表 | ✅ 必須 | 履歷表 |
| `01b_update_resumes_table.sql` | 更新 | ✅ 必須 | 履歷表更新 (is_public, public_url_slug) |
| `02_create_published_resumes_table.sql` | 核心表 | ✅ 必須 | 公開履歷表 |
| `02b_update_published_resumes_constraints.sql` | 更新 | ✅ 必須 | 公開履歷約束 |
| `02c_simplify_published_resumes.sql` | 更新 | ✅ 必須 | 公開履歷簡化 (更新模式) |
| `02_create_applications_table_only.sql` | 核心表 | ✅ 必須 | 應募管理表 |
| `05b_fix_storage_policies.sql` | Storage | ✅ 必須 | Storage Policies |

### 文件檔案

| 檔案名 | 類型 | 說明 |
|--------|------|------|
| `README.md` | 文件 | 遷移指南和 JSONB 使用說明 |
| `CHECKLIST.md` | 文件 | 執行檢查清單 |
| `05_SETUP_STORAGE_POLICIES.md` | 文件 | Storage 設定指南 |
| `05c_STORAGE_POLICIES_UI_GUIDE.md` | 文件 | Storage Dashboard UI 操作指南 |

---

## 🔗 相關文件

- [Resume API 設計](../development/resume-api-design.md)
- [Applications 整合摘要](../integration/APPLICATIONS_INTEGRATION_SUMMARY.md)
- [後端改進建議](./backend-improvements.md)
- [後端改進完成報告](./backend-improvements-completed.md)

---

**維護者**: Backend Team  
**最後檢視**: 2025-01-XX  
**資料庫版本**: Supabase PostgreSQL (最新)

