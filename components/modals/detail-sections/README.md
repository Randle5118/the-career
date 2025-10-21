# ApplicationDetailModal Sections

這個目錄包含 ApplicationDetailModal 的各個區塊組件。

## 組件結構

```
detail-sections/
├── BasicInfoSection.tsx    # 基本情報區塊
└── ScheduleSection.tsx     # 日程管理區塊
```

## BasicInfoSection.tsx

顯示應募的基本情報，包括：

- **公司情報**
  - 公司名
  - 職種
  - 雇用形態

- **應募方式**
  - 求人サイト / ヘッドハンター / 紹介 / 直接応募 / リクルーター

- **給与情報**
  - 掲載給与
  - 希望給与
  - オファー給与

- **タグ**
  - 技能、特性等標籤

- **メモ**
  - 自由記錄的備考

## ScheduleSection.tsx

顯示應募的日程相關情報，包括：

- **次回イベント**
  - 活動名稱
  - 期日（含期限切れ警告）

- **面接方法**
  - オンライン面接（含 URL）
  - 対面面接（含地址）

## 使用方式

這些組件會在 `ApplicationDetailModal` 中作為 Tab 內容使用：

```typescript
import BasicInfoSection from "./detail-sections/BasicInfoSection";
import ScheduleSection from "./detail-sections/ScheduleSection";

// 在 Modal 中使用
<BasicInfoSection application={application} />
<ScheduleSection application={application} />
```

## 設計原則

1. **自包含**：每個 Section 都是獨立的，可單獨使用
2. **一致性**：使用相同的樣式和佈局模式
3. **響應式**：適應不同螢幕尺寸
4. **可訪問性**：使用語義化 HTML 和適當的圖示

