import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

/**
 * GET /api/resumes/[id]
 * 取得單一 resume
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 查詢 resume (RLS 會確保只能查詢自己的)
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !resume) {
      return NextResponse.json(
        { error: "履歴書が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: resume });
  } catch (error) {
    console.error("[API] Get resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/resumes/[id]
 * 更新 resume
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 更新 resume (RLS 會確保只能更新自己的)
    const { data: updatedResume, error } = await supabase
      .from("resumes")
      .update(body)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[API] Update resume error:", error);
      
      // 檢查是否是權限問題
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "履歴書が見つかりません" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "履歴書の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedResume });
  } catch (error) {
    console.error("[API] Update resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resumes/[id]
 * 刪除 resume
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 刪除 resume (RLS 會確保只能刪除自己的)
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[API] Delete resume error:", error);
      return NextResponse.json(
        { error: "履歴書の削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Delete resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

