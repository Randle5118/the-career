# PDF 多檔案上傳功能

## 功能概述

允許使用者一次上傳最多 5 個 PDF 檔案，批次進行 AI 解析並提取履歷資訊。

## 主要特性

### 1. 多檔案上傳
- **最大數量**: 5 個 PDF 檔案
- **支援方式**: 
  - 拖拉放置 (Drag & Drop)
  - 點擊選擇檔案
  - 支援一次選擇多個檔案

### 2. 檔案狀態追蹤
每個上傳的檔案都有獨立的狀態顯示：

| 狀態 | 圖示 | 說明 |
|------|------|------|
| `pending` | 📄 | 等待處理 |
| `extracting` | ⏳ | 正在提取 PDF 文字 |
| `analyzing` | 🤖 | AI 正在解析中 |
| `complete` | ✅ | 解析完成 |
| `error` | ❌ | 解析失敗 |

### 3. 進度顯示
- 文字提取階段: 0% → 40%
- AI 解析階段: 40% → 100%
- 即時進度條更新

### 4. 錯誤處理
- **可重試錯誤**: 顯示「再試行」按鈕
- **不可重試錯誤**: 僅顯示錯誤訊息
- 失敗的檔案可以單獨刪除或重試

### 5. 批次處理
- 依序處理所有檔案（非並行）
- 避免同時對 OpenAI API 發送大量請求
- 每個檔案完成後才處理下一個

## 使用流程

### 步驟 1: 選擇檔案
```
1. 點擊上傳區域或拖拉 PDF 檔案
2. 可以一次選擇 1-5 個 PDF 檔案
3. 系統會自動過濾非 PDF 檔案
```

### 步驟 2: 檢查檔案列表
```
- 查看已選擇的檔案
- 可以刪除不需要的檔案
- 確認檔案數量不超過 5 個
```

### 步驟 3: 開始解析
```
點擊「X個のファイルを解析」按鈕
系統會依序處理所有檔案
```

### 步驟 4: 監控進度
```
- 每個檔案顯示當前處理狀態
- 進度條顯示處理進度
- 錯誤檔案會顯示錯誤訊息
```

### 步驟 5: 應用資料
```
- 處理完成後，點擊「データを取り込む」
- 系統會將解析結果填入表單
```

## 技術實作

### 資料結構

```typescript
interface FileItem {
  id: string;                    // 唯一識別碼
  file: File;                    // 原始檔案物件
  status: "pending" | "extracting" | "analyzing" | "complete" | "error";
  extractedText?: string;        // 提取的文字
  parsedData?: any;              // AI 解析結果
  error?: {
    message: string;
    isRetryable: boolean;
    errorCode?: string;
  };
  progress?: number;             // 0-100
}
```

### 處理流程

```typescript
for (const fileItem of files) {
  // 1. 提取 PDF 文字 (Client-side)
  const text = await extractTextFromPdf(file);
  
  // 2. AI 解析 (Server-side)
  const result = await analyzeResumeAction(text, file.name);
  
  // 3. 更新狀態
  updateFileStatus(fileItem.id, result);
}
```

### 狀態管理

```typescript
const [files, setFiles] = useState<FileItem[]>([]);
const [step, setStep] = useState<"upload" | "processing" | "complete">("upload");
```

## UI 設計

### 上傳區域
```tsx
<div className="border-dashed border-2 p-8">
  <Upload icon />
  <p>PDFファイルをドラッグ＆ドロップ</p>
  <p>最大5個のPDFファイル • 現在: {files.length}/5</p>
</div>
```

### 檔案列表
```tsx
{files.map(file => (
  <div className="file-item">
    <StatusIcon status={file.status} />
    <FileName>{file.name}</FileName>
    <StatusText>{getStatusText(file.status)}</StatusText>
    {file.error && <ErrorMessage />}
    {file.progress && <ProgressBar value={file.progress} />}
    <Actions>
      {file.error?.isRetryable && <RetryButton />}
      <RemoveButton />
    </Actions>
  </div>
))}
```

## 限制與注意事項

### 限制
1. **最大檔案數**: 5 個
2. **檔案類型**: 僅支援 PDF
3. **處理方式**: 依序處理（非並行）
4. **檔案大小**: 受瀏覽器和 PDF.js 限制

### 注意事項
1. **API 配額**: 多個檔案會消耗更多 OpenAI API 配額
2. **處理時間**: 5 個檔案可能需要 1-2 分鐘
3. **記憶體使用**: 同時載入多個 PDF 會佔用較多記憶體
4. **資料合併**: 目前僅使用第一個成功檔案的資料

## 未來改進

### 短期
- [ ] 支援並行處理（最多 2-3 個同時處理）
- [ ] 顯示預估剩餘時間
- [ ] 支援拖拉調整檔案順序

### 中期
- [ ] 智能合併多個 PDF 的解析結果
- [ ] 檔案預覽功能
- [ ] 支援更大的檔案（分頁處理）

### 長期
- [ ] 支援其他格式（Word、圖片等）
- [ ] OCR 支援掃描 PDF
- [ ] 批次匯出功能

## 相關檔案

- `components/resume/PdfImporterModal.tsx` - 主要組件
- `libs/pdf/extract-text.ts` - PDF 文字提取
- `app/actions/analyze-resume.ts` - AI 解析 Server Action
- `docs/setup-openai-api.md` - OpenAI API 設定指南

## 錯誤處理

### 常見錯誤

| 錯誤類型 | 訊息 | 解決方法 |
|---------|------|---------|
| 檔案類型錯誤 | PDFファイルのみアップロード可能です | 只上傳 PDF 檔案 |
| 超過數量 | 最大5個のファイルまでアップロード可能です | 移除部分檔案 |
| 文字提取失敗 | テキストを抽出できませんでした | 檢查 PDF 是否為圖片掃描版 |
| AI 解析失敗 | AI解析サービスでエラーが発生しました | 檢查 API 配額和網路連線 |

## 測試指南

### 單一檔案測試
```
1. 上傳 1 個 PDF
2. 確認解析成功
3. 確認資料正確填入表單
```

### 多檔案測試
```
1. 上傳 3-5 個 PDF
2. 確認每個檔案獨立追蹤狀態
3. 確認依序處理
4. 測試失敗檔案的重試功能
```

### 錯誤測試
```
1. 上傳非 PDF 檔案 → 應該被過濾
2. 上傳超過 5 個檔案 → 應該顯示錯誤
3. 上傳空白 PDF → 應該顯示文字提取錯誤
4. 測試 API 錯誤 → 應該顯示可重試按鈕
```

### 邊界測試
```
1. 上傳極大的 PDF (>50MB)
2. 上傳非常多頁的 PDF (>100頁)
3. 上傳加密的 PDF
4. 上傳含有圖片的 PDF
```

