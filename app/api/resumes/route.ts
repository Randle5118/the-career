import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse, handleSupabaseError } from "@/libs/api-helpers";
import { ResumeFormDataSchema } from "@/libs/validations/resume";

/**
 * GET /api/resumes
 * 取得用戶的所有履歷列表 (與 /list 相同)
 */
export async function GET(req: NextRequest) {
  try {
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

    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      throw handleSupabaseError(error);
    }

    return NextResponse.json({ data: resumes || [] });
  } catch (error) {
    return handleApiErrorResponse(error);
  }
}

/**
 * POST /api/resumes
 * 建立新的履歷
 * 
 * Body: { resume_name: string }
 */
export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    // 簡單驗證 resume_name
    const resumeName = body.resume_name || "履歴書";

    // 檢查是否為第一份履歷 (如果是，設為 primary)
    const { count } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const isPrimary = count === 0;

    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        resume_name: resumeName,
        is_primary: isPrimary,
        // 初始化為空陣列，避免 null
        education: [],
        work_experience: [],
        certifications: [],
        awards: [],
        languages: [],
        skills: [],
        preferences: {},
      })
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error);
    }

    return NextResponse.json({
      success: true,
      data: newResume,
      message: "履歴書を作成しました"
    }, { status: 201 });

  } catch (error) {
    return handleApiErrorResponse(error);
  }
}
