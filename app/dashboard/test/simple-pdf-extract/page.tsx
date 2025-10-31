"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/catalyst/heading";
import { FileText, Upload, Loader2, ArrowLeft, Eye, EyeOff, Trash2, CheckCircle2, XCircle, Settings } from "lucide-react";
import { toast } from "react-hot-toast";

// 全域變數來存儲 PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface PdfFile {
  file: File;
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  extractedText?: string;
  error?: string;
}

export default function SimplePdfExtractPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string>("");
  const [showTexts, setShowTexts] = useState<boolean>(true);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  const [processSteps, setProcessSteps] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [isWebhookSending, setIsWebhookSending] = useState(false);

  // 載入 PDF.js CDN
  useEffect(() => {
    const loadPdfJs = async () => {
      if (typeof window !== 'undefined' && !window.pdfjsLib) {
        try {
          // 載入 PDF.js CDN
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              setPdfJsLoaded(true);
              console.log('PDF.js CDN 載入完成');
            }
          };
          script.onerror = () => {
            console.error('PDF.js CDN 載入失敗');
            setError('PDF.js 載入失敗');
          };
          document.head.appendChild(script);
        } catch (err) {
          console.error('PDF.js 載入錯誤:', err);
          setError('PDF.js 載入錯誤');
        }
      } else if (window.pdfjsLib) {
        setPdfJsLoaded(true);
      }
    };

    loadPdfJs();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // ファイル数制限チェック
    if (selectedFiles.length + files.length > 5) {
      toast.error("最大5つまでのファイルをアップロードできます");
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
      setError("");
      setProcessSteps([]);
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

  const extractSinglePDF = async (pdfFile: PdfFile): Promise<string> => {
    const pdfjsLib = window.pdfjsLib;
    
    if (!pdfjsLib) {
      throw new Error('PDF.js 未載入');
    }
    
    // 讀取檔案
    const arrayBuffer = await pdfFile.file.arrayBuffer();
    
    // 載入 PDF 文件
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
    });
    
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    
    // 逐頁抽取文字
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      
      fullText += `\n=== 第 ${pageNum} 頁 ===\n${pageText}\n`;
    }
    
    return fullText.trim();
  };

  const extractAllTexts = async () => {
    if (selectedFiles.length === 0 || !pdfJsLoaded) {
      toast.error('ファイルを選択するか、PDF.js の載入を待ってください');
      return;
    }

    setIsExtracting(true);
    setError("");
    setProcessSteps([]);

    try {
      addStep(`📚 ${selectedFiles.length}個のファイルの処理を開始...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // 各ファイルを順次処理
      for (let i = 0; i < selectedFiles.length; i++) {
        const pdfFile = selectedFiles[i];
        
        try {
          // ファイル状態を更新
          setSelectedFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? { ...f, status: "processing" } : f
          ));

          addStep(`📄 ${i + 1}/${selectedFiles.length}: ${pdfFile.file.name} を処理中...`);
          
          const extractedText = await extractSinglePDF(pdfFile);
          
          // 成功時の状態更新
          setSelectedFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? { ...f, status: "completed", extractedText } : f
          ));

          successCount++;
          addStep(`✅ ${pdfFile.file.name}: 完了 (${extractedText.length} 文字)`);
          
        } catch (error: any) {
          // エラー時の状態更新
          setSelectedFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? { ...f, status: "error", error: error.message } : f
          ));

          errorCount++;
          addStep(`❌ ${pdfFile.file.name}: ${error.message}`);
        }
      }
      
      addStep(`🎉 批次処理完了 - 成功: ${successCount}件, エラー: ${errorCount}件`);
      toast.success(`批次処理完了！成功: ${successCount}件, エラー: ${errorCount}件`);
      
    } catch (err: any) {
      console.error("批次処理エラー:", err);
      setError(`批次処理失敗: ${err.message}`);
      toast.error("批次処理失敗");
    } finally {
      setIsExtracting(false);
    }
  };

  const sendToWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Webhook URLを入力してください");
      return;
    }

    const completedFiles = selectedFiles.filter(f => f.status === "completed" && f.extractedText);
    
    if (completedFiles.length === 0) {
      toast.error("送信する文字データがありません");
      return;
    }

    setIsWebhookSending(true);
    setWebhookResult(null);

    try {
      addStep("🚀 Webhookに文字データを送信中...");

      // 文字データを整理
      const documents = completedFiles.map(f => ({
        fileName: f.file.name,
        text: f.extractedText,
        textLength: f.extractedText?.length || 0,
      }));

      // Webhook ペイロード
      const payload = {
        documents,
        totalDocuments: completedFiles.length,
        timestamp: new Date().toISOString(),
        requestId: `pdf-extract-${Date.now()}`,
        source: "simple-pdf-extract"
      };

      addStep(`📤 ${completedFiles.length}件の文字データを送信...`);

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
        addStep(`❌ Webhook エラー: ${response.status}`);
        addStep(`詳細: ${errorDetails}`);
        throw new Error(`Webhook error (${response.status}): ${errorDetails}`);
      }

      addStep(`✅ Webhook送信成功 - AI分析完了`);
      setWebhookResult(result);
      toast.success("Webhook送信成功！");

    } catch (err: any) {
      console.error("Webhook送信エラー:", err);
      
      let errorMessage = err.message || "Webhook送信に失敗しました";
      if (err.message === "Failed to fetch") {
        errorMessage = "CORS エラー: Webhook が CORS を許可していない可能性があります";
        addStep(`❌ ${errorMessage}`);
        addStep(`解決方法: Webhook で CORS headers を設定してください`);
      } else {
        addStep(`❌ エラー: ${err.message}`);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsWebhookSending(false);
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Webhook URLを入力してください");
      return;
    }

    setIsWebhookSending(true);
    setWebhookResult(null);

    try {
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
        setError(`Webhook test failed (${response.status}): ${errorDetails}`);
        toast.error("Webhookテストに失敗しました");
      } else {
        addStep(`✅ Webhook接続成功!`);
        setWebhookResult(result);
        toast.success("Webhookは正常に動作しています");
      }

    } catch (err: any) {
      console.error("Webhook test error:", err);
      setError(err.message || "テストに失敗しました");
      addStep(`❌ エラー: ${err.message}`);
      toast.error(err.message || "テストに失敗しました");
    } finally {
      setIsWebhookSending(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setError("");
    setProcessSteps([]);
    setWebhookResult(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <Heading>簡単PDF文字抽出 (複数対応)</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              複数のPDFファイルから文字を抽出してテストします (最大5ファイル)
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Webhook URL Settings */}
          <div className="bg-base-100 border border-base-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-base-content/70" />
              <h3 className="text-lg font-semibold">Webhook URL 設定</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-webhook-url.com/endpoint"
                className="input input-bordered flex-1"
                disabled={isExtracting || isWebhookSending}
              />
              <button
                onClick={testWebhook}
                className="btn btn-outline"
                disabled={!webhookUrl || isExtracting || isWebhookSending}
              >
                🧪 テスト
              </button>
            </div>
            <p className="text-sm text-base-content/60 mt-2">
              抽出した文字データを送信するWebhook URLを入力してください
            </p>
          </div>

          {/* File Upload */}
          <div className="bg-base-100 border-2 border-dashed border-base-300 rounded-lg p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
              
              <p className="text-base font-medium text-base-content mb-2">
                PDFファイルを選択 (複数選択可能)
              </p>
              <p className="text-sm text-base-content/60 mb-4">
                ファイルサイズ: 10MB以下、最大5ファイル
              </p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
                disabled={isExtracting || !pdfJsLoaded}
              />
              <label 
                htmlFor="pdf-upload" 
                className={`btn ${pdfJsLoaded ? 'btn-primary' : 'btn-disabled'}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {pdfJsLoaded ? 'PDFを選択' : 'PDF.js 載入中...'}
              </label>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 flex gap-3 justify-center">
                  {!isExtracting && !isWebhookSending && (
                    <>
                      {selectedFiles.every(f => f.status === "pending") && (
                        <button 
                          onClick={extractAllTexts} 
                          className="btn btn-primary"
                          disabled={!pdfJsLoaded}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          批次文字抽出開始 ({selectedFiles.length}ファイル)
                        </button>
                      )}
                      
                      {selectedFiles.some(f => f.status === "completed") && (
                        <button 
                          onClick={sendToWebhook} 
                          className="btn btn-success"
                          disabled={!webhookUrl}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Webhookに送信 ({selectedFiles.filter(f => f.status === "completed").length}件)
                        </button>
                      )}
                      
                      <button onClick={handleReset} className="btn btn-ghost">
                        全てクリア
                      </button>
                    </>
                  )}
                  
                  {isExtracting && (
                    <button className="btn btn-primary" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      批次処理中...
                    </button>
                  )}
                  
                  {isWebhookSending && (
                    <button className="btn btn-success" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Webhook送信中...
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
                選択されたファイル ({selectedFiles.length}/5)
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
                      {!isExtracting && (
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

          {/* Error Display */}
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-error mb-2">エラー</h3>
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Extracted Texts Display */}
          {selectedFiles.some(f => f.status === "completed") && (
            <div className="bg-base-100 border border-base-300 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">抽出された文字</h3>
                <button
                  onClick={() => setShowTexts(!showTexts)}
                  className="btn btn-sm btn-ghost"
                >
                  {showTexts ? (
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
              
              {showTexts && (
                <div className="space-y-4">
                  {selectedFiles
                    .filter(f => f.status === "completed" && f.extractedText)
                    .map((pdfFile) => (
                      <div key={pdfFile.id} className="bg-base-200 rounded-lg p-4 border border-base-300">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-base-content">
                            📄 {pdfFile.file.name}
                          </h4>
                          <span className="text-sm text-base-content/60">
                            {pdfFile.extractedText?.length || 0} 文字
                          </span>
                        </div>
                        <pre className="text-sm overflow-auto max-h-64 text-base-content whitespace-pre-wrap">
                          {pdfFile.extractedText}
                        </pre>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Webhook Result */}
          {webhookResult && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-success">Webhook送信成功!</h3>
              </div>
              
              <div className="bg-base-100 rounded-lg p-4 border border-base-300">
                <p className="text-sm font-medium text-base-content/60 mb-2">Webhook Response:</p>
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

          {/* Instructions */}
          <div className="bg-info/10 border border-info/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-info">使い方</h3>
            <ol className="space-y-2 text-sm text-base-content/80">
              <li>1. <strong>Webhook URL</strong>を入力してください</li>
              <li>2. 複数のPDFファイルを選択してください (最大5ファイル)</li>
              <li>3. 「批次文字抽出開始」ボタンをクリックします</li>
              <li>4. ブラウザで各PDFから順次文字を抽出します</li>
              <li>5. 「Webhookに送信」ボタンで抽出した文字をWebhookに送信します</li>
              <li>6. Webhookからの応答が表示されます</li>
            </ol>
            
            <div className="mt-4 p-3 bg-white/50 rounded border border-info/20">
              <p className="text-xs font-mono text-base-content/70">
                <strong>Webhook送信データ形式 (JSON):</strong><br/>
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
                {`  "requestId": "pdf-extract-1234567890",`}<br/>
                {`  "source": "simple-pdf-extract"`}<br/>
                {`}`}
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-warning/10 rounded border border-warning/30">
              <p className="text-xs text-base-content/70">
                <strong>⚠️ 注意事項:</strong><br/>
                • PDF.js CDN を使用してブラウザで文字抽出を行います<br/>
                • 画像化されたPDFは文字抽出できません<br/>
                • 複雑なレイアウトの場合、文字順序が正しくない場合があります<br/>
                • 複数ファイルは順次処理されます（並列処理ではありません）<br/>
                • 個別ファイルのエラーは他のファイル処理に影響しません<br/>
                • <strong>Webhook で CORS を許可する必要があります</strong><br/>
                • 抽出された文字データのみ送信されます（ファイルは送信されません）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
