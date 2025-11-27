# OpenAI API 設定指南

## 功能說明

PDF 履歷解析功能使用 OpenAI GPT-4o 來自動分析履歷內容，並將其轉換為結構化資料。

## 設定步驟

### 1. 取得 OpenAI API Key

1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 註冊或登入帳號
3. 前往 [API Keys 頁面](https://platform.openai.com/api-keys)
4. 點擊「Create new secret key」
5. 複製產生的 API Key（只會顯示一次！）

### 2. 設定環境變數

在專案根目錄的 `.env.local` 檔案中加入：

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 檢查額度

1. 前往 [Billing 頁面](https://platform.openai.com/account/billing/overview)
2. 確認你有足夠的額度（免費額度或付費方案）
3. 設定用量警示（建議）

## 費用說明

### GPT-4o 價格（2024 年）

- **Input**: $2.50 / 1M tokens
- **Output**: $10.00 / 1M tokens

### 估算使用成本

一份履歷解析大約使用：

- Input: ~3,000 tokens（履歷內容 + System Prompt）
- Output: ~1,500 tokens（結構化 JSON）

**單次解析成本**: 約 $0.02 - $0.03 USD

**100 次解析**: 約 $2 - $3 USD

## 常見錯誤

### 1. `insufficient_quota` 錯誤

**錯誤訊息**:

```
You exceeded your current quota, please check your plan and billing details.
```

**原因**: OpenAI 帳號額度不足

**解決方法**:

1. 前往 [Billing 頁面](https://platform.openai.com/account/billing/overview)
2. 檢查餘額
3. 添加付款方式或充值
4. 如果是免費額度已用完，需要升級到付費方案

### 2. `rate_limit_exceeded` 錯誤

**錯誤訊息**:

```
Rate limit exceeded
```

**原因**: 請求頻率過高

**解決方法**:

- 等待幾分鐘後再試
- 考慮升級到更高層級的方案

### 3. `invalid_api_key` 錯誤

**原因**: API Key 錯誤或過期

**解決方法**:

1. 檢查 `.env.local` 中的 `OPENAI_API_KEY` 是否正確
2. 確認 API Key 沒有多餘的空格或換行
3. 重新產生新的 API Key

## 測試

設定完成後，重新啟動開發伺服器：

```bash
npm run dev
```

在履歷編輯頁面上傳 PDF 檔案，應該會看到：

```
[AnalyzeResume] Processing file: example.pdf, text length: 3311, User: xxx
[AnalyzeResume] OpenAI API call successful
```

## 備選方案

如果你不想使用 OpenAI 的付費服務，可以考慮：

1. **Azure OpenAI Service**: 企業級方案，可能有更好的額度管理
2. **Google Gemini**: 類似功能，價格可能更便宜
3. **Anthropic Claude**: 另一個 AI 服務提供商
4. **本地模型**: 使用 Ollama 等工具運行本地 LLM（免費但需要硬體資源）

## 安全注意事項

⚠️ **重要**:

- 絕對不要將 `.env.local` 提交到 Git
- 不要在前端程式碼中使用 API Key
- 定期輪換 API Key
- 設定用量警示避免意外費用
- 使用環境變數管理敏感資訊

## 相關檔案

- `app/actions/analyze-resume.ts` - AI 解析的 Server Action
- `components/resume/PdfImporterModal.tsx` - PDF 上傳 UI
- `libs/pdf/extract-text.ts` - PDF 文字提取邏輯
