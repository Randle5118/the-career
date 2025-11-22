import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse, handleSupabaseError } from "@/libs/api-helpers";
import { UpdatePublishedResumeSettingsSchema } from "@/libs/validations/resume";

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
      
      throw handleSupabaseError(error);
    }

    return NextResponse.json({ data: published });
  } catch (error) {
    return handleApiErrorResponse(error);
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

    // 取得並驗證 request body
    const body = await req.json();
    const validatedData = UpdatePublishedResumeSettingsSchema.parse(body);
    const { is_public, public_url_slug } = validatedData;

    // 準備更新的資料
    const updateData: Record<string, unknown> = {};
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
      throw handleSupabaseError(error);
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "設定を更新しました"
    });
  } catch (error) {
    return handleApiErrorResponse(error);
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
      throw handleSupabaseError(error);
    }

    return NextResponse.json({
      success: true,
      message: "履歴書の公開を停止しました"
    });
  } catch (error) {
    return handleApiErrorResponse(error);
  }
}

