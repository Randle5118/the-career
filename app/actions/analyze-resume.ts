"use server";

import { z } from "zod";
import axios from "axios";
import { createClient } from "@/libs/supabase/server";

// 定義請求參數結構
const AnalyzeRequestSchema = z.object({
  text: z.string().min(1, "テキストが空です"),
  fileName: z.string().optional(),
});

// 定義回傳結構 (與前端預期一致)
export interface AnalyzeResponse {
  success: boolean;
  data?: any; // 具體結構由 ParserResponse 定義
  error?: string;
  errorCode?: string; // 用於識別錯誤類型（例如 rate limit）
  isRetryable?: boolean; // 是否可重試
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `
你是專業的履歷解析助手。請分析使用者的履歷文字，並輸出符合以下 JSON Schema 的結構化資料。
如果找不到特定資訊或是指定的訊息不齊全時，請填入 null 或空陣列，不要自行杜撰。

特殊規則：
1. **日期格式嚴格要求**：所有日期欄位（education.date, work_experience.start_date, work_experience.end_date, 
   positions.start_date, positions.end_date, certifications.date, awards.date）
   必須使用 YYYY-MM 格式（例如: 2023-06）。
   絕對不要使用完整日期 YYYY-MM-DD 格式。
   當日期格式不合 YYYY-MM 格式時則不填入日期。
   
2. 如果某個工作經歷沒有明確的 "description"（公司業務內容概要），但有具體的職位/職稱資訊，
   請在 "positions" 陣列中至少建立一個職位項目，並將職務內容放在該職位的 "comment" 欄位中。
   
3. 如果履歷中只有職稱但沒有詳細內容，仍然要建立對應的 position 物件。

4. positions 陣列可以為空（如果完全沒有職位資訊），但有職稱資訊時不應該為空。

JSON Schema:
{
  "name_kanji": "string | null (漢字姓名)",
  "name_kana": "string | null (平假名/片假名姓名)",
  "name_romaji": "string | null (羅馬拼音姓名)",
  "birth_date": "string | null (Format: YYYY-MM-DD)",
  "age": "number | null",
  "gender": "string | null (男性/女性/其他)",
  "phone": "string | null",
  "email": "string | null",
  "address_line": "string | null (地址)",
  "linkedin_url": "string | null",
  "github_url": "string | null",
  "portfolio_url": "string | null",
  "career_summary": "string | null (職涯摘要/自我介紹)",
  "self_pr": "string | null (自我宣傳/強項)",
  "education": [
    {
      "school_name": "string",
      "major": "string (主修/學部學科)",
      "date": "string (格式必須為 YYYY-MM，例如: 2020-03。不要使用完整日期 YYYY-MM-DD)",
      "comment": "string | null (備考。例: 学部長表彰、交換留学経験など。若無則為 null)"
    }
  ],
  "work_experience": [
    {
      "company_name": "string (公司名稱)",
      "is_current": "boolean (是否為現職)",
      "start_date": "string (格式必須為 YYYY-MM，例如: 2020-04。不要使用完整日期)",
      "end_date": "string | null (格式必須為 YYYY-MM，例如: 2023-03。若仍在職則為 null)",
      "description": "string | null (公司簡介/業務內容概要，或是在這間公司做過的專案內容。若無此資訊可為 null)",
      "positions": [
        {
          "title": "string (職稱/職位名稱。例: シニアエンジニア、プロダクトマネージャー)",
          "start_date": "string (格式必須為 YYYY-MM，例如: 2020-04。若無明確日期可使用入社日期)",
          "end_date": "string | null (格式必須為 YYYY-MM。若為當前職位則為 null)",
          "is_current": "boolean (是否為當前職位)",
          "comment": "string | null (職務備註。例: 升職、職種變更、專案經驗、成就等)"
        }
      ]
      // 注意：如果有職稱資訊，positions 陣列應該至少有一個項目。
      // 如果履歷只寫「XX公司 工程師」而沒有詳細內容，仍應建立一個 position 物件。
    }
  ],
  "skills": [
    {
      "category": "string (根據獲取的工作經驗訊息去補充技能分類)",
      "items": ["string (根據獲取的工作經驗訊息去補充技能項目)"]
    }
  ],
  "languages": [
    {
      "name": "string (語言名稱)",
      "level": "string (流利程度/檢定等級)"
    }
  ],
  "certifications": [
    {
      "name": "string (證照名稱)",
      "date": "string (格式必須為 YYYY-MM，例如: 2023-06。不要使用完整日期 YYYY-MM-DD)"
    }
  ],
  "awards": [
    {
      "title": "string (獎項名稱)",
      "date": "string (格式必須為 YYYY-MM，例如: 2023-06。不要使用完整日期 YYYY-MM-DD)",
      "organization": "string (頒發機構)"
    }
  ]
}
`;

/**
 * 接收 PDF 純文字並進行 AI 分析的 Server Action
 */
export async function analyzeResumeAction(
  text: string,
  fileName?: string
): Promise<AnalyzeResponse> {
  try {
    // 1. 認證檢查 (使用 Supabase Server Client)
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "認証が必要です。再度ログインしてください。",
        errorCode: "UNAUTHORIZED",
        isRetryable: false,
      };
    }

    // 2. 驗證輸入
    const validation = AnalyzeRequestSchema.safeParse({ text, fileName });
    if (!validation.success) {
      return {
        success: false,
        error: "無効な入力データです",
        isRetryable: false,
      };
    }

    console.log(
      `[AnalyzeResume] Processing file: ${fileName}, text length: ${text.length}, User: ${user.id}`
    );

    // 3. 檢查 OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      console.error("[AnalyzeResume] OPENAI_API_KEY is not configured");
      return {
        success: false,
        error:
          "AI解析サービスが設定されていません。管理者にお問い合わせください。",
        errorCode: "AI_NOT_CONFIGURED",
        isRetryable: false,
      };
    }

    // 4. 呼叫 OpenAI API
    const payload = {
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
      user: user.id,
    };

    let aiResponse;
    try {
      aiResponse = await axios.post(OPENAI_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60s timeout
      });
    } catch (axiosError: any) {
      console.error(
        "[AnalyzeResume] OpenAI API Error:",
        axiosError.response?.data || axiosError.message
      );

      const errorType = axiosError.response?.data?.error?.type;
      const errorCode = axiosError.response?.data?.error?.code;

      // Insufficient Quota (額度不足)
      if (
        errorType === "insufficient_quota" ||
        errorCode === "insufficient_quota"
      ) {
        return {
          success: false,
          error:
            "AI解析サービスの利用枠が上限に達しました。管理者にお問い合わせください。",
          errorCode: "AI_QUOTA_EXCEEDED",
          isRetryable: false,
        };
      }

      // Rate Limit (請求頻度限制)
      if (axiosError.response?.status === 429) {
        return {
          success: false,
          error:
            "AI解析サービスが混み合っています。数分後に再度お試しください。",
          errorCode: "AI_RATE_LIMIT",
          isRetryable: true,
        };
      }

      // 其他 API 錯誤
      return {
        success: false,
        error:
          "AI解析サービスでエラーが発生しました。しばらく経ってから再度お試しください。",
        errorCode: "AI_API_ERROR",
        isRetryable: true,
      };
    }

    const content = aiResponse.data.choices[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "AIからの応答が空でした",
        errorCode: "EMPTY_RESPONSE",
        isRetryable: true,
      };
    }

    // 4. 解析 JSON
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (e) {
      console.error("[AnalyzeResume] JSON Parse Error:", e);
      return {
        success: false,
        error: "AIの応答をJSONとして解析できませんでした",
        errorCode: "JSON_PARSE_ERROR",
        isRetryable: true,
      };
    }

    // 5. 直接回傳解析結果（不進行 Validation）
    // Validation 會在用戶保存時於 API Route 中進行
    console.log("[AnalyzeResume] Parse successful, returning data");

    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error("[AnalyzeResume] Unexpected Error:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
      errorCode: "INTERNAL_ERROR",
      isRetryable: true,
    };
  }
}
