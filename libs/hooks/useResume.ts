/**
 * 統一的 Resume 數據管理 Hook
 * 
 * 提供統一的數據獲取、更新、發布功能
 * 與 Supabase API 整合
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Resume, ResumeFormData } from "@/types/resume";
import { toast } from "react-hot-toast";

export interface UseResumeReturn {
  // 數據
  resume: Resume | null;
  
  // 操作
  fetchResume: () => Promise<void>;
  updateResume: (data: ResumeFormData) => Promise<void>;
  publishResume: (isPublic?: boolean, slug?: string) => Promise<void>;
  
  // 計算
  completeness: number;
  
  // 狀態
  isLoading: boolean;
  isUpdating: boolean;
}

/**
 * 計算履歷完整度
 * 
 * @param resume 履歷數據
 * @returns 完整度百分比 (0-100)
 */
export function calculateCompleteness(resume: Resume | null): number {
  if (!resume) return 0;
  
  let score = 0;
  
  // 基本資料 (30%)
  let basicScore = 0;
  if (resume.name_kanji) basicScore += 5;
  if (resume.name_kana) basicScore += 5;
  if (resume.birth_date) basicScore += 5;
  if (resume.phone) basicScore += 5;
  if (resume.email) basicScore += 5;
  if (resume.prefecture && resume.city) basicScore += 5;
  score += basicScore;
  
  // 學歷 (10%)
  if (resume.education && resume.education.length > 0) {
    score += 10;
  }
  
  // 工作經歷 (25%)
  if (resume.work_experience && resume.work_experience.length > 0) {
    const hasDetailedExperience = resume.work_experience.some(exp => 
      exp.positions && exp.positions.length > 0
    );
    if (hasDetailedExperience) {
      score += 25;
    } else {
      score += 10; // 部分分數
    }
  }
  
  // 自我介紹 (15%)
  let prScore = 0;
  if (resume.career_summary && resume.career_summary.length > 50) prScore += 8;
  if (resume.self_pr && resume.self_pr.length > 50) prScore += 7;
  score += prScore;
  
  // 技能 (10%)
  if (resume.skills && resume.skills.length > 0) {
    score += 10;
  }
  
  // 語言 (5%)
  if (resume.languages && resume.languages.length > 0) {
    score += 5;
  }
  
  // 求職偏好 (5%)
  if (resume.preferences && 
      resume.preferences.job_types && 
      resume.preferences.job_types.length > 0) {
    score += 5;
  }
  
  return Math.min(score, 100);
}

export function useResume(): UseResumeReturn {
  // 初始數據
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 計算完整度
  const completeness = useMemo(() => {
    return calculateCompleteness(resume);
  }, [resume]);
  
  // 從 API 取得履歷
  const fetchResume = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/resumes');
      
      if (!response.ok) {
        if (response.status === 401) {
          // 未登入
          setResume(null);
          return;
        }
        throw new Error('Failed to fetch resume');
      }
      
      const { data } = await response.json();
      
      // 取得第一個 resume (主要履歷)
      if (data && data.length > 0) {
        setResume(data[0]);
      } else {
        setResume(null);
      }
    } catch (error) {
      console.error("[useResume] Fetch error:", error);
      toast.error("履歴書の取得に失敗しました");
      setResume(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 初始化時取得履歷
  useEffect(() => {
    fetchResume();
  }, [fetchResume]);
  
  // 更新履歷
  const updateResume = useCallback(async (data: ResumeFormData) => {
    if (!resume) {
      toast.error("履歴書が見つかりません");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update resume');
      }
      
      const { data: updatedResume } = await response.json();
      setResume(updatedResume);
      toast.success("履歴書を保存しました");
    } catch (error) {
      console.error("[useResume] Update error:", error);
      toast.error("保存に失敗しました");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [resume]);
  
  // 發布履歷
  const publishResume = useCallback(async (isPublic = false, slug?: string) => {
    if (!resume) {
      toast.error("履歴書が見つかりません");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/resumes/${resume.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_public: isPublic,
          public_url_slug: slug,
        }),
      });
      
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to publish resume');
      }
      
      const { message, data } = await response.json();
      
      // 如果是公開發布,顯示公開 URL
      if (isPublic && data?.public_url_slug) {
        const publicUrl = `${window.location.origin}/r/${data.public_url_slug}`;
        toast.success(
          `履歴書を公開しました！\nURL: ${publicUrl}`,
          { duration: 8000 }
        );
        
        // 可選: 自動複製到剪貼簿
        if (navigator.clipboard) {
          navigator.clipboard.writeText(publicUrl).catch(() => {});
        }
      } else {
        toast.success(message || "履歴書を公開しました");
      }
    } catch (error) {
      console.error("[useResume] Publish error:", error);
      toast.error(error instanceof Error ? error.message : "公開に失敗しました");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [resume]);
  
  return {
    resume,
    fetchResume,
    updateResume,
    publishResume,
    completeness,
    isLoading,
    isUpdating,
  };
}

