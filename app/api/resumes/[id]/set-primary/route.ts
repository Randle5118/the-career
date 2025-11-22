import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse, handleSupabaseError } from "@/libs/api-helpers";

// UUID 驗證 regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/resumes/[id]/set-primary
 * 設定為主要履歷 (會觸發 DB trigger 將其他設為 false)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 驗證 UUID 格式
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "無効なIDです" },
        { status: 404 }
      );
    }
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

    const { data, error } = await supabase
      .from("resumes")
      .update({
        is_primary: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error);
    }

    return NextResponse.json({
      success: true,
      data,
      message: "主要履歴書を設定しました"
    });
  } catch (error) {
    return handleApiErrorResponse(error);
  }
}

