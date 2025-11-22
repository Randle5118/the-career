import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse, handleSupabaseError } from "@/libs/api-helpers";

/**
 * GET /api/resumes/list
 * 取得用戶的所有履歷列表
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

    // 查詢用戶的所有履歷
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false }) // 主要履歷優先
      .order("updated_at", { ascending: false }); // 其他按更新時間排序

    if (error) {
      throw handleSupabaseError(error);
    }

    return NextResponse.json({ data: resumes || [] });
  } catch (error) {
    return handleApiErrorResponse(error);
  }
}

