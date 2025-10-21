# Career Modal 系統

## 概述

Career 系統已經從單頁面編輯改為 modal 編輯，使用新的配置化表單系統，提供更好的用戶體驗和代碼維護性。

## 主要改進

### 1. 從單頁面到 Modal 的轉換
- **舊方式**: 導航到 `/dashboard/my-career/new` 或 `/dashboard/my-career/[id]/edit`
- **新方式**: 使用 `CareerEditModal` 組件進行內聯編輯

### 2. 配置化表單系統
- 使用 `createCareerFormConfig()` 生成表單配置
- 支援 Tab 版結構（基本情報・給与情報）
- 統一的 Stripe 風格設計

### 3. 專門組件
- **`OfferSalarySection`** - 處理オファー給与
- **`SalaryHistorySection`** - 處理給与履歴
- **`DateRangeInput`** - 處理日期範圍

## 使用方法

### 在主頁面中使用

```tsx
import { CareerEditModal } from "@/components/CareerEditModal";

export default function MyCareerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingCareerId, setEditingCareerId] = useState<string | null>(null);

  const handleAddNew = () => {
    setEditingCareer(null);
    setEditingCareerId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setEditingCareerId(career.id);
    setIsModalOpen(true);
  };

  const handleCareerSave = async (
    careerId: string | null, 
    data: CareerFormData, 
    salaryHistory: SalaryChange[], 
    offerSalary?: OfferSalary
  ) => {
    // 處理保存邏輯
    if (careerId) {
      // 更新現有職歴
    } else {
      // 新增職歴
    }
  };

  return (
    <div>
      {/* 頁面內容 */}
      
      <CareerEditModal
        isOpen={isModalOpen}
        careerId={editingCareerId}
        career={editingCareer}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCareerSave}
      />
    </div>
  );
}
```

## 技術優勢

### 1. 更好的用戶體驗
- 無需頁面跳轉
- 保持上下文狀態
- 更快的響應速度

### 2. 代碼簡化
- 減少了路由複雜性
- 統一的表單處理邏輯
- 更好的狀態管理

### 3. 維護性提升
- 配置化的表單結構
- 可重用的組件
- 統一的設計語言

## 遷移指南

### 從舊的單頁面系統遷移

1. **移除路由導航**:
   ```tsx
   // 舊方式
   const handleEdit = (career: Career) => {
     router.push(`/dashboard/my-career/${career.id}/edit`);
   };

   // 新方式
   const handleEdit = (career: Career) => {
     setEditingCareer(career);
     setEditingCareerId(career.id);
     setIsModalOpen(true);
   };
   ```

2. **添加 Modal 狀態**:
   ```tsx
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingCareer, setEditingCareer] = useState<Career | null>(null);
   const [editingCareerId, setEditingCareerId] = useState<string | null>(null);
   ```

3. **實現保存邏輯**:
   ```tsx
   const handleCareerSave = async (careerId, data, salaryHistory, offerSalary) => {
     // 處理新增或更新邏輯
   };
   ```

## 文件結構

```
components/
├── CareerEditModal.tsx          # 主要的 Modal 組件
├── forms/
│   ├── OfferSalarySection.tsx   # オファー給与組件
│   ├── SalaryHistorySection.tsx # 給与履歴組件
│   └── ...                      # 其他表單組件
```

## 樣式統一

### Modal 背景樣式
Career Modal 和 Application Modal 現在使用統一的樣式：

- **背景可見**: 使用 DaisyUI 的 `modal-backdrop` 類別，背景不會完全遮蓋
- **統一樣式**: 兩個 modal 使用相同的標題欄、關閉按鈕和佈局
- **響應式設計**: 適配不同螢幕尺寸，最大寬度為 4xl

### 技術實現
```tsx
// 統一的 modal 結構
<div className="modal modal-open">
  <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto p-0">
    {/* 標題欄 */}
    <div className="sticky top-0 bg-base-100 border-b border-base-300 px-6 py-4 z-10">
      {/* 標題和關閉按鈕 */}
    </div>
    
    {/* 表單內容 */}
    <div className="px-6 py-6">
      {/* 表單組件 */}
    </div>
  </div>
  <div className="modal-backdrop" onClick={handleClose} />
</div>
```

## 未來改進

1. **動畫效果**: 添加更流暢的 modal 動畫
2. **鍵盤導航**: 支援 ESC 鍵關閉 modal
3. **表單驗證**: 更詳細的驗證規則
4. **自動保存**: 定期自動保存草稿
5. **離線支援**: 支援離線編輯和同步

## 注意事項

1. **類型安全**: 確保 tags 字段的類型轉換正確處理
2. **狀態管理**: 適當清理 modal 狀態
3. **錯誤處理**: 提供用戶友好的錯誤提示
4. **性能**: 大型表單時考慮虛擬化或分頁
