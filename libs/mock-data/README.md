# Mock Data System

## 概述

這是 Cafka 專案的 Mock 數據統一管理系統，用於開發和測試階段。每個 mock 數據檔案代表未來 Supabase 資料庫中的一個表。

## 統一規範

### Mock User ID
所有 mock 數據使用統一的測試用戶 UUID:
```
550e8400-e29b-41d4-a716-446655440000
```

這個 UUID 模擬未來 Supabase Auth 系統中的真實用戶 ID。

### 檔案結構

```
libs/mock-data/
├── index.ts           # 統一匯出和工具函數
├── applications.ts    # 應募數據 (7 個範例)
├── careers.ts         # 職涯歷史數據 (4 個範例)
├── side-jobs.ts       # 副業數據 (4 個範例)
├── resumes.ts         # 履歷數據 (1 個範例)
└── README.md          # 本文件
```

## 薪資單位規則

### Applications 表
使用 **「万円」** (萬日圓) 為單位:

```typescript
postedSalary: {
  minAnnualSalary: 600,  // = 600万円 = 6,000,000円
  maxAnnualSalary: 800,  // = 800万円 = 8,000,000円
}

desiredSalary: 750  // = 750万円 = 7,500,000円

offerSalary: {
  salaryBreakdown: [
    { salary: 800, salaryType: "基本給" },  // = 800万円
    { salary: 200, salaryType: "賞与" },    // = 200万円
  ]
}
```

### Careers / Side Jobs 表
使用 **「k」** (千円) 為單位:

```typescript
offerSalary: {
  salaryBreakdown: [
    { salary: 8000, salaryType: "基本給" },  // = 8000千円 = 800万円 = 8,000,000円
    { salary: 2000, salaryType: "賞与" },    // = 2000千円 = 200万円 = 2,000,000円
  ]
}
```

### 轉換關係

| k 單位 | 万円單位 | 日圓 |
|--------|----------|------|
| 1k     | 0.1万円  | 1,000円 |
| 10k    | 1万円    | 10,000円 |
| 100k   | 10万円   | 100,000円 |
| 1000k  | 100万円  | 1,000,000円 |
| 8000k  | 800万円  | 8,000,000円 |

## 數據關係

### Applications (應募)
- **用途**: 記錄求職應募過程
- **特點**: 
  - 包含應募方法 (求人サイト、紹介、直接)
  - 掲載給与 vs 希望給与 vs 內定給与
  - 日程管理 (面接、書類選考)
- **狀態**: bookmarked → applied → interview → offer / rejected

### Careers (職涯歷史)
- **用途**: 記錄實際工作經歷和薪資變化
- **特點**:
  - 完整的薪資歷史追蹤
  - 內部紀錄用，包含詳細薪資資訊
  - 支援薪資調整記錄
- **狀態**: current (現職) / left (離職)

### Side Jobs (副業)
- **用途**: 記錄副業/兼職/自由業
- **特點**:
  - 與 Careers 使用相同的數據結構
  - 但獨立管理，方便區分主業與副業
  - 支援多個同時進行的副業

### Resume (履歷)
- **用途**: 對外展示用的履歷書
- **特點**:
  - 可從 Careers 自動生成或手動輸入
  - 包含個人資訊、學歷、工作經歷、技能等
  - 支援公開分享 (public_url_slug)

## 使用方式

### 基本導入
```typescript
import {
  MOCK_USER_ID,
  MOCK_APPLICATIONS_FULL,
  MOCK_CAREERS_FULL,
  MOCK_SIDE_JOBS,
  MOCK_RESUME,
} from "@/libs/mock-data";
```

### 工具函數
```typescript
// 根據狀態篩選
const interviews = getMockApplicationsByStatus("interview");
const currentJobs = getMockCareersByStatus("current");

// 根據用戶 ID 篩選
const userApps = getMockApplicationsByUserId(MOCK_USER_ID);
const userResume = getMockResumeByUserId(MOCK_USER_ID);

// 搜索功能
const results = searchMockApplications("エンジニア");

// 根據 ID 獲取單一數據
const app = getMockApplicationById("app-001");
const career = getMockCareerById("career-001");
```

## 資料庫遷移準備

每個 mock 檔案底部都有詳細的資料庫設計註解，包含:

1. **表結構** (Table Schema)
   - 欄位定義
   - 資料型別
   - 約束條件

2. **索引建議** (Indexes)
   - 常用查詢的索引
   - 效能優化建議

3. **RLS 政策** (Row Level Security)
   - 基於 user_id 的存取控制
   - SELECT / INSERT / UPDATE / DELETE 規則

### 範例: Applications 表

```sql
-- 詳細的 SQL schema 請參考各個 mock 檔案底部的註解
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  company_name text NOT NULL,
  position text NOT NULL,
  status text NOT NULL,
  -- ... 其他欄位
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS 啟用
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS 政策
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);
```

## 資料品質

### 已完成的品質改善 ✅

1. **統一 User ID 格式**
   - 所有表統一使用 UUID: `550e8400-e29b-41d4-a716-446655440000`
   - 符合 Supabase Auth 的格式

2. **修正時間戳記**
   - app-007 的時間從 2023 更正為 2025

3. **清楚的薪資單位註解**
   - Applications: 万円單位
   - Careers/Side Jobs: k 單位
   - 完整的轉換對照表

### 待改善項目 (可選)

1. **增加多用戶測試數據**
   - 目前只有一個測試用戶
   - 可考慮新增 2-3 個虛構用戶

2. **資料驗證工具**
   - 自動檢查型別是否正確
   - 檢查必填欄位完整性

3. **測試數據生成器**
   - 快速生成大量測試數據
   - 用於壓力測試和效能測試

## 注意事項

1. **不要在 production 使用 mock data**
   - 這些數據僅用於開發和測試
   - Production 環境應使用真實的 Supabase 資料庫

2. **保持數據同步**
   - 當型別定義改變時，記得更新對應的 mock data
   - 當新增欄位時，在所有範例中保持一致

3. **隱私考量**
   - Resume mock data 基於真實履歷
   - 如需公開分享專案，考慮替換成虛構資料

## 相關文件

- [TypeScript Types](../../types/README.md)
- [Career Modal System](../../docs/career-modal-system.md)
- [Resume Feature](../../docs/resume-feature.md)

---

最後更新: 2025-10-27

