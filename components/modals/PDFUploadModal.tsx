"use client";

import React, { useState, useRef } from "react";
import Modal from "./Modal";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import type { ApplicationFormData } from "@/types/application";

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
      // PDF を Base64 に変換
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // data:application/pdf;base64, を除去
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Next.js API Route に送信 (認証チェック含む)
      const response = await fetch("/api/ai/parse-job-posting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileContent: base64,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "PDF解析に失敗しました");
      }

      const result = await response.json();
      
      // n8n returns nested structure: { success: true, data: { success: true, data: {...} } }
      let parsedData = result.data;
      
      // Handle nested response from n8n
      if (parsedData && parsedData.data) {
        parsedData = parsedData.data;
      }
      
      // Convert snake_case to camelCase for TypeScript
      // Only include non-null values
      const normalizedData: Partial<ApplicationFormData> = {};
      
      if (parsedData.company_name) normalizedData.companyName = parsedData.company_name;
      if (parsedData.company_url) normalizedData.companyUrl = parsedData.company_url;
      if (parsedData.position) normalizedData.position = parsedData.position;
      if (parsedData.status) normalizedData.status = parsedData.status;
      if (parsedData.employment_type) normalizedData.employmentType = parsedData.employment_type;
      if (parsedData.application_method) normalizedData.applicationMethod = parsedData.application_method;
      if (parsedData.posted_salary) normalizedData.postedSalary = parsedData.posted_salary;
      if (parsedData.desired_salary) normalizedData.desiredSalary = parsedData.desired_salary?.toString();
      if (parsedData.tags && Array.isArray(parsedData.tags)) normalizedData.tags = parsedData.tags;
      if (parsedData.notes) normalizedData.notes = parsedData.notes;
      if (parsedData.schedule) normalizedData.schedule = parsedData.schedule;
      
      // 成功: データを親コンポーネントに渡す
      toast.success("PDFを解析しました");
      onParseSuccess(normalizedData);
      handleClose();
    } catch (err: any) {
      console.error("PDF upload error:", err);
      const errorMessage = err.message || "PDF解析に失敗しました。もう一度お試しください。";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
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

