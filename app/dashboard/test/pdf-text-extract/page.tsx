"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/catalyst/heading";
import { FileText, Upload, Loader2, CheckCircle2, XCircle, Settings, ArrowLeft, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

type ProcessStatus = "idle" | "extracting" | "uploading" | "success" | "error";

interface PdfFile {
  file: File;
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  extractedText?: string;
  error?: string;
}

interface BatchResult {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  results: Array<{
    fileName: string;
    status: "success" | "error";
    textLength?: number;
    error?: string;
  }>;
  webhookResponse?: any;
}

export default function PdfTextExtractPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [processSteps, setProcessSteps] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [showExtractedTexts, setShowExtractedTexts] = useState<boolean>(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // ファイル数制限チェック
    if (selectedFiles.length + files.length > 10) {
      toast.error("最大10つまでのファイルをアップロードできます");
      return;
    }

    const validFiles: PdfFile[] = [];
    
    for (const file of files) {
      // PDFファイルチェック
      if (file.type !== "application/pdf") {
        toast.error(`${file.name}: PDFファイルのみアップロードできます`);
        continue;
      }
      
      // ファイルサイズチェック (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: ファイルサイズは10MB以下にしてください`);
        continue;
      }
      
      // 重複チェック
      const isDuplicate = selectedFiles.some(
        existingFile => existingFile.file.name === file.name && 
                       existingFile.file.size === file.size
      );
      
      if (isDuplicate) {
        toast.error(`${file.name}: 同じファイルが既に選択されています`);
        continue;
      }
      
      validFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: "pending",
      });
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setStatus("idle");
      setBatchResult(null);
      setWebhookResult(null);
      setError("");
      setProcessSteps([]);
      setShowExtractedTexts(false);
    }
    
    // input をリセット
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const addStep = (step: string) => {
    setProcessSteps(prev => [...prev, `${new Date().toLocaleTimeString('ja-JP')}: ${step}`]);
  };

  const extractTextFromSinglePDF = async (file: File, fileName: string): Promise<string> => {
    try {
      // 嘗試使用 PDF.js 進行真實的文字抽取
      let pdfjsLib: any;
      
      try {
        // 動態導入 PDF.js
        pdfjsLib = await import('pdfjs-dist');
        
        // 設定 worker
        if (typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }
        
        // 讀取 PDF 檔案
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = "";
        
        // 逐頁抽取文字
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          
          fullText += `\n--- ページ ${pageNum} ---\n${pageText}\n`;
        }
        
        return fullText.trim();
        
      } catch (pdfError: any) {
        console.warn('PDF.js failed, using mock data:', pdfError);
        
        // PDF.js 失敗時使用模擬資料
        const mockText = `
=== ${fileName} の内容 (模擬データ) ===

【注意】PDF.jsでの文字抽出に失敗したため、模擬データを使用しています。
エラー: ${pdfError.message}

ファイル名: ${fileName}
ファイルサイズ: ${(file.size / 1024).toFixed(2)} KB
処理時刻: ${new Date().toLocaleString('ja-JP')}

【模擬内容】
これは職務経歴書のサンプルテキストです。
実際のPDFからは以下のような情報が抽出されるでしょう：

氏名: 山田太郎
メール: yamada@example.com
電話: 090-1234-5678

【職歴】
2020年4月 - 現在
株式会社サンプル
職種: ソフトウェアエンジニア
業務内容: Webアプリケーション開発、API設計

2018年4月 - 2020年3月  
株式会社テスト
職種: フロントエンドエンジニア
業務内容: React.js、Vue.jsを使用したSPA開発

【スキル】
- JavaScript, TypeScript
- React.js, Next.js
- Node.js, Express
- PostgreSQL, MongoDB
- AWS, Docker

【学歴】
2018年3月 東京大学 工学部 情報工学科 卒業

このデモでは、n8nへの文字データ送信フローを
テストすることができます。
        `;
        
        return mockText.trim();
      }
      
    } catch (error: any) {
      throw new Error(`${fileName}: ファイル処理に失敗しました - ${error.message}`);
    }
  };

  const processBatchFiles = async (): Promise<BatchResult> => {
    const results: BatchResult["results"] = [];
    let successCount = 0;
    let errorCount = 0;

    addStep(`📚 ${selectedFiles.length}個のファイルの処理を開始...`);

    // 各ファイルを順次処理
    for (let i = 0; i < selectedFiles.length; i++) {
      const pdfFile = selectedFiles[i];
      
      try {
        // ファイル状態を更新
        setSelectedFiles(prev => prev.map(f => 
          f.id === pdfFile.id ? { ...f, status: "processing" } : f
        ));

        addStep(`📄 ${i + 1}/${selectedFiles.length}: ${pdfFile.file.name} を処理中...`);
        
        const extractedText = await extractTextFromSinglePDF(pdfFile.file, pdfFile.file.name);
        
        // 成功時の状態更新
        setSelectedFiles(prev => prev.map(f => 
          f.id === pdfFile.id ? { ...f, status: "completed", extractedText } : f
        ));

        results.push({
          fileName: pdfFile.file.name,
          status: "success",
          textLength: extractedText.length,
        });
        
        successCount++;
        addStep(`✅ ${pdfFile.file.name}: 完了 (${extractedText.length} 文字)`);
        
      } catch (error: any) {
        // エラー時の状態更新
        setSelectedFiles(prev => prev.map(f => 
          f.id === pdfFile.id ? { ...f, status: "error", error: error.message } : f
        ));

        results.push({
          fileName: pdfFile.file.name,
          status: "error",
          error: error.message,
        });
        
        errorCount++;
        addStep(`❌ ${pdfFile.file.name}: ${error.message}`);
      }
    }

    return {
      totalFiles: selectedFiles.length,
      successCount,
      errorCount,
      results,
    };
  };

  const sendTextToWebhook = async (batchResult: BatchResult) => {
    if (!webhookUrl) {
      throw new Error("Webhook URLが設定されていません");
    }

    addStep("🚀 n8n Webhookに文字データを送信中...");

    // 成功したファイルの文字データのみを抽出
    const extractedTexts = selectedFiles
      .filter(f => f.status === "completed" && f.extractedText)
      .map(f => ({
        fileName: f.file.name,
        text: f.extractedText,
        textLength: f.extractedText?.length || 0,
      }));

    // シンプルな文字データのペイロード
    const payload = {
      documents: extractedTexts,
      totalDocuments: batchResult.successCount,
      timestamp: new Date().toISOString(),
      requestId: `pdf-extract-${Date.now()}`,
    };

    addStep(`📤 ${extractedTexts.length}件の文字データを送信...`);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
    });

    let result: any;
    let responseText = "";
    
    try {
      responseText = await response.text();
      result = JSON.parse(responseText);
    } catch (parseError) {
      result = { rawResponse: responseText };
    }

    if (!response.ok) {
      const errorDetails = result.error || result.message || responseText || response.statusText;
      addStep(`❌ n8n Webhook エラー: ${response.status}`);
      addStep(`詳細: ${errorDetails}`);
      throw new Error(`n8n Webhook error (${response.status}): ${errorDetails}`);
    }

    addStep(`✅ n8n Webhook送信成功 - AI分析開始`);
    return result;
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!webhookUrl) {
      toast.error("Webhook URLを入力してください");
      return;
    }

    try {
      setStatus("extracting");
      setError("");
      setProcessSteps([]);
      
      const startTime = Date.now();
      
      // Step 1: 批次PDF文字抽出
      addStep("📄 PDF.jsライブラリを読み込み中...");
      const batchResult = await processBatchFiles();
      setBatchResult(batchResult);
      
      // Step 2: n8n Webhookに文字データを送信
      setStatus("uploading");
      const webhookResponse = await sendTextToWebhook(batchResult);
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1);
      
      addStep(`🎉 批次処理完了 (所要時間: ${duration}秒)`);
      addStep(`📊 結果: 成功 ${batchResult.successCount}件, エラー ${batchResult.errorCount}件`);
      
      setWebhookResult(webhookResponse);
      setStatus("success");
      toast.success(`批次処理が完了しました! 成功: ${batchResult.successCount}件 (${duration}秒)`);

    } catch (err: any) {
      console.error("Process error:", err);
      
      let errorMessage = err.message || "処理に失敗しました";
      if (err.message === "Failed to fetch") {
        errorMessage = "CORS エラー: Webhook が CORS を許可していない可能性があります";
        addStep(`❌ ${errorMessage}`);
        addStep(`解決方法: Webhook で CORS headers を設定してください`);
      } else {
        addStep(`❌ エラー: ${err.message}`);
      }
      
      setError(errorMessage);
      setStatus("error");
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setStatus("idle");
    setBatchResult(null);
    setWebhookResult(null);
    setError("");
    setProcessSteps([]);
    setShowExtractedTexts(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Webhook URLを入力してください");
      return;
    }

    try {
      setStatus("uploading");
      setError("");
      setProcessSteps([]);
      addStep("🧪 Webhookをテスト中...");

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          message: "Test webhook connection",
          timestamp: new Date().toISOString(),
        }),
      });

      let result: any;
      let responseText = "";
      
      try {
        responseText = await response.text();
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { rawResponse: responseText };
      }

      if (!response.ok) {
        const errorDetails = result.error || result.message || responseText || response.statusText;
        addStep(`❌ Webhook エラー: ${response.status}`);
        addStep(`詳細: ${errorDetails}`);
        setStatus("error");
        setError(`Webhook test failed (${response.status}): ${errorDetails}`);
        toast.error("Webhookテストに失敗しました");
      } else {
        addStep(`✅ Webhook接続成功!`);
        setWebhookResult(result);
        setStatus("success");
        toast.success("Webhookは正常に動作しています");
      }

    } catch (err: any) {
      console.error("Webhook test error:", err);
      setError(err.message || "テストに失敗しました");
      setStatus("error");
      addStep(`❌ エラー: ${err.message}`);
      toast.error(err.message || "テストに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <div>
            <button
              onClick={() => router.back()}
              className="btn btn-sm btn-ghost gap-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </button>
            <Heading>PDF文字抽出テスト (模擬版)</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              複数のPDFから文字を抽出してWebhookに送信します (最大10ファイル) - 現在は模擬データを使用
            </p>
          </div>
        </div>

        {/* Process Section */}
        <div className="mt-8 space-y-6">
          {/* Webhook URL Settings */}
          <div className="bg-base-100 border border-base-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-base-content/70" />
              <h3 className="text-lg font-semibold">n8n Webhook URL 設定</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-n8n-instance.app/webhook/pdf-text-analysis"
                className="input input-bordered flex-1"
                disabled={status === "extracting" || status === "uploading"}
              />
              <button
                onClick={handleTestWebhook}
                className="btn btn-outline"
                disabled={!webhookUrl || status === "extracting" || status === "uploading"}
              >
                🧪 テスト
              </button>
            </div>
            <p className="text-sm text-base-content/60 mt-2">
              抽出した文字データをAI分析するn8n Webhook URLを入力してください
            </p>
          </div>

          {/* File Upload */}
          <div className="bg-base-100 border-2 border-dashed border-base-300 rounded-lg p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
              
              <p className="text-base font-medium text-base-content mb-2">
                PDFファイルをアップロード (複数選択可能)
              </p>
              <p className="text-sm text-base-content/60 mb-4">
                ファイルサイズ: 10MB以下、最大10ファイル
              </p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
                disabled={status === "extracting" || status === "uploading"}
              />
              <label htmlFor="pdf-upload" className="btn btn-primary">
                <Upload className="w-4 h-4 mr-2" />
                PDFを選択
              </label>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 flex gap-3 justify-center">
                  {status === "idle" && (
                    <>
                      <button onClick={handleProcess} className="btn btn-primary">
                        <Upload className="w-4 h-4 mr-2" />
                        批次処理開始 ({selectedFiles.length}ファイル)
                      </button>
                      <button onClick={handleReset} className="btn btn-ghost">
                        全てクリア
                      </button>
                    </>
                  )}
                  
                  {status === "extracting" && (
                    <button className="btn btn-primary" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      文字抽出中...
                    </button>
                  )}
                  
                  {status === "uploading" && (
                    <button className="btn btn-primary" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      n8n AI分析中...
                    </button>
                  )}
                  
                  {(status === "success" || status === "error") && (
                    <button onClick={handleReset} className="btn btn-primary">
                      新しい批次を開始
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="bg-base-100 border border-base-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                選択されたファイル ({selectedFiles.length}/10)
              </h3>
              <div className="space-y-3">
                {selectedFiles.map((pdfFile) => (
                  <div
                    key={pdfFile.id}
                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-base-content">
                          {pdfFile.file.name}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {formatFileSize(pdfFile.file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {pdfFile.status === "pending" && (
                          <span className="badge badge-ghost badge-sm">待機中</span>
                        )}
                        {pdfFile.status === "processing" && (
                          <span className="badge badge-primary badge-sm">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            処理中
                          </span>
                        )}
                        {pdfFile.status === "completed" && (
                          <span className="badge badge-success badge-sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            完了 ({pdfFile.extractedText?.length || 0} 文字)
                          </span>
                        )}
                        {pdfFile.status === "error" && (
                          <span className="badge badge-error badge-sm">
                            <XCircle className="w-3 h-3 mr-1" />
                            エラー
                          </span>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      {status === "idle" && (
                        <button
                          onClick={() => handleRemoveFile(pdfFile.id)}
                          className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Steps */}
          {processSteps.length > 0 && (
            <div className="bg-base-100 border border-base-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">処理ログ</h3>
              <div className="space-y-2 font-mono text-sm">
                {processSteps.map((step, index) => (
                  <div key={index} className="text-base-content/80">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batch Results Summary */}
          {batchResult && (
            <div className="bg-base-100 border border-base-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">批次処理結果</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-info/10 border border-info/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-info">{batchResult.totalFiles}</div>
                  <div className="text-sm text-base-content/70">総ファイル数</div>
                </div>
                <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success">{batchResult.successCount}</div>
                  <div className="text-sm text-base-content/70">成功</div>
                </div>
                <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-error">{batchResult.errorCount}</div>
                  <div className="text-sm text-base-content/70">エラー</div>
                </div>
              </div>

              {/* Extracted Texts Preview */}
              {selectedFiles.some(f => f.status === "completed") && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold">抽出された文字データ</h4>
                    <button
                      onClick={() => setShowExtractedTexts(!showExtractedTexts)}
                      className="btn btn-sm btn-ghost"
                    >
                      {showExtractedTexts ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          隠す
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          表示
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showExtractedTexts && (
                    <div className="space-y-4">
                      {selectedFiles
                        .filter(f => f.status === "completed" && f.extractedText)
                        .map((pdfFile) => (
                          <div key={pdfFile.id} className="bg-base-200 rounded-lg p-4 border border-base-300">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium text-base-content">
                                {pdfFile.file.name}
                              </h5>
                              <span className="text-xs text-base-content/60">
                                {pdfFile.extractedText?.length || 0} 文字
                              </span>
                            </div>
                            <pre className="text-xs overflow-auto max-h-48 text-base-content whitespace-pre-wrap">
                              {pdfFile.extractedText}
                            </pre>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Results */}
              <div className="space-y-2">
                <h4 className="text-md font-semibold mb-3">詳細結果</h4>
                {batchResult.results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.status === "success" 
                        ? "bg-success/10 border border-success/30" 
                        : "bg-error/10 border border-error/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-error" />
                      )}
                      <span className="text-sm font-medium">{result.fileName}</span>
                    </div>
                    <div className="text-sm text-base-content/70">
                      {result.status === "success" 
                        ? `${result.textLength} 文字` 
                        : result.error
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Result */}
          {status === "success" && webhookResult && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-success">AI分析完了!</h3>
              </div>
              
              <div className="bg-base-100 rounded-lg p-4 border border-base-300">
                <p className="text-sm font-medium text-base-content/60 mb-2">n8n AI分析結果:</p>
                <pre className="text-xs overflow-auto max-h-96 text-base-content">
                  {JSON.stringify(webhookResult, null, 2)}
                </pre>
              </div>

              {webhookResult.rawResponse && (
                <div className="mt-4 bg-base-100 rounded-lg p-4 border border-base-300">
                  <p className="text-sm font-medium text-base-content/60 mb-2">Raw Response:</p>
                  <pre className="text-xs overflow-auto max-h-96 text-base-content whitespace-pre-wrap">
                    {webhookResult.rawResponse}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Error Result */}
          {status === "error" && (
            <div className="bg-error/10 border border-error/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-error" />
                <h3 className="text-lg font-semibold text-error">エラー</h3>
              </div>
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-info/10 border border-info/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-info">使い方</h3>
            <ol className="space-y-2 text-sm text-base-content/80">
              <li>1. <strong>n8n Webhook URL</strong>を入力してください</li>
              <li>2. 複数のPDFファイルを選択してください (最大10ファイル)</li>
              <li>3. 「批次処理開始」ボタンをクリックします</li>
              <li>4. <strong>フロントエンド</strong>で各PDFから文字を抽出します</li>
              <li>5. <strong>文字データのみ</strong>をn8n Webhookに送信します</li>
              <li>6. n8nでAI分析を実行し、JSON結果を返します</li>
            </ol>
            <div className="mt-4 p-3 bg-white/50 rounded border border-info/20">
              <p className="text-xs font-mono text-base-content/70">
                <strong>n8n送信データ形式 (文字のみ):</strong><br/>
                {`{`}<br/>
                {`  "documents": [`}<br/>
                {`    {`}<br/>
                {`      "fileName": "file1.pdf",`}<br/>
                {`      "text": "抽出された文字内容...",`}<br/>
                {`      "textLength": 1000`}<br/>
                {`    }`}<br/>
                {`  ],`}<br/>
                {`  "totalDocuments": 2,`}<br/>
                {`  "timestamp": "2024-01-01T00:00:00.000Z",`}<br/>
                {`  "requestId": "pdf-extract-1234567890"`}<br/>
                {`}`}
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-warning/10 rounded border border-warning/30">
              <p className="text-xs text-base-content/70">
                <strong>⚠️ 現在の状態:</strong><br/>
                • <strong>模擬版</strong> - 実際のPDF文字抽出は未実装<br/>
                • PDF.jsの互換性問題により、模擬データを使用<br/>
                • n8nへの文字データ送信フローはテスト可能<br/>
                • 実際のPDF処理にはサーバーサイド実装が推奨<br/>
                • AI分析結果はn8nから JSON で返されます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
