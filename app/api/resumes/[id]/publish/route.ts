import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse, handleSupabaseError } from "@/libs/api-helpers";
import { PublishResumeSchema } from "@/libs/validations/resume";

// UUID 驗證 regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 移除敏感資訊 (發布到公開履歷時)
 */
function sanitizePrivateData(resume: any) {
  return {
    ...resume,
    // ❌ 移除敏感資訊
    phone: null,
    email: null,
    postal_code: null,
    city: null,
    address_line: null,
    building: null,
    birth_date: null,  // 移除出生日期 (隱私)
    name_kana: null,
    // ✅ 保留年齡 (age 保留,用於職涯判斷)
  };
}

/**
 * POST /api/resumes/[id]/publish
 * 發布 resume 到 published_resumes (更新模式)
 * 
 * 行為:
 * - 如果用戶還沒有公開履歷 → 建立新的
 * - 如果用戶已有公開履歷 → 更新現有的
 * - 自動移除敏感資訊
 * 
 * Body (optional):
 * - is_public: boolean (是否公開，預設 true)
 * - public_url_slug: string (公開 URL slug，首次發布時可指定)
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

    // 取得並驗證 request body (可選)
    const body = await req.json().catch(() => ({}));
    const validatedData = PublishResumeSchema.parse(body);
    const { is_public = true, public_url_slug, public_expires_at } = validatedData;

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

    // 檢查是否已有對應此原始履歷的公開版本
    const { data: existingPublished } = await supabase
      .from("published_resumes")
      .select("id, public_url_slug")
      .eq("user_id", user.id)
      .eq("source_resume_id", id)
      .single();

    // 準備發布的資料 (移除敏感資訊)
    const sanitizedData = sanitizePrivateData(resume);
    
    // 決定 slug
    // 優先順序: 1) 請求中的 public_url_slug, 2) 現有的 slug, 3) 使用 resume ID
    let finalSlug = public_url_slug || existingPublished?.public_url_slug;
    
    if (!finalSlug) {
      // 首次發布且沒提供 slug，預設使用 resume ID
      finalSlug = id;
    }

    const publishData = {
      user_id: resume.user_id,
      source_resume_id: id, // 記錄來源履歷 ID
      resume_name: sanitizedData.resume_name,
      completeness: sanitizedData.completeness,
      is_public,
      public_url_slug: finalSlug,
      public_expires_at: public_expires_at === undefined ? null : public_expires_at, // 如果未提供，預設為 null (永久有效)
      version: 1, // 固定為 1 (更新模式)
      
      // 個人資訊 (已淨化)
      name_kanji: sanitizedData.name_kanji,
      name_kana: sanitizedData.name_kana,
      name_romaji: sanitizedData.name_romaji,
      birth_date: sanitizedData.birth_date,
      age: sanitizedData.age,
      gender: sanitizedData.gender,
      photo_url: sanitizedData.photo_url,
      
      // 連絡資訊 (已淨化)
      phone: sanitizedData.phone,
      email: sanitizedData.email,
      postal_code: sanitizedData.postal_code,
      prefecture: sanitizedData.prefecture, // 保留都道府縣
      city: sanitizedData.city,
      address_line: sanitizedData.address_line,
      building: sanitizedData.building,
      
      // 社群媒體 (保留)
      linkedin_url: sanitizedData.linkedin_url,
      github_url: sanitizedData.github_url,
      portfolio_url: sanitizedData.portfolio_url,
      other_url: sanitizedData.other_url,
      
      // 履歷內容 (保留)
      career_summary: sanitizedData.career_summary,
      self_pr: sanitizedData.self_pr,
      
      // JSONB 欄位 (保留)
      education: sanitizedData.education,
      work_experience: sanitizedData.work_experience,
      certifications: sanitizedData.certifications,
      awards: sanitizedData.awards,
      languages: sanitizedData.languages,
      skills: sanitizedData.skills,
      preferences: sanitizedData.preferences,
      
      // 來源資訊
      source_type: sanitizedData.source_type,
      source_file_url: sanitizedData.source_file_url,
    };

    let published;
    let isNewPublish = false;

    if (existingPublished) {
      // 更新現有的公開履歷
      const { data, error: updateError } = await supabase
        .from("published_resumes")
        .update(publishData)
        .eq("id", existingPublished.id) // 使用 ID 精確更新
        .select()
        .single();

      if (updateError) {
        throw handleSupabaseError(updateError);
      }
      
      published = data;
    } else {
      // 建立新的公開履歷
      const { data, error: insertError } = await supabase
        .from("published_resumes")
        .insert(publishData)
        .select()
        .single();

      if (insertError) {
        throw handleSupabaseError(insertError);
      }
      
      published = data;
      isNewPublish = true;
    }

    // 計算狀態並回傳
    const status = !published.is_public ? "disabled" :
      (published.public_expires_at && new Date(published.public_expires_at) < new Date()) ? "expired" : 
      "active";

    return NextResponse.json({
      success: true,
      data: { ...published, status }, // 加入計算後的 status
      public_url: `/r/${published.public_url_slug}`,
      message: isNewPublish ? "履歴書を公開しました" : "履歴書を更新しました"
    }, { status: isNewPublish ? 201 : 200 });
  } catch (error) {
    return handleApiErrorResponse(error);
  }
}

