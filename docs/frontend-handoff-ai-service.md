# 🔄 AI Service 重構 - 前端交接文件

> 更新日期: 2024-11
> 後端負責人: Backend Engineer

---

## 📋 變更摘要

後端已完成 AI 服務架構重構，**統一了所有 AI 相關功能**。主要變更：

| 項目          | 變更前                  | 變更後                         |
| ------------- | ----------------------- | ------------------------------ |
| 履歷解析      | `/api/ai/resume-parser` | ✅ **不變** (內部重構)         |
| JD 解析       | n8n webhook             | ✅ `/api/ai/parse-job-posting` |
| Server Action | `analyzeResumeAction`   | ✅ **不變** (內部重構)         |

---

## 🎯 前端影響範圍

### ✅ 不需要改動

1. **履歷解析功能** - API 介面完全不變

   ```typescript
   // 現有程式碼不需要改動
   const response = await fetch("/api/ai/resume-parser", {
     method: "POST",
     body: JSON.stringify({ textContent: pdfText }),
   });
   ```

2. **Server Action** - 介面不變
   ```typescript
   // 現有程式碼不需要改動
   import { analyzeResumeAction } from "@/app/actions/analyze-resume";
   const result = await analyzeResumeAction(text, fileName);
   ```

### ⚠️ 可能需要調整

如果有使用 n8n webhook 來解析 Job Description，請改用新的 API。

---

## 📡 API 規格

### 1. 履歷解析 `/api/ai/resume-parser`

**請求:**

```typescript
POST /api/ai/resume-parser
Content-Type: application/json

{
  "textContent": string  // PDF 轉換後的純文字
}
```

**成功回應:**

```typescript
{
  "success": true,
  "data": {
    "name_kanji": string | null,
    "name_kana": string | null,
    "name_romaji": string | null,
    "birth_date": string | null,      // YYYY-MM-DD
    "age": number | null,
    "gender": string | null,
    "phone": string | null,
    "email": string | null,
    "address_line": string | null,
    "linkedin_url": string | null,
    "github_url": string | null,
    "portfolio_url": string | null,
    "career_summary": string | null,
    "self_pr": string | null,
    "education": Education[],
    "work_experience": WorkExperience[],
    "skills": Skill[],
    "languages": Language[],
    "certifications": Certification[],
    "awards": Award[]
  }
}
```

**Rate Limit:** 每用戶每分鐘 5 次

---

### 2. Job Description 解析 `/api/ai/parse-job-posting` 🆕

> ⚠️ **新功能** - 取代原本的 n8n webhook

**請求:**

```typescript
POST /api/ai/parse-job-posting
Content-Type: application/json

{
  "textContent": string,   // JD 純文字 (必填)
  "fileName": string       // 檔案名稱 (選填，用於 log)
}
```

**成功回應:**

```typescript
{
  "success": true,
  "data": {
    // 公司資訊
    "company_name": string | null,
    "company_url": string | null,
    "company_description": string | null,

    // 職位資訊
    "position_title": string | null,
    "department": string | null,
    "employment_type": string | null,  // "正社員", "契約社員", etc.
    "work_location": string | null,
    "remote_policy": string | null,    // "フルリモート", "ハイブリッド", etc.

    // 工作內容
    "job_description": string | null,
    "responsibilities": string[],
    "requirements": string[],          // 必須條件
    "preferred_qualifications": string[],  // 歡迎條件

    // 薪資福利
    "salary_range": {
      "min": number | null,  // 萬円單位
      "max": number | null,
      "currency": "JPY",
      "type": "annual"
    } | null,
    "benefits": string[],

    // 其他
    "application_deadline": string | null,  // YYYY-MM-DD
    "start_date": string | null,
    "tags": string[]  // AI 自動提取的標籤
  }
}
```

**Rate Limit:** 每用戶每分鐘 5 次

---

### 3. Server Action `analyzeResumeAction`

```typescript
import { analyzeResumeAction } from "@/app/actions/analyze-resume";

// 用法 (不變)
const result = await analyzeResumeAction(text, fileName);

// 回傳型別
interface AIServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: AIErrorCode;
  isRetryable?: boolean;
}
```

---

## ❌ 錯誤處理

### 錯誤碼對照表

| errorCode           | HTTP Status | 說明               | 前端建議處理       |
| ------------------- | ----------- | ------------------ | ------------------ |
| `UNAUTHORIZED`      | 401         | 未登入             | 導向登入頁         |
| `VALIDATION_ERROR`  | 400         | 輸入格式錯誤       | 顯示錯誤訊息       |
| `AI_NOT_CONFIGURED` | 500         | 後端未設定 API Key | 聯繫管理員         |
| `AI_QUOTA_EXCEEDED` | 503         | OpenAI 額度用完    | 聯繫管理員         |
| `AI_RATE_LIMIT`     | 429         | 請求太頻繁         | 顯示「請稍後再試」 |
| `AI_API_ERROR`      | 502         | OpenAI 服務錯誤    | 可重試             |
| `EMPTY_RESPONSE`    | 502         | AI 回應為空        | 可重試             |
| `JSON_PARSE_ERROR`  | 502         | AI 回應格式錯誤    | 可重試             |

### 錯誤回應格式

```typescript
// API Route 錯誤回應
{
  "error": "AI_RATE_LIMIT",
  "message": "AI解析サービスが混み合っています。数分後に再度お試しください。",
  "isRetryable": true
}

// Server Action 錯誤回應
{
  "success": false,
  "error": "AI解析サービスが混み合っています。数分後に再度お試しください。",
  "errorCode": "AI_RATE_LIMIT",
  "isRetryable": true
}
```

### 建議的前端錯誤處理

```typescript
const result = await parseResume(text);

if (!result.success) {
  if (result.errorCode === "UNAUTHORIZED") {
    router.push("/signin");
    return;
  }

  if (result.isRetryable) {
    toast.error(result.error + " 再度お試しください。");
  } else {
    toast.error(result.error);
  }
  return;
}

// 成功處理
const parsedData = result.data;
```

---

## 📊 Rate Limit Headers

成功回應會包含以下 headers:

```
X-RateLimit-Remaining: 4    // 剩餘請求次數
X-RateLimit-Reset: 1699999999999  // 重置時間 (Unix timestamp ms)
```

可用於前端顯示剩餘次數或倒數計時。

---

## 🔗 TypeScript 型別匯入

如果需要在前端使用後端定義的型別:

```typescript
// 從後端匯入型別 (僅供參考，建議前端維護自己的型別)
import type {
  ParsedResumeData,
  ParsedJobDescription,
  AIServiceResponse,
  AIErrorCode,
} from "@/libs/ai";
```

---

## 🧪 測試範例

### 測試 JD 解析

```typescript
// 測試用 JD 文字
const testJD = `
【会社名】株式会社テスト
【職種】シニアフロントエンドエンジニア
【雇用形態】正社員
【勤務地】東京都渋谷区（リモート可）
【年収】600万円〜900万円
【必須条件】
- React/TypeScript 3年以上
- チーム開発経験
【歓迎条件】
- Next.js経験
- GraphQL経験
`;

const response = await fetch("/api/ai/parse-job-posting", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ textContent: testJD }),
});

const result = await response.json();
console.log(result.data);
// {
//   company_name: "株式会社テスト",
//   position_title: "シニアフロントエンドエンジニア",
//   salary_range: { min: 600, max: 900, currency: "JPY", type: "annual" },
//   requirements: ["React/TypeScript 3年以上", "チーム開発経験"],
//   ...
// }
```

---

## ❓ FAQ

**Q: n8n 還能用嗎？**
A: 已廢棄。請使用 `/api/ai/parse-job-posting`。

**Q: PDF 要怎麼處理？**
A: 前端負責 PDF → 純文字轉換（使用 `pdfjs-dist`），後端只接受純文字。

**Q: 為什麼有 API Route 又有 Server Action？**
A:

- `analyzeResumeAction` - 適合在 React Server Component 或需要簡單呼叫的場景
- `/api/ai/resume-parser` - 適合需要更多控制（如自訂 headers）的場景

兩者內部使用相同的 AI Service，功能一致。

---

## 📞 聯絡

有問題請聯繫後端工程師。
