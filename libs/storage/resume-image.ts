/**
 * Resume Image Storage Helper
 * 
 * 處理履歷照片的上傳、刪除和 URL 生成
 */

import { createClient } from "@/libs/supabase/client";

const BUCKET_NAME = "resume_image";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 驗證圖片檔案
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 檢查檔案大小
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます (最大: 5MB, 現在: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    };
  }
  
  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: "画像ファイルのみアップロードできます"
    };
  }
  
  return { valid: true };
}

/**
 * 上傳履歷照片
 * 
 * @param file 圖片檔案
 * @param userId 用戶 ID (可選,如果不提供則自動獲取)
 * @returns 上傳後的公開 URL
 */
export async function uploadResumePhoto(file: File, userId?: string): Promise<string> {
  // 驗證檔案
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const supabase = createClient();
  
  // 如果沒有提供 userId,從當前認證用戶獲取
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("認証が必要です");
    }
    userId = user.id;
  }
  
  // 檔案路徑: {user_id}/profile.jpg
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `${userId}/profile.${fileExt}`;
  
  // 上傳檔案 (覆蓋舊檔案)
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true, // 覆蓋舊照片
      contentType: file.type,
      cacheControl: '3600', // 快取 1 小時
    });
  
  if (error) {
    console.error("[Storage] Upload error:", error);
    
    // 提供更詳細的錯誤訊息
    if (error.message.includes('row-level security')) {
      throw new Error("アップロード権限がありません。Storage Policiesを確認してください。");
    }
    if (error.message.includes('not found')) {
      throw new Error("Storageバケットが見つかりません。");
    }
    if (error.message.includes('size')) {
      throw new Error("ファイルサイズが大きすぎます。");
    }
    
    throw new Error(`アップロードに失敗しました: ${error.message}`);
  }
  
  // 取得公開 URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return urlData.publicUrl;
}

/**
 * 刪除履歷照片
 * 
 * @param userId 用戶 ID (可選,如果不提供則自動獲取)
 */
export async function deleteResumePhoto(userId?: string): Promise<void> {
  const supabase = createClient();
  
  // 如果沒有提供 userId,從當前認證用戶獲取
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("認証が必要です");
    }
    userId = user.id;
  }
  
  // 列出該用戶的所有照片
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(userId);
  
  if (listError) {
    console.error("[Storage] List error:", listError);
    throw new Error("ファイルの取得に失敗しました");
  }
  
  if (!files || files.length === 0) {
    return; // 沒有檔案需要刪除
  }
  
  // 刪除所有照片
  const filePaths = files.map(file => `${userId}/${file.name}`);
  const { error: deleteError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths);
  
  if (deleteError) {
    console.error("[Storage] Delete error:", deleteError);
    throw new Error("削除に失敗しました");
  }
}

/**
 * 取得履歷照片的公開 URL
 * 
 * @param userId 用戶 ID
 * @param filename 檔案名稱 (預設: profile.jpg)
 * @returns 公開 URL 或 null
 */
export function getResumePhotoUrl(userId: string, filename: string = "profile.jpg"): string {
  const supabase = createClient();
  const filePath = `${userId}/${filename}`;
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * 壓縮圖片檔案 (Client-side)
 * 
 * @param file 原始圖片檔案
 * @param maxWidth 最大寬度 (預設: 800)
 * @param quality 品質 (0-1, 預設: 0.8)
 * @returns 壓縮後的檔案
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 計算新的尺寸
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // 建立 canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 轉換為 Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // 建立新的 File
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

