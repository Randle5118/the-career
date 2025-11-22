# Resume Hook 修正總結

## 🐛 問題描述

用戶看到 API 有回傳 resume 資料,但頁面顯示「まだ履歴書がありません」(還沒有履歷)。

## 🔍 根本原因

`useResume` hook 的邏輯與 API 設計不一致:

### API 設計 (已更新為「一個用戶一個履歷」)
```typescript
GET /api/resumes
Response: { data: Resume | null }  // 回傳單一物件
```

### Hook 原有邏輯 (期待陣列)
```typescript
// ❌ 錯誤: 期待 data 是陣列
if (data && data.length > 0) {
  setResume(data[0]);
}
```

**問題**: Hook 檢查 `data.length`,但 API 回傳的是單一物件 (不是陣列),所以永遠不會設定 resume。

---

## ✅ 修正內容

### 1. fetchResume() - 修正資料獲取邏輯

**修正前:**
```typescript
const { data } = await response.json();

// 取得第一個 resume (主要履歷)
if (data && data.length > 0) {
  setResume(data[0]);
} else {
  setResume(null);
}
```

**修正後:**
```typescript
const { data } = await response.json();

// API 回傳單一物件 (一個用戶一個履歷)
// data 可能是 Resume 或 null
setResume(data);
```

---

### 2. updateResume() - 修正更新邏輯

**修正前:**
```typescript
// ❌ 使用 resume.id 在 URL 中
const response = await fetch(`/api/resumes/${resume.id}`, {
  method: 'PUT',
  ...
});
```

**修正後:**
```typescript
// ✅ 不需要 ID,API 會根據認證的用戶自動處理
const response = await fetch('/api/resumes', {
  method: 'PUT',
  ...
});
```

**改進點:**
- 移除了 `if (!resume)` 檢查 (現在即使沒有履歷也可以建立)
- 移除了 `resume` 依賴 (從 useCallback 的依賴陣列)
- 使用 API 回傳的 message

---

### 3. publishResume() - 增強錯誤處理

**改進點:**
```typescript
// ✅ 更好的錯誤處理
const errorData = await response.json().catch(() => ({}));
throw new Error(errorData.error || 'Failed to publish resume');

// ✅ 更靈活的 URL 獲取
const slug = data?.public_url_slug || public_url?.replace('/r/', '');
```

---

## 📊 修正前後對比

### 修正前的資料流

```
API Response: { data: { id: 1, name: "...", ... } }
                     ↓
Hook: if (data.length > 0)  ← ❌ data 不是陣列!
                     ↓
setResume(null)  ← 永遠執行這裡
                     ↓
頁面: 顯示空狀態
```

### 修正後的資料流

```
API Response: { data: { id: 1, name: "...", ... } }
                     ↓
Hook: setResume(data)  ← ✅ 直接設定
                     ↓
setResume({ id: 1, name: "...", ... })
                     ↓
頁面: 顯示履歷內容
```

---

## 🎯 設計一致性

### 「一個用戶一個履歷」設計

**API 層面:**
- `GET /api/resumes` → 回傳單一物件
- `PUT /api/resumes` → 更新或建立 (UPSERT)
- `POST /api/resumes/[id]/publish` → 發布單一履歷

**Hook 層面:**
- `resume: Resume | null` → 單一物件狀態
- `fetchResume()` → 獲取單一履歷
- `updateResume()` → 不需要檢查是否存在

**頁面層面:**
- 顯示單一履歷內容
- 空狀態引導建立第一份履歷
- 不顯示履歷列表

---

## 🧪 測試步驟

1. **刷新頁面**
   - 應該會顯示現有的履歷資料
   - 完整度進度條應該正確顯示

2. **檢查 API**
   - 打開 DevTools Network
   - 確認 `/api/resumes` 回傳 `{ data: { ... } }`

3. **檢查 Console**
   - 不應該有錯誤訊息
   - 應該看到履歷資料被設定

---

## 📍 修改的檔案

- `/libs/hooks/useResume.ts`

## 🔗 相關檔案

- `/app/api/resumes/route.ts` - API endpoint (已更新為單一物件模式)
- `/app/dashboard/resume/page.tsx` - 履歷頁面 (使用 useResume)

---

## 💡 學到的教訓

1. **API 與 Client 一致性**: 修改 API 設計時,必須同步更新所有使用該 API 的 client 端程式碼

2. **型別檢查的重要性**: 如果有更嚴格的型別檢查,這個問題會在編譯時被發現:
   ```typescript
   // 如果 API 回傳型別定義明確
   type GetResumesResponse = { data: Resume | null }
   
   // 則以下程式碼會報錯
   if (data.length > 0)  // ❌ Type Error: Resume 沒有 length 屬性
   ```

3. **測試資料的重要性**: 在有真實資料的情況下測試,可以更早發現這類問題

---

## 🚀 後續改進建議

1. **加強型別定義**:
   ```typescript
   // 定義明確的 API Response 型別
   export type GetResumeResponse = {
     data: Resume | null;
   }
   ```

2. **統一錯誤處理**:
   ```typescript
   // 建立統一的 API client
   async function apiCall<T>(url: string, options?: RequestInit): Promise<T>
   ```

3. **加入單元測試**:
   - 測試 `fetchResume` 在不同 API 回應下的行為
   - 測試空狀態、有資料、錯誤狀態

