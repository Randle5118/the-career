"use client";

import React, { useState, useRef } from "react";
import Modal from "./Modal";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import type { ApplicationFormData } from "@/types/application";
import type { ParsedJobDescription } from "@/libs/ai/types";
import { extractTextFromPdf } from "@/libs/pdf/extract-text";

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParseSuccess: (data: Partial<ApplicationFormData>) => void;
}

/**
 * PDF アップロード & パースモーダル
 * PDF をアップロードして JD 情報を自動抽出
 */
export default function PDFUploadModal({
  isOpen,
  onClose,
  onParseSuccess,
}: PDFUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // PDF のみ許可
    if (selectedFile.type !== "application/pdf") {
      setError("PDFファイルのみアップロード可能です");
      setFile(null);
      return;
    }

    // ファイルサイズチェック (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    
    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      setError("PDFファイルのみアップロード可能です");
      return;
    }

    if (droppedFile.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください");
      return;
    }

    setFile(droppedFile);
    setError("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("ファイルを選択してください");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // 1. PDF からテキストを抽出 (クライアントサイド)
      console.log("[PDFUpload] Extracting text from PDF...");
      const textContent = await extractTextFromPdf(file);
      
      if (!textContent || textContent.trim().length === 0) {
        throw new Error("PDFからテキストを抽出できませんでした。スキャン画像のみのPDFは対応していません。");
      }

      console.log(`[PDFUpload] Text extracted, length: ${textContent.length}`);

      // 2. AI Service API に送信
      const response = await fetch("/api/ai/parse-job-posting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textContent,
          fileName: file.name,
        }),
      });

      const result = await response.json();

      // 3. エラーハンドリング (新しい API 形式)
      if (!response.ok) {
        const errorMessage = result.message || result.error || "PDF解析に失敗しました";
        const isRetryable = result.isRetryable ?? false;
        
        // Rate Limit エラーの場合
        if (response.status === 429) {
          throw new Error("解析リクエストが多すぎます。数分後に再度お試しください。");
        }
        
        // Quota エラーの場合
        if (result.error === "AI_QUOTA_EXCEEDED") {
          throw new Error("AI解析サービスの利用枠が上限に達しました。管理者にお問い合わせください。");
        }
        
        throw new Error(isRetryable ? `${errorMessage}（再試行可能）` : errorMessage);
      }

      // 4. ParsedJobDescription を ApplicationFormData に変換
      const parsedData = result.data as ParsedJobDescription;
      const normalizedData = transformParsedJobToApplicationForm(parsedData);
      
      // 5. 成功: データを親コンポーネントに渡す
      toast.success("PDFを解析しました");
      onParseSuccess(normalizedData);
      handleClose();
    } catch (err: unknown) {
      console.error("[PDFUpload] Error:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "PDF解析に失敗しました。もう一度お試しください。";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * ParsedJobDescription を ApplicationFormData に変換
   */
  const transformParsedJobToApplicationForm = (
    parsed: ParsedJobDescription
  ): Partial<ApplicationFormData> => {
    const result: Partial<ApplicationFormData> = {};

    // 基本情報
    if (parsed.company_name) result.companyName = parsed.company_name;
    if (parsed.company_url) result.companyUrl = parsed.company_url;
    if (parsed.position_title) result.position = parsed.position_title;

    // 雇用形態を変換
    if (parsed.employment_type) {
      const typeMapping: Record<string, ApplicationFormData["employmentType"]> = {
        "正社員": "full_time",
        "契約社員": "contract",
        "派遣社員": "temporary",
        "パート・アルバイト": "part_time",
        "業務委託": "freelance",
        "フリーランス": "freelance",
      };
      result.employmentType = typeMapping[parsed.employment_type] || "full_time";
    }

    // 給与情報
    if (parsed.salary_range) {
      result.postedSalary = {
        minAnnualSalary: parsed.salary_range.min ?? undefined,
        maxAnnualSalary: parsed.salary_range.max ?? undefined,
        notes: parsed.benefits?.join("、"),
      };
    }

    // タグ
    if (parsed.tags && parsed.tags.length > 0) {
      result.tags = parsed.tags;
    }

    // メモ (職務内容や要件をまとめて記載)
    const noteParts: string[] = [];
    if (parsed.job_description) {
      noteParts.push(`【職務概要】\n${parsed.job_description}`);
    }
    if (parsed.responsibilities && parsed.responsibilities.length > 0) {
      noteParts.push(`【業務内容】\n${parsed.responsibilities.map(r => `・${r}`).join("\n")}`);
    }
    if (parsed.requirements && parsed.requirements.length > 0) {
      noteParts.push(`【必須条件】\n${parsed.requirements.map(r => `・${r}`).join("\n")}`);
    }
    if (parsed.preferred_qualifications && parsed.preferred_qualifications.length > 0) {
      noteParts.push(`【歓迎条件】\n${parsed.preferred_qualifications.map(r => `・${r}`).join("\n")}`);
    }
    if (parsed.remote_policy) {
      noteParts.push(`【リモート】${parsed.remote_policy}`);
    }
    if (parsed.work_location) {
      noteParts.push(`【勤務地】${parsed.work_location}`);
    }
    
    if (noteParts.length > 0) {
      result.notes = noteParts.join("\n\n");
    }

    return result;
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="求人票PDFをアップロード"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <p className="text-base-content/70 text-sm">
          求人票のPDFファイルをアップロードすると、自動的に応募情報を抽出します。
        </p>

        {/* File Drop Zone */}
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-base-300 rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-base-content/40 mx-auto mb-4" />
            <p className="text-base-content/70 mb-2">
              クリックしてファイルを選択、またはドラッグ&ドロップ
            </p>
            <p className="text-sm text-base-content/50">
              PDFファイルのみ（最大10MB）
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border border-base-300 rounded-xl p-4 bg-base-200/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-base-content truncate">
                  {file.name}
                </p>
                <p className="text-sm text-base-content/60">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {!isUploading && (
                <button
                  onClick={handleRemoveFile}
                  className="btn btn-sm btn-ghost btn-circle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-error/10 border border-error/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <p className="text-sm text-base-content/70">
            <strong className="text-base-content">ℹ️ ヒント:</strong> 
            PDFから抽出された情報は自動入力されますが、必ず内容を確認して修正してください。
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
          <button
            onClick={handleClose}
            className="btn btn-ghost"
            disabled={isUploading}
          >
            キャンセル
          </button>
          <button
            onClick={handleUpload}
            className="btn btn-primary"
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                解析中...
              </>
            ) : (
              "アップロードして解析"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

