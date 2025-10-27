import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

/**
 * POST /api/ai/parse-job-posting
 * PDF求人票をn8n webhookに送信してパース
 * 
 * 認証が必要なエンドポイント
 */
export async function POST(req: Request) {
  try {
    // 1. 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 2. リクエストボディを取得
    const body = await req.json();
    const { fileName, fileContent, fileSize } = body;

    if (!fileName || !fileContent) {
      return NextResponse.json(
        { error: "ファイル情報が不足しています" },
        { status: 400 }
      );
    }

    // 3. ファイルサイズチェック (10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズが大きすぎます（最大10MB）" },
        { status: 400 }
      );
    }

    // 4. n8n Webhook URL (環境変数から取得)
    const webhookUrl = process.env.N8N_PARSE_JD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("N8N_PARSE_JD_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { error: "サービスが設定されていません" },
        { status: 500 }
      );
    }

    // 5. n8n Webhookに送信
    // Convert base64 to binary buffer
    const buffer = Buffer.from(fileContent, 'base64');
    
    // Create FormData with binary file
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    formData.append('userId', user.id);
    formData.append('userEmail', user.email || '');
    formData.append('timestamp', new Date().toISOString());

    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n webhook error:", errorText);
      return NextResponse.json(
        { error: "PDF解析に失敗しました" },
        { status: 500 }
      );
    }

    // 6. パース結果を返す
    let parsedData;
    const responseText = await response.text();
    
    try {
      parsedData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Failed to parse n8n response");
      return NextResponse.json(
        { error: "サーバーからの応答が不正です" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Parse job posting error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
