import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

/**
 * GET /api/resumes
 * 取得用戶的所有 resume templates
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 認證檢查
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 查詢用戶的所有 resumes
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false }) // 主要履歷排最前面
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[API] Get resumes error:", error);
      return NextResponse.json(
        { error: "履歴書の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: resumes || [] });
  } catch (error) {
    console.error("[API] Get resumes error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resumes
 * 建立新的 resume template
 * 
 * 必填欄位:
 * - name_kanji: string
 * - email: string
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 認證檢查
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 取得 request body
    const body = await req.json();
    const { name_kanji, email, ...otherFields } = body;

    // 驗證必填欄位
    if (!name_kanji || !email) {
      return NextResponse.json(
        { error: "名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    // 檢查是否已有 resume
    const { data: existing } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    // 如果這是第一個 resume，設為主要履歷
    const isPrimary = !existing || existing.length === 0;

    // 建立新 resume
    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        name_kanji,
        email,
        is_primary: isPrimary,
        ...otherFields,
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Create resume error:", error);
      return NextResponse.json(
        { error: "履歴書の作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newResume }, { status: 201 });
  } catch (error) {
    console.error("[API] Create resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

