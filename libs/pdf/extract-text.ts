import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// 設定 Worker
// 注意: 這裡使用 CDN 以避免 Next.js Build 時的 Worker 檔案路徑問題
// 版本號必須與 package.json 中的 pdfjs-dist 版本一致 (3.11.174)
if (typeof window !== "undefined") {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

/**
 * 從 PDF 檔案中提取純文字
 * @param file PDF 檔案物件
 * @returns 提取出的純文字
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    console.log(
      `[PDF Extract] Starting extraction for: ${file.name}, size: ${file.size} bytes`
    );

    const arrayBuffer = await file.arrayBuffer();
    console.log(
      `[PDF Extract] ArrayBuffer created, length: ${arrayBuffer.byteLength}`
    );

    // 載入 PDF
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log(`[PDF Extract] PDF loaded, pages: ${pdf.numPages}`);

    let fullText = "";
    const totalPages = pdf.numPages;

    // 遍歷所有頁面
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // 提取文字項目並組合
      // item 有 str (文字內容) 和 transform (位置資訊) 等屬性
      const pageText = textContent.items
        .map((item) => (item as TextItem).str)
        .join(" ");

      fullText += pageText + "\n\n";
      console.log(
        `[PDF Extract] Page ${i}/${totalPages} extracted, text length: ${pageText.length}`
      );
    }

    const trimmedText = fullText.trim();
    console.log(
      `[PDF Extract] Complete! Total text length: ${trimmedText.length}`
    );
    return trimmedText;
  } catch (error) {
    console.error("[PDF Extract] Error:", error);

    // 提供更詳細的錯誤訊息
    if (error instanceof Error) {
      if (error.message.includes("password")) {
        throw new Error("PDFはパスワードで保護されています");
      } else if (error.message.includes("Invalid PDF")) {
        throw new Error("PDFファイルが破損しています");
      } else if (error.message.includes("network")) {
        throw new Error("ネットワークエラーが発生しました");
      }
    }

    throw new Error(
      "PDFの読み込みに失敗しました。ファイルが破損しているか、パスワードで保護されている可能性があります。"
    );
  }
}
