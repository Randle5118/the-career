# 後端改進建議報告

> **分析日期**: 2025-01-XX  
> **分析範圍**: API Routes, 資料庫設計, 安全性, 錯誤處理

---

## 🔴 高優先級問題 (必須修復)

### 1. **輸入驗證完全缺失**

**問題**: 所有 API routes 都沒有使用 Zod 進行輸入驗證，直接信任 client 傳來的資料。

**影響**:
- SQL Injection 風險 (雖然 Supabase 有保護，但 JSONB 欄位仍可能被注入惡意資料)
- 資料完整性問題 (錯誤的資料格式可能導致資料庫錯誤)
- 型別安全問題 (TypeScript 編譯時無法檢查 runtime 資料)

**受影響的 API**:
- `PUT /api/resumes` - 直接接受 `body`，沒有驗證
- `PUT /api/resumes/[id]` - 直接接受 `body`，沒有驗證
- `POST /api/resumes/[id]/publish` - 沒有驗證 `is_public`, `public_url_slug`
- `PATCH /api/resume/published` - 沒有驗證 `is_public`, `public_url_slug`
- `POST /api/ai/parse-job-posting` - 只有基本檢查，沒有完整驗證

**建議修復**:
```typescript
// 建立 libs/validations/resume.ts
import { z } from "zod";

export const ResumeFormDataSchema = z.object({
  resume_name: z.string().optional(),
  name_kanji: z.string().optional(),
  // ... 所有欄位
}).strict(); // 禁止額外欄位

// 在 API route 中使用
const body = await req.json();
const validatedData = ResumeFormDataSchema.parse(body);
```

---

### 2. **公開 API 缺少 Rate Limiting**

**問題**: `/api/published-resumes/[slug]` 是公開 API，任何人都可以無限次呼叫，可能被濫用。

**影響**:
- DDoS 攻擊風險
- 資料庫負載過高
- 成本增加 (Supabase 有使用量限制)

**建議修復**:
```typescript
// 使用 Next.js middleware 或第三方服務 (如 Upstash)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 每分鐘 10 次
});

// 在 API route 中
const identifier = req.ip || "anonymous";
const { success } = await ratelimit.limit(identifier);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

---

### 3. **Stripe Webhook 錯誤處理不完整**

**問題**: `app/api/webhook/stripe/route.ts` 中，catch block 只記錄錯誤，沒有回傳錯誤狀態碼。

**影響**:
- Stripe 會認為 webhook 處理失敗，會重試
- 無法追蹤實際的錯誤原因
- 可能導致重複處理

**當前程式碼**:
```typescript
} catch (e) {
  console.error("stripe error: ", e.message);
}
return NextResponse.json({}); // ❌ 總是回傳 200
```

**建議修復**:
```typescript
} catch (e) {
  console.error("[Stripe Webhook] Error:", e);
  // 回傳 500 讓 Stripe 知道處理失敗，會重試
  return NextResponse.json(
    { error: "Webhook processing failed" },
    { status: 500 }
  );
}
```

---

### 4. **PUT 操作缺少資料驗證和清理**

**問題**: `PUT /api/resumes` 和 `PUT /api/resumes/[id]` 直接將 `body` 傳給 Supabase，沒有：
- 驗證欄位是否存在
- 清理不應該更新的欄位 (如 `id`, `user_id`, `created_at`)
- 驗證 JSONB 欄位的格式

**影響**:
- 用戶可能修改 `user_id` 來存取其他用戶的資料 (雖然 RLS 會阻擋，但應該在 API 層就阻止)
- 錯誤的 JSONB 格式可能導致資料庫錯誤
- 可能覆蓋系統欄位

**建議修復**:
```typescript
// 建立白名單，只允許更新特定欄位
const ALLOWED_UPDATE_FIELDS = [
  "resume_name",
  "name_kanji",
  // ... 其他允許的欄位
];

const SYSTEM_FIELDS = ["id", "user_id", "created_at"];

// 清理 body
const cleanedBody = Object.keys(body)
  .filter(key => ALLOWED_UPDATE_FIELDS.includes(key))
  .filter(key => !SYSTEM_FIELDS.includes(key))
  .reduce((acc, key) => {
    acc[key] = body[key];
    return acc;
  }, {} as any);
```

---

## 🟡 中優先級問題 (建議修復)

### 5. **錯誤處理不一致**

**問題**: 不同 API routes 的錯誤處理方式不一致：
- 有些回傳詳細錯誤訊息
- 有些只回傳通用錯誤
- 錯誤碼處理不統一

**範例**:
```typescript
// 有些地方這樣處理
if (error.code === "PGRST116") {
  return NextResponse.json({ data: null }); // 回傳 null
}

// 有些地方這樣處理
if (error.code === "PGRST116") {
  return NextResponse.json({ error: "履歴書が見つかりません" }, { status: 404 });
}
```

**建議修復**:
建立統一的錯誤處理 helper:
```typescript
// libs/api-errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function handleSupabaseError(error: any): ApiError {
  if (error.code === "PGRST116") {
    return new ApiError(404, "リソースが見つかりません", "NOT_FOUND");
  }
  if (error.code === "23505") {
    return new ApiError(409, "このリソースは既に存在します", "DUPLICATE");
  }
  // ... 其他錯誤碼
  return new ApiError(500, "サーバーエラーが発生しました", "INTERNAL_ERROR");
}
```

---

### 6. **缺少 Request Body Size 限制**

**問題**: 沒有檢查 request body 的大小，可能導致：
- 記憶體耗盡
- 惡意用戶上傳超大 JSON

**建議修復**:
```typescript
// middleware 或 API route 中
const contentLength = req.headers.get("content-length");
if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
  return NextResponse.json(
    { error: "リクエストボディが大きすぎます" },
    { status: 413 }
  );
}
```

---

### 7. **公開履歷的敏感資訊移除不完整**

**問題**: `app/api/published-resumes/[slug]/route.ts` 中，敏感資訊移除的程式碼被註解掉了。

**當前程式碼**:
```typescript
const publicResume = {
  ...resume,
  // 可選: 移除敏感資訊
  // phone: undefined,
  // email: undefined,
  // ...
};
```

**建議修復**:
雖然 `published_resumes` 表在建立時已經移除了敏感資訊，但應該在 API 層再次確認：
```typescript
const publicResume = {
  ...resume,
  phone: undefined,
  email: undefined,
  postal_code: undefined,
  address_line: undefined,
  building: undefined,
  birth_date: undefined,
  name_kana: undefined,
};
```

---

### 8. **缺少 API 版本控制**

**問題**: 沒有 API 版本控制機制，未來如果要修改 API 會影響現有客戶端。

**建議**: 
- 考慮加入 `/api/v1/` 前綴
- 或使用 header `API-Version: 1`

---

### 9. **缺少 CORS 設定**

**問題**: 沒有明確設定 CORS 政策，可能導致：
- 跨域請求問題
- 安全性問題

**建議修復**:
```typescript
// middleware.ts 或 API route
export async function GET(req: NextRequest) {
  const response = NextResponse.json({ data: ... });
  
  // 設定 CORS headers
  response.headers.set("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  return response;
}
```

---

## 🟢 低優先級問題 (優化建議)

### 10. **資料庫查詢可以優化**

**問題**: 有些查詢可以優化：
- `GET /api/resumes` 使用 `.single()` 但可能沒有資料，應該先檢查
- `PUT /api/resumes` 先查詢是否存在，再決定 INSERT/UPDATE，可以用 UPSERT

**建議修復**:
```typescript
// 使用 UPSERT 簡化邏輯
const { data, error } = await supabase
  .from("resumes")
  .upsert({
    user_id: user.id,
    ...body,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: "user_id",
  })
  .select()
  .single();
```

---

### 11. **缺少 API 文件**

**問題**: 沒有 API 文件 (Swagger/OpenAPI)，開發者需要看程式碼才能知道如何使用。

**建議**: 
- 使用 `@scalar/api-reference` 或 `swagger-ui`
- 或建立簡單的 Markdown 文件

---

### 12. **缺少 Logging 和 Monitoring**

**問題**: 只有 `console.error`，沒有結構化日誌和監控。

**建議**:
- 使用結構化日誌 (如 `pino` 或 `winston`)
- 整合錯誤追蹤服務 (如 Sentry)
- 加入 API 使用量監控

---

### 13. **缺少單元測試和整合測試**

**問題**: 沒有看到測試檔案，無法確保 API 的正確性。

**建議**:
- 使用 `vitest` 或 `jest` 進行單元測試
- 使用 `@testing-library` 進行 API 整合測試

---

## 📋 改進優先級總結

### 立即修復 (本週)
1. ✅ 加入 Zod 輸入驗證
2. ✅ 修復 Stripe webhook 錯誤處理
3. ✅ 加入 PUT 操作的資料清理

### 短期改進 (本月)
4. ✅ 加入 Rate Limiting (公開 API)
5. ✅ 統一錯誤處理
6. ✅ 確認敏感資訊移除

### 中期優化 (下個月)
7. ✅ 加入 CORS 設定
8. ✅ 優化資料庫查詢
9. ✅ 加入 API 文件

### 長期規劃
10. ✅ 加入 Logging/Monitoring
11. ✅ 加入測試覆蓋
12. ✅ API 版本控制

---

## 🔧 實作建議

### 第一步: 建立驗證 Schema

```typescript
// libs/validations/resume.ts
import { z } from "zod";

export const ResumeFormDataSchema = z.object({
  resume_name: z.string().max(100).optional(),
  name_kanji: z.string().max(50).optional(),
  name_kana: z.string().max(50).optional(),
  // ... 其他欄位
}).strict();
```

### 第二步: 建立錯誤處理 Helper

```typescript
// libs/api-helpers.ts
export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "入力データが不正です", details: error.errors },
      { status: 400 }
    );
  }
  // ... 其他錯誤處理
}
```

### 第三步: 建立 Rate Limiting Middleware

```typescript
// libs/rate-limit.ts
// 實作 rate limiting 邏輯
```

---

## 📝 注意事項

1. **向後相容性**: 修改 API 時要注意不要破壞現有客戶端
2. **測試**: 每個改進都要有對應的測試
3. **文件**: 更新 API 文件
4. **監控**: 部署後監控錯誤率和效能

---

**報告完成時間**: 2025-01-XX  
**下次檢視**: 建議每兩週檢視一次進度

