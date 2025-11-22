import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { handleApiErrorResponse, handleSupabaseError } from "@/libs/api-helpers";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitResponse,
  PUBLIC_API_RATE_LIMIT,
} from "@/libs/rate-limit";

/**
 * GET /api/published-resumes/[slug]
 * 透過 public_url_slug 查詢公開的履歷
 * 
 * 此 endpoint 不需要認證，任何人都可以查詢公開的履歷
 * 有 Rate Limiting 保護 (每分鐘 10 次請求)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Rate Limiting 檢查
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = checkRateLimit({
      ...PUBLIC_API_RATE_LIMIT,
      identifier,
    });

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetAt);
    }

    const { slug } = await params;
    const supabase = await createClient();

    // 查詢公開的履歷 (不需要認證)
    const { data: resume, error } = await supabase
      .from("published_resumes")
      .select("*")
      .eq("public_url_slug", slug)
      .eq("is_public", true)
      .single();

    if (error) {
      throw handleSupabaseError(error);
    }

    if (!resume) {
      return NextResponse.json(
        { error: "履歴書が見つかりません" },
        { status: 404 }
      );
    }

    // 移除敏感資訊 (雙重保險)
    const publicResume = {
      ...resume,
      phone: undefined,
      email: undefined,
      postal_code: undefined,
      address_line: undefined,
      building: undefined,
      birth_date: undefined,
      name_kana: undefined,
    };

    // 加入 Rate Limit headers
    const response = NextResponse.json({ data: publicResume });
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toString());

    return response;
  } catch (error) {
    return handleApiErrorResponse(error);
  }
}

