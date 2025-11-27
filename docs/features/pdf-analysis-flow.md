# PDF 解析流程（更新版）

## 流程概述

**新流程**：先提取文字 → 使用者確認 → 合併分析

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│ 1. 上傳檔案 │ --> │ 2. 提取文字   │ --> │ 3. 確認內容  │ --> │ 4. AI分析 │
│  (1-5個PDF) │     │  (逐一處理)   │     │  (檢視摘要)  │     │ (一次呼叫)│
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

---

## 優點

### ✅ 相比舊流程的改進

| 項目 | 舊流程 | 新流程 |
|------|--------|--------|
| 處理方式 | 每個 PDF 獨立分析 | 合併後一次分析 |
| API 呼叫次數 | N 次（N = 檔案數） | 1 次 |
| 使用者控制 | 無法預覽文字 | 可以先確認文字提取是否正確 |
| 成本 | 高（多次 API 呼叫） | 低（單次 API 呼叫） |
| 錯誤處理 | 無法區分提取失敗 vs AI 失敗 | 清楚區分兩個階段的錯誤 |
| 資料整合 | 需要手動選擇使用哪個結果 | AI 自動整合多個文件資訊 |

---

## 詳細流程

### 步驟 1：上傳檔案（Upload）

**使用者操作**：
- 拖拉放置或點擊選擇 1-5 個 PDF 檔案
- 檔案會顯示在列表中，狀態為「待機中」

**系統行為**：
- 驗證檔案類型（僅接受 PDF）
- 檢查數量限制（最多 5 個）
- 建立 `FileItem` 物件

```typescript
interface FileItem {
  id: string;
  file: File;
  status: "pending" | "extracting" | "extracted" | "error";
  extractedText?: string;
  textLength?: number;
  error?: string;
}
```

---

### 步驟 2：提取文字（Extracting）

**觸發**：使用者點擊「テキストを抽出」按鈕

**處理邏輯**：
```typescript
for (const fileItem of files) {
  // 1. 更新狀態為「提取中」
  setStatus(fileItem.id, "extracting");
  
  // 2. Client-side 提取（使用 pdfjs-dist）
  const text = await extractTextFromPdf(fileItem.file);
  
  // 3. 檢查文字是否為空
  if (!text || text.trim().length === 0) {
    setStatus(fileItem.id, "error", "テキストを抽出できませんでした");
    continue;
  }
  
  // 4. 成功：儲存文字和字數
  setStatus(fileItem.id, "extracted", { text, length: text.length });
}
```

**顯示資訊**：
- ✅ 提取完成：顯示文字長度（例如：`3,245 文字`）
- ❌ 提取失敗：顯示錯誤訊息和「再試行」按鈕

---

### 步驟 3：確認內容（Review）

**提取完成後自動進入此步驟**

**顯示內容**：
```
[INFO] 3個のファイルからテキストを抽出しました
合計 8,734 文字 • AI解析を開始しますか？
```

**使用者選項**：
1. **繼續解析**：點擊「AI解析を開始」
2. **移除失敗檔案**：點擊個別檔案的刪除按鈕
3. **重試失敗檔案**：點擊「再試行」按鈕
4. **取消**：關閉視窗

---

### 步驟 4：AI 解析（Analyzing）

**合併文字邏輯**：

#### 單一檔案
```typescript
combinedText = files[0].extractedText;
```

#### 多個檔案
```typescript
combinedText = files
  .map((f, index) => {
    const header = `\n\n========== ファイル ${index + 1}: ${f.file.name} ==========\n\n`;
    return header + f.extractedText;
  })
  .join("\n\n");
```

**呼叫 AI**：
```typescript
const result = await analyzeResumeAction(
  combinedText,
  files.length === 1 ? files[0].file.name : `${files.length}個のファイル`
);
```

**處理結果**：
- ✅ 成功：顯示「解析完了！」→ 自動關閉視窗
- ❌ 失敗：顯示錯誤訊息 → 返回「Review」步驟可重試

---

## 錯誤處理

### 文字提取階段錯誤

| 錯誤類型 | 原因 | 解決方法 |
|---------|------|---------|
| 空白 PDF | PDF 沒有文字內容 | 檢查是否為掃描版 PDF |
| 加密 PDF | PDF 有密碼保護 | 移除密碼後重新上傳 |
| 損壞檔案 | PDF 檔案損壞 | 使用其他 PDF 閱讀器修復 |
| 記憶體不足 | PDF 太大 | 分割 PDF 或壓縮檔案大小 |

**系統行為**：
- 單一檔案失敗不影響其他檔案
- 使用者可以選擇「再試行」或「刪除」失敗檔案
- 至少有一個成功提取才能進入 Review 階段

---

### AI 解析階段錯誤

| 錯誤代碼 | 錯誤訊息 | 可重試 | 解決方法 |
|---------|---------|-------|---------|
| `AI_NOT_CONFIGURED` | AI解析サービスが設定されていません | ❌ | 設定 OPENAI_API_KEY |
| `AI_QUOTA_EXCEEDED` | 利用枠が上限に達しました | ❌ | 充值 OpenAI 帳戶 |
| `AI_RATE_LIMIT` | サービスが混み合っています | ✅ | 等待幾分鐘後重試 |
| `AI_API_ERROR` | エラーが発生しました | ✅ | 檢查網路連線後重試 |

**系統行為**：
- 顯示友善的錯誤訊息
- 可重試的錯誤會顯示「AI解析を開始」按鈕
- 不可重試的錯誤需要修正設定

---

## UI 狀態機

```
[Upload] ──(選擇檔案)──> [Upload] ──(點擊提取)──> [Extracting]
                            ↑                           ↓
                            │                      (提取完成)
                            │                           ↓
                      (關閉視窗) <──────────────── [Review]
                                                       ↓
                                                 (點擊解析)
                                                       ↓
                                                 [Analyzing]
                                                   ↙     ↘
                                            (成功)      (失敗)
                                               ↓          ↓
                                          [Complete] [Review]
                                               ↓
                                          (自動關閉)
```

---

## 合併分析的 AI Prompt 優勢

### 單檔案 vs 多檔案

**單檔案**：
```
直接解析單一文件內容
```

**多檔案**（AI 可以看到所有資訊）：
```
========== ファイル 1: 2020-resume.pdf ==========
[2020年的履歷內容...]

========== ファイル 2: 2023-resume.pdf ==========
[2023年的履歷內容...]

========== ファイル 3: portfolio.pdf ==========
[作品集內容...]
```

### AI 的智能整合

AI 可以：
1. **自動去重**：同一公司/學歷只記錄一次
2. **補充資訊**：舊履歷沒寫的職位，新履歷有寫
3. **時間軸排序**：自動按時間排序工作經歷
4. **整合技能**：合併多份文件中的技能列表
5. **選擇最新資訊**：同一欄位有不同版本時選擇最新的

---

## 成本對比

### 假設：3 個 PDF，每個約 3000 tokens

#### 舊流程（分開分析）
```
API 呼叫 1: 3000 input + 1500 output = $0.025
API 呼叫 2: 3000 input + 1500 output = $0.025
API 呼叫 3: 3000 input + 1500 output = $0.025
-------------------------------------------------
總成本: $0.075
```

#### 新流程（合併分析）
```
API 呼叫 1: 9000 input + 1500 output = $0.0375
-------------------------------------------------
總成本: $0.0375 (省下 50%)
```

---

## 開發者說明

### 關鍵函數

#### `handleExtractAll()`
```typescript
// 依序提取所有 PDF 文字
for (const fileItem of files) {
  const text = await extractTextFromPdf(fileItem.file);
  // 更新狀態...
}
```

#### `handleAnalyze()`
```typescript
// 合併文字並呼叫 AI
const combinedText = files
  .filter(f => f.status === "extracted")
  .map(f => f.extractedText)
  .join("\n\n");

const result = await analyzeResumeAction(combinedText);
```

### 狀態管理

```typescript
const [step, setStep] = useState<Step>("upload");
// "upload" | "extracting" | "review" | "analyzing" | "complete"

const [files, setFiles] = useState<FileItem[]>([]);
// 每個 FileItem 獨立追蹤狀態
```

---

## 測試場景

### 場景 1：單一檔案
```
1. 上傳 1 個 PDF
2. 提取文字成功
3. Review 顯示文字長度
4. AI 解析成功
5. 資料自動填入表單
```

### 場景 2：多檔案成功
```
1. 上傳 3 個 PDF
2. 全部提取成功
3. Review 顯示「3個のファイル、合計 X 文字」
4. AI 解析成功，資料合併
5. 資料自動填入表單
```

### 場景 3：部分失敗
```
1. 上傳 3 個 PDF
2. 其中 1 個提取失敗
3. Review 顯示 2 個成功 + 1 個失敗
4. 使用者選擇「再試行」或「刪除」失敗檔案
5. 繼續解析成功的 2 個檔案
```

### 場景 4：AI 解析失敗
```
1. 提取成功
2. AI 解析失敗（例如：rate limit）
3. 顯示錯誤訊息
4. 返回 Review 階段
5. 使用者可以重試
```

---

## 相關檔案

- `components/resume/PdfImporterModal.tsx` - 主要組件
- `libs/pdf/extract-text.ts` - PDF 文字提取
- `app/actions/analyze-resume.ts` - AI 解析 Server Action
- `app/dashboard/resume/edit/page.tsx` - 資料映射邏輯

---

## 未來改進

### 短期
- [ ] 支援預覽提取的文字內容
- [ ] 顯示每個檔案的提取進度（%）
- [ ] 支援調整檔案順序（影響合併順序）

### 中期
- [ ] 支援選擇性分析（勾選要分析的檔案）
- [ ] 支援編輯提取的文字（修正錯誤）
- [ ] 顯示 AI 分析進度和預估時間

### 長期
- [ ] OCR 支援（掃描版 PDF）
- [ ] 支援 Word、圖片等格式
- [ ] 批次匯入多份履歷



