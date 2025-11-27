"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  Upload,
  FileText,
  Loader2,
  X,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
} from "lucide-react";
import { extractTextFromPdf } from "@/libs/pdf/extract-text";
import { analyzeResumeAction } from "@/app/actions/analyze-resume";
import { toast } from "react-hot-toast";

interface PdfImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: (data: any) => void;
}

type Step = "upload" | "extracting" | "review" | "analyzing" | "complete";

interface FileItem {
  id: string;
  file: File;
  status: "pending" | "extracting" | "extracted" | "error";
  extractedText?: string;
  textLength?: number;
  error?: string;
}

const MAX_FILES = 5;

export default function PdfImporterModal({
  isOpen,
  onClose,
  onAnalysisComplete,
}: PdfImporterModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [analysisError, setAnalysisError] = useState<{
    message: string;
    isRetryable: boolean;
    errorCode?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep("upload");
    setFiles([]);
    setAnalysisError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (step === "extracting" || step === "analyzing") {
      toast.error("処理中です。しばらくお待ちください");
      return;
    }
    resetState();
    onClose();
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const pdfFiles = fileArray.filter((f) => f.type === "application/pdf");

    if (pdfFiles.length === 0) {
      toast.error("PDFファイルのみアップロード可能です");
      return;
    }

    const remainingSlots = MAX_FILES - files.length;
    if (pdfFiles.length > remainingSlots) {
      toast.error(`最大${MAX_FILES}個のファイルまでアップロード可能です`);
      return;
    }

    const newFileItems: FileItem[] = pdfFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFileItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleAddFiles(selectedFiles);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleAddFiles(droppedFiles);
      }
    },
    [files.length]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 步驟 1: 提取所有 PDF 的文字
  const handleExtractAll = async () => {
    if (files.length === 0) {
      toast.error("ファイルを選択してください");
      return;
    }

    setStep("extracting");

    // 依序提取每個 PDF 的文字
    const results: { id: string; success: boolean }[] = [];

    for (const fileItem of files) {
      if (fileItem.status !== "pending") continue;

      try {
        // 更新狀態為提取中
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "extracting" as const } : f
          )
        );

        // 提取文字
        const text = await extractTextFromPdf(fileItem.file);

        if (!text || text.trim().length === 0) {
          throw new Error("テキストを抽出できませんでした");
        }

        // 更新為提取完成
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "extracted" as const,
                  extractedText: text,
                  textLength: text.length,
                }
              : f
          )
        );

        results.push({ id: fileItem.id, success: true });
      } catch (error) {
        console.error(
          `[PdfImporter] Error extracting ${fileItem.file.name}:`,
          error
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "error" as const,
                  error:
                    error instanceof Error
                      ? error.message
                      : "抽出に失敗しました",
                }
              : f
          )
        );

        results.push({ id: fileItem.id, success: false });
      }
    }

    // 檢查是否有成功提取的檔案
    const successCount = results.filter((r) => r.success).length;
    if (successCount > 0) {
      setStep("review");
      toast.success(`${successCount}個のファイルからテキストを抽出しました`);
    } else {
      toast.error("テキスト抽出に失敗しました");
      setStep("upload");
    }
  };

  // 步驟 2: 合併所有文字並呼叫 AI 分析
  const handleAnalyze = async () => {
    const extractedFiles = files.filter(
      (f) => f.status === "extracted" && f.extractedText
    );

    if (extractedFiles.length === 0) {
      toast.error("解析できるテキストがありません");
      return;
    }

    setStep("analyzing");
    setAnalysisError(null);

    try {
      // 合併所有文字
      let combinedText: string;

      if (extractedFiles.length === 1) {
        // 單一檔案：直接使用
        combinedText = extractedFiles[0].extractedText!;
      } else {
        // 多個檔案：合併並標記來源
        combinedText = extractedFiles
          .map((f, index) => {
            const header = `\n\n========== ファイル ${index + 1}: ${
              f.file.name
            } ==========\n\n`;
            return header + f.extractedText;
          })
          .join("\n\n");
      }

      console.log(
        `[PdfImporter] Analyzing combined text length: ${combinedText.length}`
      );

      // 呼叫 AI 分析
      const result = await analyzeResumeAction(
        combinedText,
        extractedFiles.length === 1
          ? extractedFiles[0].file.name
          : `${extractedFiles.length}個のファイル`
      );

      if (!result.success) {
        setAnalysisError({
          message: result.error || "分析に失敗しました",
          isRetryable: result.isRetryable || false,
          errorCode: result.errorCode,
        });
        setStep("review"); // 返回 review 狀態讓使用者可以重試
        return;
      }

      // 分析成功
      setStep("complete");
      toast.success("AI解析が完了しました！");

      // 傳遞結果給父組件
      if (onAnalysisComplete && result.data) {
        onAnalysisComplete(result.data);
      }

      // 自動關閉
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("[PdfImporter] Analysis error:", error);
      setAnalysisError({
        message:
          error instanceof Error
            ? error.message
            : "予期しないエラーが発生しました",
        isRetryable: true,
      });
      setStep("review");
    }
  };

  // 重試提取特定檔案
  const handleRetryExtract = async (fileItem: FileItem) => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "extracting" as const, error: undefined }
            : f
        )
      );

      const text = await extractTextFromPdf(fileItem.file);

      if (!text || text.trim().length === 0) {
        throw new Error("テキストを抽出できませんでした");
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "extracted" as const,
                extractedText: text,
                textLength: text.length,
              }
            : f
        )
      );

      toast.success("再抽出に成功しました");
    } catch (error) {
      console.error(`[PdfImporter] Retry extract error:`, error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "error" as const,
                error:
                  error instanceof Error ? error.message : "抽出に失敗しました",
              }
            : f
        )
      );
      toast.error("再抽出に失敗しました");
    }
  };

  const getStatusIcon = (status: FileItem["status"]) => {
    switch (status) {
      case "pending":
        return <FileText className="w-4 h-4 text-base-content/50" />;
      case "extracting":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "extracted":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-error" />;
    }
  };

  const getStatusText = (status: FileItem["status"]) => {
    switch (status) {
      case "pending":
        return "待機中";
      case "extracting":
        return "テキスト抽出中...";
      case "extracted":
        return "抽出完了";
      case "error":
        return "エラー";
    }
  };

  const extractedCount = files.filter((f) => f.status === "extracted").length;
  const totalTextLength = files
    .filter((f) => f.status === "extracted")
    .reduce((sum, f) => sum + (f.textLength || 0), 0);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all border border-base-200">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-base-content flex items-center gap-2"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    PDFから履歴書を作成 (AI解析)
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="btn btn-sm btn-circle btn-ghost"
                    disabled={step === "extracting" || step === "analyzing"}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Step Indicator */}
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <div
                      className={`badge ${
                        step === "upload" || step === "extracting"
                          ? "badge-primary"
                          : "badge-ghost"
                      }`}
                    >
                      1. ファイル選択
                    </div>
                    <div className="w-8 h-px bg-base-300" />
                    <div
                      className={`badge ${
                        step === "review" ? "badge-primary" : "badge-ghost"
                      }`}
                    >
                      2. 内容確認
                    </div>
                    <div className="w-8 h-px bg-base-300" />
                    <div
                      className={`badge ${
                        step === "analyzing" || step === "complete"
                          ? "badge-primary"
                          : "badge-ghost"
                      }`}
                    >
                      3. AI解析
                    </div>
                  </div>

                  {/* Upload Area */}
                  {(step === "upload" || step === "extracting") && (
                    <div
                      className="border-2 border-dashed border-base-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-base-200/30 transition-all cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() =>
                        step === "upload" && fileInputRef.current?.click()
                      }
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,application/pdf"
                        multiple
                        className="hidden"
                        disabled={
                          files.length >= MAX_FILES || step === "extracting"
                        }
                      />
                      <Upload className="w-12 h-12 text-base-content/30 mb-4" />
                      <p className="text-base font-medium text-base-content mb-2">
                        PDFファイルをドラッグ＆ドロップ
                      </p>
                      <p className="text-sm text-base-content/60 mb-4">
                        または クリックしてファイルを選択
                      </p>
                      <p className="text-xs text-base-content/50">
                        最大{MAX_FILES}個のPDFファイル • 現在: {files.length}/
                        {MAX_FILES}
                      </p>
                    </div>
                  )}

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-base-content/70">
                        選択されたファイル ({files.length})
                      </p>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {files.map((fileItem) => (
                          <div
                            key={fileItem.id}
                            className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg border border-base-300"
                          >
                            {getStatusIcon(fileItem.status)}

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-base-content truncate">
                                {fileItem.file.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-base-content/60">
                                  {getStatusText(fileItem.status)}
                                </p>
                                {fileItem.textLength && (
                                  <span className="text-xs text-base-content/50">
                                    • {fileItem.textLength.toLocaleString()}{" "}
                                    文字
                                  </span>
                                )}
                              </div>
                              {fileItem.error && (
                                <p className="text-xs text-error mt-1">
                                  {fileItem.error}
                                </p>
                              )}
                            </div>

                            {fileItem.status === "error" && (
                              <button
                                onClick={() => handleRetryExtract(fileItem)}
                                className="btn btn-xs btn-outline btn-primary"
                                disabled={step === "extracting"}
                              >
                                再試行
                              </button>
                            )}

                            {(fileItem.status === "pending" ||
                              fileItem.status === "error") &&
                              step === "upload" && (
                                <button
                                  onClick={() => handleRemoveFile(fileItem.id)}
                                  className="btn btn-xs btn-circle btn-ghost text-error"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Summary */}
                  {step === "review" && (
                    <div className="alert alert-info">
                      <Eye className="w-5 h-5" />
                      <div>
                        <p className="font-medium">
                          {extractedCount}個のファイルからテキストを抽出しました
                        </p>
                        <p className="text-xs mt-1">
                          合計 {totalTextLength.toLocaleString()} 文字 •
                          AI解析を開始しますか？
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analysis Error */}
                  {analysisError && (
                    <div className="alert alert-error">
                      <AlertCircle className="w-5 h-5" />
                      <div className="flex-1">
                        <p className="font-medium">{analysisError.message}</p>
                        {analysisError.errorCode && (
                          <p className="text-xs mt-1">
                            エラーコード: {analysisError.errorCode}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Analyzing State */}
                  {step === "analyzing" && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                      <p className="text-base font-medium text-base-content">
                        AI解析中...
                      </p>
                      <p className="text-sm text-base-content/60 mt-2">
                        {extractedCount}個のファイルを解析しています
                      </p>
                    </div>
                  )}

                  {/* Complete State */}
                  {step === "complete" && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <CheckCircle className="w-12 h-12 text-success mb-4" />
                      <p className="text-base font-medium text-base-content">
                        解析完了！
                      </p>
                      <p className="text-sm text-base-content/60 mt-2">
                        データを取り込んでいます...
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-300">
                    <button
                      onClick={handleClose}
                      className="btn btn-ghost btn-sm"
                      disabled={step === "extracting" || step === "analyzing"}
                    >
                      キャンセル
                    </button>

                    {step === "upload" && files.length > 0 && (
                      <button
                        onClick={handleExtractAll}
                        className="btn btn-primary btn-sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        テキストを抽出
                      </button>
                    )}

                    {step === "review" && extractedCount > 0 && (
                      <button
                        onClick={handleAnalyze}
                        className="btn btn-primary btn-sm"
                      >
                        <Loader2 className="w-4 h-4 mr-2" />
                        AI解析を開始
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
