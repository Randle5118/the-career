# Components Directory Structure

這個目錄包含了所有 React 組件，按照功能和用途進行分類組織。

## 目錄結構

### 📁 `/buttons/` - 按鈕組件
所有按鈕相關的組件，包括：
- `ButtonAccount.tsx` - 帳戶相關按鈕
- `ButtonCheckout.tsx` - 結帳按鈕
- `ButtonSignin.tsx` - 登入按鈕
- `ButtonLead.tsx` - 潛在客戶按鈕
- 等等...

### 📁 `/cards/` - 卡片組件
各種卡片展示組件：
- `CareerCard.tsx` - 職務經歴卡片
- `SideJobCard.tsx` - 副業專用卡片
- `ApplicationCard.tsx` - 應募卡片
- `KanbanCard.tsx` - 看板卡片

### 📁 `/forms/` - 表單組件
表單相關的組件和工具：
- `FormField.tsx` - 通用表單欄位
- `FormRenderer.tsx` - 表單渲染器
- `SalaryBreakdownInput.tsx` - 薪資明細輸入
- `DateRangeInput.tsx` - 日期範圍輸入
- 等等...

### 📁 `/layout/` - 佈局組件
頁面佈局相關組件：
- `Header.tsx` - 頁首
- `Footer.tsx` - 頁尾
- `DashboardNav.tsx` - 儀表板導航
- `LayoutClient.tsx` - 客戶端佈局包裝器

### 📁 `/modals/` - 模態框組件
各種彈出視窗組件：
- `CareerEditModal.tsx` - 職務編輯模態框
- `ApplicationModal.tsx` - 應募模態框
- `Modal.tsx` - 基礎模態框組件
- `CareerModal.tsx` - 職務詳情模態框

### 📁 `/ui/` - 通用 UI 組件
可重用的 UI 組件：
- `CalendarView.tsx` - 日曆視圖
- `KanbanView.tsx` - 看板視圖
- `Tabs.tsx` - 標籤頁組件
- `ApplicationListItem.tsx` - 應募列表項目
- `BetterIcon.tsx` - 圖標組件

### 📁 `/` - 頁面級組件
主要頁面組件（保留在根目錄）：
- `Hero.tsx` - 首頁英雄區塊
- `Pricing.tsx` - 定價頁面
- `FAQ.tsx` - 常見問題
- `Testimonials*.tsx` - 各種推薦組件
- `Features*.tsx` - 功能展示組件

## 使用指南

### Import 路徑
```typescript
// 卡片組件
import CareerCard from "@/components/cards/CareerCard";
import SideJobCard from "@/components/cards/SideJobCard";

// 模態框組件
import { CareerEditModal } from "@/components/modals/CareerEditModal";
import ApplicationModal from "@/components/modals/ApplicationModal";

// 佈局組件
import Header from "@/components/layout/Header";
import DashboardNav from "@/components/layout/DashboardNav";

// UI 組件
import CalendarView from "@/components/ui/CalendarView";
import KanbanView from "@/components/ui/KanbanView";

// 按鈕組件
import ButtonCheckout from "@/components/buttons/ButtonCheckout";
import ButtonSignin from "@/components/buttons/ButtonSignin";
```

### 新增組件指南

1. **確定組件類型**：根據組件功能選擇合適的目錄
2. **遵循命名慣例**：使用 PascalCase 命名
3. **更新 import 路徑**：確保所有引用都使用正確的路徑
4. **更新此 README**：如有新的目錄或重要組件，請更新文檔

### 組件開發原則

- **單一職責**：每個組件只負責一個功能
- **可重用性**：盡量設計為可重用的組件
- **TypeScript**：所有組件都應該有完整的型別定義
- **文檔化**：複雜組件應該有適當的註解和文檔

## 特殊組件說明

### SideJobCard
專為副業管理設計的卡片組件，特色：
- 專注於收入展示和追蹤
- 支援多種副業類型（freelance, contract, part-time）
- 提供收入構成圓餅圖
- 收入歷史追蹤功能

### CareerCard
職務經歴卡片組件，特色：
- 完整的薪資資訊展示
- 薪資歷史時間軸
- 職務詳情和標籤
- 編輯功能整合

### FormRenderer
動態表單渲染器，特色：
- 支援多種表單欄位類型
- 動態表單配置
- 驗證和錯誤處理
- 自定義表單組件支援
