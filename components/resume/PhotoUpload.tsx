"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { compressImage, validateImageFile } from "@/libs/storage/resume-image";

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (file: File | null) => void;
  className?: string;
}

export default function PhotoUpload({ currentPhotoUrl, onPhotoChange, className = "" }: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // currentPhotoUrlが変更されたときにプレビューを更新
  useEffect(() => {
    setPreviewUrl(currentPhotoUrl);
  }, [currentPhotoUrl]);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // ファイルを検証
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "無効なファイルです");
      return;
    }
    
    try {
      // 画像を圧縮（ファイルサイズを削減）
      const compressedFile = await compressImage(file, 800, 0.8);
      
      // プレビューを設定（object URLを使用）
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(objectUrl);
      
      // ファイルを保存し、フォーム送信時にアップロードを待機
      setSelectedFile(compressedFile);
      
      // 親コンポーネントにファイル選択を通知
      onPhotoChange(compressedFile);
      
      toast.success("写真を選択しました。保存してアップロードします。");
    } catch (error) {
      console.error("[PhotoUpload] Error:", error);
      toast.error("画像の処理に失敗しました");
      
      // 元のプレビューを復元
      setPreviewUrl(currentPhotoUrl);
    } finally {
      // 同じファイルを再選択できるようにinputをクリア
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDelete = () => {
    if (!confirm("写真を削除しますか？")) return;
    
    // プレビューと選択したファイルをクリア
    setPreviewUrl(undefined);
    setSelectedFile(null);
    
    // 親コンポーネントに写真削除を通知
    onPhotoChange(null);
    
    toast.success("写真を削除しました。保存して反映します。");
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* 写真プレビューエリア */}
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-base-300"
            />
            
            {/* Hover時のオーバーレイ */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleClick}
                className="btn btn-sm btn-circle btn-ghost text-white"
                title="写真を変更"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            {/* 削除ボタン */}
            <button
              type="button"
              onClick={handleDelete}
              className="absolute -top-2 -right-2 btn btn-sm btn-circle btn-error"
              title="写真を削除"
            >
              <X className="w-4 h-4" />
            </button>
            
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-32 h-32 rounded-full border-4 border-dashed border-base-300 hover:border-primary bg-base-100 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-8 h-8 text-base-content/40" />
            <span className="text-xs text-base-content/60">写真を追加</span>
          </button>
        )}
      </div>
      
      {/* 非表示のfile input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* 説明テキスト */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleClick}
          className="btn btn-sm btn-outline gap-2"
        >
          <Upload className="w-4 h-4" />
          {previewUrl ? "写真を変更" : "写真を選択"}
        </button>
        <p className="text-xs text-base-content/50 mt-2">
          推奨: 正方形の写真 (最大5MB)
        </p>
        {selectedFile && (
          <p className="text-xs text-warning mt-1">
            ⚠️ 保存するとアップロードされます
          </p>
        )}
      </div>
    </div>
  );
}

