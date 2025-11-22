# 專案整理分析報告

## 📊 專案現況總覽

### Git 狀態
- **修改過的檔案**: 24 個
- **未追蹤的檔案**: 22 個
- **未 commit 的變更**: 多個功能開發中的變更

---

## 📁 檔案分類分析

### 1. 未追蹤的檔案（需要決定是否加入 Git）

#### ✅ **應該加入 Git 的檔案**（實際功能檔案）

**API 路由**:
- `app/api/resume/published/route.ts` - 公開履歷 API（完整實作，應該保留）

**組件**:
- `components/resume/CareerImporterModal.tsx` - Career 匯入 Modal（完整功能）
- `components/resume/PhotoUpload.tsx` - 照片上傳組件（完整功能）

**工具庫**:
- `libs/resume/career-converter.ts` - Career → Resume 轉換邏輯（核心功能）
- `libs/storage/resume-image.ts` - 履歷照片儲存工具（完整實作）

**文件**:
- `docs/applications-supabase-integration.md` - 整合文件（應該保留）
- `docs/applications-testing-guide.md` - 測試指南（應該保留）

#### 📝 **開發記錄檔案**（建議移到 docs/development/）

**`.cursor/` 目錄下的開發記錄**:
- `career-resume-integration-complete.md` - Career → Resume 整合記錄
- `dashboard-career-stats-summary.md` - Dashboard 統計功能記錄
- `resume-age-privacy-update.md` - 履歷年齡隱私更新記錄
- `resume-api-design.md` - Resume API 設計記錄
- `resume-api-endpoints.md` - Resume API 端點記錄
- `resume-hook-fix-summary.md` - Resume Hook 修正記錄
- `resume-photo-deferred-upload.md` - 照片延遲上傳記錄
- `resume-photo-upload-complete.md` - 照片上傳完成記錄
- `resume-photo-upload-implementation.md` - 照片上傳實作記錄
- `resume-public-link-qr-feature.md` - 公開連結 QR 功能記錄

**根目錄的整合文件**:
- `APPLICATIONS_INTEGRATION_SUMMARY.md` - Applications 整合總結（應該移到 docs/integration/）
- `STATUS_LABELS_SUMMARY.md` - 狀態標籤總結（應該移到 docs/integration/）
- `STORAGE_FIX_GUIDE.md` - Storage 修復指南（應該移到 docs/guides/）

---

### 2. Demo 頁面分析

#### 🎨 **UI/UX Demo 頁面**（建議保留，但移到專門目錄）

**保留原因**: 這些是開發過程中的參考範例，對未來開發有幫助

- `app/career-modal-demo/page.tsx` - Career Modal 展示頁面
- `app/form-demo/page.tsx` - Form 系統展示頁面
- `app/expanded-salary-demo/page.tsx` - 薪資展開功能展示
- `app/modal-style-demo/page.tsx` - Modal 樣式展示

**建議**: 移到 `app/demo/` 目錄統一管理

#### 🧪 **測試頁面**（需要評估）

**`app/dashboard/test/` 目錄**:
- `page.tsx` - 測試頁面入口
- `job-posting/page.tsx` - Job Posting 測試（PDF 分析功能）
- `pdf-text-extract/page.tsx` - PDF 文字提取測試
- `simple-pdf-extract/page.tsx` - 簡單 PDF 提取測試
- `resume-analysis/` - 履歷分析測試（目錄存在但內容未知）

**建議**: 
- 如果是開發中的功能，保留但移到 `app/demo/test/` 或 `app/test/`
- 如果已完成整合，考慮移除或移到文件說明

---

### 3. 程式碼 TODO 分析

#### ⚠️ **需要處理的 TODO**

1. **`app/dashboard/resume/edit/page.tsx:36`**
   ```typescript
   // TODO: 未來替換為 API 呼叫
   ```
   **狀態**: 可能需要立即處理（如果功能已實作）

2. **`libs/stripe.ts:33,96,112`**
   ```typescript
   apiVersion: "2023-08-16", // TODO: update this when Stripe updates their API
   ```
   **狀態**: 低優先級（等待 Stripe 更新）

3. **`libs/gpt.ts:5`**
   ```typescript
   messages: any[], // TODO: type this
   ```
   **狀態**: 應該處理（避免使用 `any`）

---

### 4. 修改過的檔案分析

#### 📝 **24 個修改過的檔案**（需要檢查是否需要 commit）

**API 層**:
- `app/api/resumes/[id]/publish/route.ts` - Resume 發布 API
- `app/api/resumes/route.ts` - Resume CRUD API

**Dashboard 頁面**:
- `app/dashboard/applications/page.tsx` - 應募列表頁
- `app/dashboard/compare/page.tsx` - 比較頁面
- `app/dashboard/page.tsx` - Dashboard 首頁
- `app/dashboard/resume/edit/page.tsx` - 履歷編輯頁
- `app/dashboard/resume/page.tsx` - 履歷頁面
- `app/dashboard/statuses/page.tsx` - 狀態頁面

**組件**:
- `components/cards/ApplicationCard.tsx` - 應募卡片
- `components/forms/configGenerators.ts` - Form 配置生成器
- `components/modals/ApplicationModal.tsx` - 應募 Modal
- `components/resume/forms/ResumeBasicInfoForm.tsx` - 履歷基本資訊表單
- `components/resume/forms/ResumeWorkExperienceForm.tsx` - 履歷職歷表單
- `components/ui/ApplicationListItem.tsx` - 應募列表項目
- `components/ui/CalendarView.tsx` - 日曆視圖
- `components/ui/KanbanView.tsx` - Kanban 視圖

**Hooks**:
- `libs/hooks/useApplications.ts` - Applications Hook
- `libs/hooks/useResume.ts` - Resume Hook

**Types**:
- `types/application.ts` - Application 類型定義
- `types/resume.ts` - Resume 類型定義

**建議**: 這些變更看起來是功能開發的一部分，應該分批 commit

---

## 🎯 整理建議

### 階段 1: 文件整理（優先級：高）

1. **建立文件目錄結構**:
   ```
   docs/
   ├── development/     # 開發記錄
   │   └── *.md (從 .cursor/ 移動)
   ├── integration/    # 整合文件
   │   ├── APPLICATIONS_INTEGRATION_SUMMARY.md
   │   └── STATUS_LABELS_SUMMARY.md
   └── guides/         # 使用指南
       └── STORAGE_FIX_GUIDE.md
   ```

2. **移動開發記錄檔案**:
   - 將 `.cursor/*.md` 移到 `docs/development/`
   - 更新相關引用（如果有）

### 階段 2: Demo 頁面整理（優先級：中）

1. **建立 demo 目錄**:
   ```
   app/demo/
   ├── career-modal/
   ├── form-system/
   ├── expanded-salary/
   └── modal-style/
   ```

2. **測試頁面處理**:
   - 評估 `app/dashboard/test/` 的用途
   - 決定保留或移除

### 階段 3: 程式碼清理（優先級：中）

1. **處理 TODO 註解**:
   - 評估每個 TODO 的優先級
   - 處理高優先級的 TODO（如 `libs/gpt.ts` 的 `any` 類型）

2. **檢查未使用的 import**:
   - 使用 ESLint 檢查
   - 移除未使用的 import

### 階段 4: Git 狀態整理（優先級：高）

1. **加入新檔案到 Git**:
   - 功能檔案（API、組件、工具庫）
   - 文件檔案（移到 docs/ 後）

2. **分批 commit**:
   - 按功能模組 commit
   - 使用清晰的 commit message

---

## 📋 執行順序建議

1. ✅ **分析專案現況**（已完成）
2. 📁 **建立文件結構並移動檔案**
3. 🎨 **整理 Demo 頁面**
4. 🧹 **程式碼清理（TODO、未使用 import）**
5. 📝 **Git commit 整理**

---

## ⚠️ 注意事項

1. **不要刪除未確認的檔案**: 先備份或確認用途
2. **保留開發記錄**: 這些記錄對未來開發有幫助
3. **分批 commit**: 不要一次 commit 所有變更
4. **測試變更**: 移動檔案後要測試功能是否正常

---

## 🔍 需要進一步確認的事項

1. `app/dashboard/test/` 目錄的用途和是否還需要
2. Demo 頁面是否需要在生產環境保留
3. 開發記錄檔案是否需要加入 Git 或保持本地

