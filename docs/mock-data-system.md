# Mock 數據統一管理系統

## 概述

本系統統一管理所有 mock 數據，為後端 API 開發提供參考，並避免重複代碼。

## 架構

```
libs/mock-data/
├── index.ts           # 統一導出和工具函數
├── careers.ts         # 職歷相關 mock 數據
└── applications.ts    # 應募相關 mock 數據
```

## 使用方式

### 基本導入

```typescript
import { getMockCareers, getMockApplications } from "@/libs/mock-data";
```

### 獲取數據

```typescript
// 獲取所有數據
const careers = getMockCareers();
const applications = getMockApplications();

// 根據 ID 獲取單一數據
const career = getMockCareerById("career-001");
const application = getMockApplicationById("app-001");

// 根據狀態篩選
const currentCareers = getMockCareersByStatus("current");
const appliedApplications = getMockApplicationsByStatus("applied");

// 根據用戶 ID 篩選
const userCareers = getMockCareersByUserId("user-001");
const userApplications = getMockApplicationsByUserId("user-001");

// 搜索
const searchResults = searchMockCareers("メルカリ");
const appResults = searchMockApplications("フロントエンド");
```

## 資料庫設計參考

### Careers 表結構

```sql
-- 主要職歷表
CREATE TABLE careers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current', 'left')),
  start_date DATE NOT NULL,  -- YYYY-MM format
  end_date DATE,             -- YYYY-MM format (nullable for current jobs)
  employment_type TEXT NOT NULL,
  offer_salary JSONB,        -- { currency, salaryBreakdown, notes }
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 薪資履歷表
CREATE TABLE salary_history (
  id UUID PRIMARY KEY,
  career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,  -- YYYY-MM format
  currency TEXT NOT NULL,
  position TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 薪資明細表
CREATE TABLE salary_breakdown (
  id UUID PRIMARY KEY,
  salary_history_id UUID NOT NULL REFERENCES salary_history(id) ON DELETE CASCADE,
  salary NUMERIC NOT NULL,  -- 統一用 k 儲存
  salary_type TEXT NOT NULL,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Applications 表結構

```sql
-- 應募表
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  company_url TEXT,
  position TEXT NOT NULL,
  status TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  application_method JSONB NOT NULL,  -- { type, ...fields }
  posted_salary JSONB,                -- { type, minAnnualSalary, maxAnnualSalary, notes }
  desired_salary NUMERIC,             -- 万円単位
  offer_salary JSONB,                 -- { currency, salaryBreakdown, notes }
  tags TEXT[],
  notes TEXT,
  schedule JSONB,                     -- { nextEvent, deadline, interviewMethod }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API 端點設計

### Careers API

```
GET    /api/careers              # 取得用戶所有職歷記錄
GET    /api/careers/:id          # 取得單一職歷記錄（含完整薪資履歷）
POST   /api/careers              # 新增職歷記錄
PUT    /api/careers/:id          # 更新職歷記錄
DELETE /api/careers/:id          # 刪除職歷記錄

GET    /api/careers/:id/salary-history      # 取得薪資履歷
POST   /api/careers/:id/salary-history      # 新增薪資記錄
PUT    /api/salary-history/:historyId       # 更新薪資記錄
DELETE /api/salary-history/:historyId       # 刪除薪資記錄
```

### Applications API

```
GET    /api/applications         # 取得用戶所有應募記錄
GET    /api/applications/:id     # 取得單一應募記錄
POST   /api/applications         # 新增應募記錄
PUT    /api/applications/:id     # 更新應募記錄
DELETE /api/applications/:id     # 刪除應募記錄
```

## 數據範例

### Career 範例

```typescript
{
  id: "career-001",
  companyName: "株式会社メルカリ",
  position: "シニアフロントエンドエンジニア",
  status: "current",
  startDate: "2023-04",
  endDate: undefined,
  employmentType: "full_time",
  offerSalary: {
    currency: "JPY",
    salaryBreakdown: [
      { salary: 8000, salaryType: "基本給" },
      { salary: 2000, salaryType: "賞与" },
      { salary: 1000, salaryType: "手当" }
    ],
    notes: "全額支給"
  },
  tags: ["React", "TypeScript", "フルリモート"],
  notes: "マイクロサービスアーキテクチャの経験を積める環境",
  salaryHistory: [
    {
      yearMonth: "2023-04",
      currency: "JPY",
      position: "シニアフロントエンドエンジニア",
      notes: "入社時",
      salaryBreakdown: [
        { salary: 6000, salaryType: "基本給" },
        { salary: 1500, salaryType: "賞与" },
        { salary: 500, salaryType: "住宅手当" },
        { salary: 500, salaryType: "通勤手当" }
      ]
    }
  ],
  createdAt: "2023-04-01T00:00:00Z",
  updatedAt: "2024-04-01T10:30:00Z"
}
```

### Application 範例

```typescript
{
  id: "app-001",
  userId: "user-001",
  companyName: "株式会社サンプル",
  companyUrl: "https://www.example.com",
  position: "フロントエンドエンジニア",
  status: "casual_interview",
  employmentType: "full_time",
  applicationMethod: {
    type: "job_site",
    siteName: "LinkedIn",
    jobUrl: "https://example.com/job/1"
  },
  postedSalary: {
    type: "annual",
    minAnnualSalary: 600,
    maxAnnualSalary: 800,
    notes: "経験・スキルに応じて優遇"
  },
  desiredSalary: 750,
  offerSalary: undefined,
  tags: ["リモート可", "React", "TypeScript"],
  notes: "リモート勤務可能。技術スタックはReact, TypeScript。",
  schedule: {
    nextEvent: "カジュアル面談",
    deadline: "2025-10-15T14:00:00+09:00",
    interviewMethod: {
      type: "online",
      url: "https://meet.google.com/abc-defg-hij"
    }
  },
  createdAt: "2025-09-28T10:00:00Z",
  updatedAt: "2025-10-05T15:30:00Z"
}
```

## 優勢

1. **統一管理** - 所有 mock 數據集中在一個地方
2. **便於維護** - 只需要在一個地方修改
3. **便於後端開發** - API 開發時可以直接參考數據結構
4. **便於測試** - 統一的測試數據
5. **避免重複** - 多個地方使用相同的數據
6. **類型安全** - 完整的 TypeScript 類型定義

## 遷移指南

### 從內聯 mock 數據遷移

1. 移除文件中的內聯 mock 數據定義
2. 導入統一的 mock 數據函數
3. 使用 `getMockCareers()` 或 `getMockApplications()` 替代

### 範例遷移

```typescript
// 舊方式
const mockCareers: Career[] = [
  { id: "1", companyName: "...", ... },
  // ... 大量內聯數據
];

// 新方式
import { getMockCareers } from "@/libs/mock-data";
const mockCareers = getMockCareers();
```

## 未來擴展

1. **更多數據類型** - 可以添加更多 mock 數據類型
2. **數據生成器** - 可以添加動態生成 mock 數據的功能
3. **環境配置** - 可以根據環境選擇不同的 mock 數據
4. **數據驗證** - 可以添加數據結構驗證
