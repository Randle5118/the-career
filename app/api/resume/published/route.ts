import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

/**
 * GET /api/resume/published
 * 取得使用者的公開履歷
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

    // 查詢使用者的公開履歷
    const { data: published, error } = await supabase
      .from("published_resumes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // 如果找不到記錄,回傳 null 而不是錯誤
      if (error.code === "PGRST116") {
        return NextResponse.json({ data: null });
      }
      
      console.error("[API] Get published resume error:", error);
      return NextResponse.json(
        { error: "公開履歴書の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: published });
  } catch (error) {
    console.error("[API] Get published resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/resume/published
 * 更新公開履歷設定 (不影響履歷內容)
 * 
 * Body:
 * - is_public: boolean (開啟/關閉公開)
 * - public_url_slug: string (修改公開 URL)
 */
export async function PATCH(req: NextRequest) {
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
    const { is_public, public_url_slug } = body;

    // 至少要有一個欄位
    if (is_public === undefined && !public_url_slug) {
      return NextResponse.json(
        { error: "更新する項目を指定してください" },
        { status: 400 }
      );
    }

    // 準備更新的資料
    const updateData: any = {};
    if (is_public !== undefined) updateData.is_public = is_public;
    if (public_url_slug) updateData.public_url_slug = public_url_slug;

    // 更新
    const { data: updated, error } = await supabase
      .from("published_resumes")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[API] Update published resume settings error:", error);
      
      // 檢查是否是 unique constraint 錯誤 (slug 重複)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "このURLスラッグは既に使用されています" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "設定の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "設定を更新しました"
    });
  } catch (error) {
    console.error("[API] Update published resume settings error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resume/published
 * 刪除公開履歷 (停止公開)
 * 
 * 注意: 實際上是將 is_public 設為 false,不是真的刪除記錄
 */
export async function DELETE(req: NextRequest) {
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

    // 將 is_public 設為 false (不刪除記錄)
    const { error } = await supabase
      .from("published_resumes")
      .update({ is_public: false })
      .eq("user_id", user.id);

    if (error) {
      console.error("[API] Unpublish resume error:", error);
      return NextResponse.json(
        { error: "公開の停止に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "履歴書の公開を停止しました"
    });
  } catch (error) {
    console.error("[API] Unpublish resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

