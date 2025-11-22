import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse, handleSupabaseError } from "@/libs/api-helpers";

// UUID 驗證 regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/resumes/[id]/duplicate
 * 複製履歷
 * 
 * Body (optional): { custom_name?: string }
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

    // 取得自定義名稱（可選）
    const body = await req.json().catch(() => ({}));
    const customName = body.custom_name;

    // 1. 讀取原始履歷
    const { data: sourceResume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      throw handleSupabaseError(fetchError);
    }

    // 2. 準備新資料 (移除 id, created_at, updated_at, is_primary, is_public, public_url_slug)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { 
      id: _, 
      created_at: __, 
      updated_at: ___, 
      is_primary: ____, 
      is_public: _____, 
      public_url_slug: ______,
      public_expires_at: _______,
      resume_name,
      ...resumeData 
    } = sourceResume;

    // 3. 決定新履歷名稱
    const newResumeName = customName || `${resume_name} (コピー)`;

    // 4. 插入新履歷
    const { data: newResume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        ...resumeData,
        user_id: user.id,
        resume_name: newResumeName,
        is_primary: false, // 複製的不會是主要的
        is_public: false, // 複製的不公開
        is_archived: false, // 複製的不封存
      })
      .select()
      .single();

    if (insertError) {
      throw handleSupabaseError(insertError);
    }

    return NextResponse.json({
      success: true,
      data: newResume,
      message: "履歴書を複製しました"
    }, { status: 201 });

  } catch (error) {
    return handleApiErrorResponse(error);
  }
}

