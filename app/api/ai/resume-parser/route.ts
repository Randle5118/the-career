import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse } from "@/libs/api-helpers";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitResponse,
} from "@/libs/rate-limit";
import axios from "axios";

// 設定 OpenAI API
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o'; // 使用較新的模型以獲得更好的 JSON 結構化能力

// Rate Limit 設定 (每分鐘 5 次，因為 AI 分析很貴)
const RESUME_PARSER_RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 5,
  identifier: "resume-parser", // 會與 user ID 結合
};

// 預設的 System Prompt (已對齊 ResumeFormData Schema)
const DEFAULT_SYSTEM_PROMPT = `
你是一個專業的履歷解析助手。
你的任務是將使用者提供的履歷純文字內容，解析並轉換為結構化的 JSON 格式。

請嚴格遵循以下輸出結構 (與前端表單一致)，如果找不到資訊請留空或填 null：

{
  // 基本資訊
  "name_kanji": "string | null", // 漢字姓名
  "name_kana": "string | null", // 假名
  "name_romaji": "string | null", // 羅馬拼音
  "birth_date": "YYYY-MM-DD | null", // 西元日期格式
  "age": number | null,
  "gender": "string | null",
  "phone": "string | null",
  "email": "string | null",
  "address_line": "string | null",
  
  // 連結
  "linkedin_url": "string | null",
  "github_url": "string | null",
  "portfolio_url": "string | null",
  
  // 簡介
  "career_summary": "string | null", // 職涯摘要
  "self_pr": "string | null", // 自我宣傳/優勢
  
  // 學歷 (Education[])
  "education": [
    {
      "school_name": "string",
      "major": "string | null",
      "date": "YYYY-MM", // 畢業年月
      "comment": "string | null" // 備考 (例如: 卒業区分、交換留學等)
    }
  ],
  
  // 工作經歷 (WorkExperience[])
  "work_experience": [
    {
      "company_name": "string",
      "is_current": boolean,
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM | null", // 如果 is_current 為 true，這裡是 null
      "description": "string | null", // 整體職務說明
      "positions": [
        {
          "title": "string", // 職稱
          "start_date": "YYYY-MM",
          "end_date": "YYYY-MM | null",
          "is_current": boolean,
          "comment": "string | null"
        }
      ]
    }
  ],
  
  // 技能 (Skill[])
  "skills": [
    {
      "category": "string", // 例如: "Frontend", "Language", "Tools"
      "items": ["string"] // 技能列表
    }
  ],
  
  // 語言 (Language[])
  "languages": [
    {
      "name": "string", // 例如: "English", "Japanese"
      "level": "string" // 例如: "Native", "Business", "N1"
    }
  ],
  
  // 證照 (Certification[])
  "certifications": [
    {
      "name": "string",
      "date": "YYYY-MM"
    }
  ],
  
  // 獎項 (Award[])
  "awards": [
    {
      "title": "string",
      "date": "YYYY-MM",
      "organization": "string"
    }
  ]
}

特別注意：
1. 日期格式必須統一為 YYYY-MM (除了 birth_date 為 YYYY-MM-DD)。
2. work_experience 中的 positions 陣列至少要有一個項目 (如果履歷只寫了一個職位，就填入該職位)。
3. 確保 JSON 格式正確。
`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. 認證檢查
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 2. Rate Limit 檢查
    const identifier = `resume-parser:${user.id}`; // 針對每個使用者的獨立限制
    const rateLimitResult = checkRateLimit({
      ...RESUME_PARSER_RATE_LIMIT,
      identifier,
    });

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetAt);
    }

    // 3. 取得輸入
    const body = await req.json().catch(() => ({}));
    const { textContent } = body;

    if (!textContent || typeof textContent !== 'string') {
      return NextResponse.json(
        { error: "テキスト内容は必須です" },
        { status: 400 }
      );
    }

    // 4. 長度檢查 (簡單防禦)
    if (textContent.length > 20000) {
      return NextResponse.json(
        { error: "テキストが長すぎます (制限: 20000文字)" },
        { status: 400 }
      );
    }

    // 5. 呼叫 OpenAI
    // 注意：這裡直接實作而不依賴 libs/gpt.ts，因為需要 JSON Mode 和更細緻的控制
    const payload = {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: DEFAULT_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: textContent
        }
      ],
      response_format: { type: "json_object" }, // 強制 JSON 模式
      temperature: 0.1, // 低隨機性，追求精準
      max_tokens: 4000, // 預留足夠空間給 JSON 回應
      user: user.id
    };

    let aiResponse;
    
    try {
      aiResponse = await axios.post(OPENAI_API_URL, payload, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000, // 60 秒逾時
      });
    } catch (axiosError: any) {
      // 處理 OpenAI API 錯誤
      console.error("[Resume Parser] OpenAI API Error:", axiosError.response?.data || axiosError.message);
      
      // Rate Limit 或 Overloaded
      if (axiosError.response?.status === 429 || axiosError.response?.data?.error?.type === "insufficient_quota") {
        return NextResponse.json(
          { 
            error: "ERROR_OPENAI_RATE_LIMIT_EXCEEDED",
            message: "AI解析サービスが混み合っています。数分後に再度お試しください。" 
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      // 其他 API 錯誤
      return NextResponse.json(
        { 
          error: "ERROR_OPENAI_API",
          message: "AI解析サービスでエラーが発生しました" 
        },
        { status: 502 } // Bad Gateway
      );
    }

    const content = aiResponse.data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AIからの応答が空でした" },
        { status: 500 }
      );
    }

    // 6. 解析 JSON 並回傳
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (e) {
      console.error("[Resume Parser] JSON Parse Error:", e);
      console.error("[Resume Parser] Content:", content);
      return NextResponse.json(
        { error: "AIの応答をJSONとして解析できませんでした" },
        { status: 500 }
      );
    }

    const successResponse = NextResponse.json({
      success: true,
      data: parsedData
    });

    // 加入 Rate Limit headers
    successResponse.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    successResponse.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toString());

    return successResponse;

  } catch (error) {
    console.error("[Resume Parser] Unexpected Error:", error);
    return handleApiErrorResponse(error);
  }
}

