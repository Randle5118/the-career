import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

/**
 * POST /api/resumes/[id]/publish
 * 發布 resume 到 published_resumes
 * 
 * Body (optional):
 * - is_public: boolean (是否公開，預設 false)
 * - public_url_slug: string (公開 URL slug)
 */
export async function POST(
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

    // 取得 request body (可選)
    const body = await req.json().catch(() => ({}));
    const { is_public = false, public_url_slug } = body;

    // 取得原始 resume
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json(
        { error: "履歴書が見つかりません" },
        { status: 404 }
      );
    }

    // 如果要公開但沒提供 slug，使用預設格式
    let finalSlug = public_url_slug;
    if (is_public && !finalSlug) {
      // 使用 user id 的前8碼 + timestamp
      finalSlug = `${user.id.substring(0, 8)}-${Date.now()}`;
    }

    // 準備發布的資料 (複製所有欄位，除了 id 和一些 metadata)
    const publishData = {
      user_id: resume.user_id,
      resume_name: resume.resume_name,
      completeness: resume.completeness,
      is_public,
      public_url_slug: finalSlug,
      
      // 個人資訊
      name_kanji: resume.name_kanji,
      name_kana: resume.name_kana,
      name_romaji: resume.name_romaji,
      birth_date: resume.birth_date,
      age: resume.age,
      gender: resume.gender,
      photo_url: resume.photo_url,
      
      // 連絡資訊
      phone: resume.phone,
      email: resume.email,
      postal_code: resume.postal_code,
      prefecture: resume.prefecture,
      city: resume.city,
      address_line: resume.address_line,
      building: resume.building,
      
      // 社群媒體
      linkedin_url: resume.linkedin_url,
      github_url: resume.github_url,
      portfolio_url: resume.portfolio_url,
      other_url: resume.other_url,
      
      // 履歷內容
      career_summary: resume.career_summary,
      self_pr: resume.self_pr,
      
      // JSONB 欄位
      education: resume.education,
      work_experience: resume.work_experience,
      certifications: resume.certifications,
      awards: resume.awards,
      languages: resume.languages,
      skills: resume.skills,
      preferences: resume.preferences,
      
      // 來源資訊
      source_type: resume.source_type,
      source_file_url: resume.source_file_url,
    };

    // 插入到 published_resumes (version 會自動遞增)
    const { data: published, error: publishError } = await supabase
      .from("published_resumes")
      .insert(publishData)
      .select()
      .single();

    if (publishError) {
      console.error("[API] Publish resume error:", publishError);
      
      // 檢查是否是 unique constraint 錯誤 (slug 重複)
      if (publishError.code === "23505") {
        return NextResponse.json(
          { error: "このURLスラッグは既に使用されています" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "履歴書の公開に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: published,
      message: "履歴書を公開しました"
    }, { status: 201 });
  } catch (error) {
    console.error("[API] Publish resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

