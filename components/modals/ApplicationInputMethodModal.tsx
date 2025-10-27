"use client";

import React from "react";
import Modal from "./Modal";
import { FileText, PenSquare, Upload } from "lucide-react";

interface ApplicationInputMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualInput: () => void;
  onPDFUpload: () => void;
}

/**
 * 應募情報の入力方法選択モーダル
 * 手動入力 or PDF アップロードを選択
 */
export default function ApplicationInputMethodModal({
  isOpen,
  onClose,
  onManualInput,
  onPDFUpload,
}: ApplicationInputMethodModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="応募情報の追加方法を選択"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <p className="text-base-content/70 text-sm">
          応募情報をどのように追加しますか？
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 手動入力 */}
          <button
            onClick={onManualInput}
            className="flex flex-col items-center gap-4 p-6 border-2 border-base-300 rounded-xl hover:border-primary hover:bg-base-200/50 transition-all group"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <PenSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-base-content mb-1">
                手動入力
              </h3>
              <p className="text-sm text-base-content/60">
                フォームに直接入力する
              </p>
            </div>
          </button>

          {/* PDF アップロード */}
          <button
            onClick={onPDFUpload}
            className="flex flex-col items-center gap-4 p-6 border-2 border-base-300 rounded-xl hover:border-primary hover:bg-base-200/50 transition-all group"
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Upload className="w-8 h-8 text-secondary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-base-content mb-1">
                PDF アップロード
              </h3>
              <p className="text-sm text-base-content/60">
                求人票PDFから自動抽出
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <FileText className="w-3.5 h-3.5 text-base-content/40" />
                <span className="text-xs text-base-content/40">
                  PDFファイルのみ対応
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-base-300">
          <button onClick={onClose} className="btn btn-ghost">
            キャンセル
          </button>
        </div>
      </div>
    </Modal>
  );
}

