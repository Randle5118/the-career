"use client";

import { useState } from "react";
import { Heading } from "@/components/catalyst/heading";
import { FileText, Upload, Loader2, CheckCircle2, XCircle, Settings } from "lucide-react";
import { toast } from "react-hot-toast";

type AnalysisStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

export default function TestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("PDFファイルのみアップロードできます");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("ファイルサイズは10MB以下にしてください");
        return;
      }
      setSelectedFile(file);
      setStatus("idle");
      setAnalysisResult(null);
      setError("");
      setAnalysisSteps([]);
    }
  };

  const addStep = (step: string) => {
    setAnalysisSteps(prev => [...prev, `${new Date().toLocaleTimeString('ja-JP')}: ${step}`]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    if (!webhookUrl) {
      toast.error("Webhook URLを入力してください");
      return;
    }

    try {
      setStatus("uploading");
      setError("");
      addStep("📄 PDFファイルを準備中...");

      const startTime = Date.now();
      
      setStatus("analyzing");
      addStep("🚀 n8n Webhookにアップロード中...");

      // 方法 1: FormData (推薦 - 如果 n8n 支援 multipart/form-data)
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFile.name);
      formData.append("fileSize", selectedFile.size.toString());
      formData.append("timestamp", new Date().toISOString());

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        mode: "cors", // 明確指定 CORS 模式
        // 不設定 Content-Type,讓瀏覽器自動設定 multipart/form-data boundary
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1);

      // 嘗試讀取回應內容 (不管成功或失敗)
      let result: any;
      let responseText = "";
      
      try {
        responseText = await response.text();
        result = JSON.parse(responseText);
      } catch (parseError) {
        // 如果不是 JSON,保留原始文字
        result = { rawResponse: responseText };
      }

      if (!response.ok) {
        // 顯示詳細錯誤資訊
        const errorDetails = result.error || result.message || responseText || response.statusText;
        addStep(`❌ Webhook 錯誤: ${response.status}`);
        addStep(`詳細: ${errorDetails}`);
        throw new Error(`Webhook error (${response.status}): ${errorDetails}`);
      }
      
      addStep(`✅ 分析完了 (所要時間: ${duration}秒)`);
      setAnalysisResult(result);
      setStatus("success");
      toast.success(`分析が完了しました! (${duration}秒)`);

    } catch (err: any) {
      console.error("Upload error:", err);
      
      // CORS 錯誤特別處理
      let errorMessage = err.message || "アップロードに失敗しました";
      if (err.message === "Failed to fetch") {
        errorMessage = "CORS エラー: n8n Webhook が CORS を許可していない可能性があります";
        addStep(`❌ ${errorMessage}`);
        addStep(`解決方法: n8n の Webhook Response で CORS headers を設定してください`);
      } else {
        addStep(`❌ エラー: ${err.message}`);
      }
      
      setError(errorMessage);
      setStatus("error");
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus("idle");
    setAnalysisResult(null);
    setError("");
    setAnalysisSteps([]);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Webhook URLを入力してください");
      return;
    }

    try {
      setStatus("analyzing");
      setError("");
      setAnalysisSteps([]);
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
        setAnalysisResult(result);
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
            <Heading>AI PDF Analysis Test</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              求人票PDFをアップロードしてAI分析をテストします
            </p>
          </div>
        </div>

        {/* Upload Section */}
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
                placeholder="https://your-n8n-instance.app/webhook/parse-pdf"
                className="input input-bordered flex-1"
                disabled={status === "uploading" || status === "analyzing"}
              />
              <button
                onClick={handleTestWebhook}
                className="btn btn-outline"
                disabled={!webhookUrl || status === "uploading" || status === "analyzing"}
              >
                🧪 テスト
              </button>
            </div>
            <p className="text-sm text-base-content/60 mt-2">
              n8nのWebhook URLを入力してください (例: https://xxxxx.app.n8n.cloud/webhook/xxxxx)
            </p>
          </div>

          {/* File Upload */}
          <div className="bg-base-100 border-2 border-dashed border-base-300 rounded-lg p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
              
              {!selectedFile ? (
                <>
                  <p className="text-base font-medium text-base-content mb-2">
                    求人票PDFをアップロード
                  </p>
                  <p className="text-sm text-base-content/60 mb-4">
                    ファイルサイズ: 10MB以下
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                    disabled={status === "uploading" || status === "analyzing"}
                  />
                  <label htmlFor="pdf-upload" className="btn btn-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    PDFを選択
                  </label>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 text-base-content">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-sm text-base-content/60">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    {status === "idle" && (
                      <>
                        <button onClick={handleUpload} className="btn btn-primary">
                          <Upload className="w-4 h-4 mr-2" />
                          分析開始
                        </button>
                        <button onClick={handleReset} className="btn btn-ghost">
                          キャンセル
                        </button>
                      </>
                    )}
                    
                    {(status === "uploading" || status === "analyzing") && (
                      <button className="btn btn-primary" disabled>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {status === "uploading" ? "アップロード中..." : "AI分析中..."}
                      </button>
                    )}
                    
                    {(status === "success" || status === "error") && (
                      <button onClick={handleReset} className="btn btn-primary">
                        別のファイルを分析
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Steps */}
          {analysisSteps.length > 0 && (
            <div className="bg-base-100 border border-base-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">処理ログ</h3>
              <div className="space-y-2 font-mono text-sm">
                {analysisSteps.map((step, index) => (
                  <div key={index} className="text-base-content/80">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Result */}
          {status === "success" && analysisResult && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-success">分析成功!</h3>
              </div>
              
              <div className="bg-base-100 rounded-lg p-4 border border-base-300">
                <p className="text-sm font-medium text-base-content/60 mb-2">n8n Response:</p>
                <pre className="text-xs overflow-auto max-h-96 text-base-content">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </div>

              {/* 如果有 rawResponse,顯示原始內容 */}
              {analysisResult.rawResponse && (
                <div className="mt-4 bg-base-100 rounded-lg p-4 border border-base-300">
                  <p className="text-sm font-medium text-base-content/60 mb-2">Raw Response:</p>
                  <pre className="text-xs overflow-auto max-h-96 text-base-content whitespace-pre-wrap">
                    {analysisResult.rawResponse}
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
              <li>2. 求人票のPDFファイルを選択してください</li>
              <li>3. 「分析開始」ボタンをクリックします</li>
              <li>4. PDFファイルを直接n8n Webhookに送信します</li>
              <li>5. n8nでPDF解析とAI分析を実行します</li>
              <li>6. n8nから返ってきた解析結果が表示されます</li>
            </ol>
            <div className="mt-4 p-3 bg-white/50 rounded border border-info/20">
              <p className="text-xs font-mono text-base-content/70">
                <strong>送信データ形式 (FormData):</strong><br/>
                {`file: [PDF File]`}<br/>
                {`fileName: string`}<br/>
                {`fileSize: string`}<br/>
                {`timestamp: string`}
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-warning/10 rounded border border-warning/30">
              <p className="text-xs text-base-content/70">
                <strong>⚠️ n8n 設定 (重要!):</strong><br/>
                1. Webhook node で <code className="bg-base-200 px-1 rounded">Binary Data: Yes</code> を有効にする<br/>
                2. Respond to Webhook で CORS headers を追加:
              </p>
              <pre className="text-xs mt-2 bg-base-200 p-2 rounded overflow-x-auto">
{`Headers:
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

