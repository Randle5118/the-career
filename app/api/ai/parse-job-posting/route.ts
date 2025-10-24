import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

/**
 * PDF 解析 API - 接收 PDF 檔案並提取文字內容
 * 
 * @route POST /api/ai/parse-job-posting
 * @param {FormData} file - PDF 檔案
 * @returns {Object} 提取的文字和基本資訊
 */
export async function POST(req: NextRequest) {
  try {
    // 解析 FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルがアップロードされていません" },
        { status: 400 }
      );
    }

    // 檢查檔案類型
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "PDFファイルのみアップロードできます" },
        { status: 400 }
      );
    }

    // 檢查檔案大小 (限制 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは10MB以下にしてください" },
        { status: 400 }
      );
    }

    console.log(`[AI Parse] 開始處理 PDF: ${file.name}, 大小: ${(file.size / 1024).toFixed(1)}KB`);

    // 將 File 轉換為 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 使用 pdf-parse 提取文字
    const startParseTime = Date.now();
    const pdfData = await pdf(buffer);
    const parseTime = Date.now() - startParseTime;

    console.log(`[AI Parse] PDF 解析完成: ${pdfData.numpages} 頁, ${pdfData.text.length} 字元, 耗時: ${parseTime}ms`);

    // TODO: 這裡將來會加入 AI 解析邏輯
    // 目前先返回原始文字,讓你在雲端處理

    return NextResponse.json({
      success: true,
      message: "PDF解析成功",
      data: {
        // 原始文字內容
        text: pdfData.text,
        
        // PDF 基本資訊
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          numPages: pdfData.numpages,
          textLength: pdfData.text.length,
          parseTimeMs: parseTime,
        },

        // PDF 內部 metadata (作者、標題等)
        pdfInfo: pdfData.info || {},

        // 文字預覽 (前 500 字元)
        preview: pdfData.text.substring(0, 500),
      },
    });

  } catch (error: any) {
    console.error("[AI Parse] Error:", error);
    
    // 更友善的錯誤訊息
    let errorMessage = "PDFの解析に失敗しました";
    
    if (error.message?.includes("Invalid PDF")) {
      errorMessage = "無効なPDFファイルです";
    } else if (error.message?.includes("Encrypted")) {
      errorMessage = "暗号化されたPDFは対応していません";
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

