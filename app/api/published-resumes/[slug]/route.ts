import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

/**
 * GET /api/published-resumes/[slug]
 * 透過 public_url_slug 查詢公開的履歷
 * 
 * 此 endpoint 不需要認證，任何人都可以查詢公開的履歷
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // 查詢公開的履歷 (不需要認證)
    const { data: resume, error } = await supabase
      .from("published_resumes")
      .select("*")
      .eq("public_url_slug", slug)
      .eq("is_public", true)
      .single();

    if (error || !resume) {
      return NextResponse.json(
        { error: "履歴書が見つかりません" },
        { status: 404 }
      );
    }

    // 移除一些敏感資訊 (雖然 RLS 應該已經處理了，但雙重保險)
    // 注意: 如果你希望公開履歷顯示連絡資訊，可以保留這些欄位
    const publicResume = {
      ...resume,
      // 可選: 移除敏感資訊
      // phone: undefined,
      // email: undefined,
      // postal_code: undefined,
      // address_line: undefined,
      // building: undefined,
    };

    return NextResponse.json({ data: publicResume });
  } catch (error) {
    console.error("[API] Get published resume error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

