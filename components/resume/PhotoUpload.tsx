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
  
  // 當 currentPhotoUrl 變更時更新預覽
  useEffect(() => {
    setPreviewUrl(currentPhotoUrl);
  }, [currentPhotoUrl]);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 驗證檔案
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "無効なファイルです");
      return;
    }
    
    try {
      // 壓縮圖片 (減少檔案大小)
      const compressedFile = await compressImage(file, 800, 0.8);
      
      // 設定預覽 (使用 object URL)
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(objectUrl);
      
      // 保存檔案,等待表單提交時上傳
      setSelectedFile(compressedFile);
      
      // 通知父組件有檔案選擇
      onPhotoChange(compressedFile);
      
      toast.success("写真を選択しました。保存してアップロードします。");
    } catch (error) {
      console.error("[PhotoUpload] Error:", error);
      toast.error("画像の処理に失敗しました");
      
      // 恢復原本的預覽
      setPreviewUrl(currentPhotoUrl);
    } finally {
      // 清空 input 以允許重新選擇同一檔案
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDelete = () => {
    if (!confirm("写真を削除しますか？")) return;
    
    // 清除預覽和選擇的檔案
    setPreviewUrl(undefined);
    setSelectedFile(null);
    
    // 通知父組件清除照片
    onPhotoChange(null);
    
    toast.success("写真を削除しました。保存して反映します。");
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* 照片預覽區 */}
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-base-300"
            />
            
            {/* Hover 遮罩 */}
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
            
            {/* 刪除按鈕 */}
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
      
      {/* 隱藏的 file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* 說明文字 */}
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

