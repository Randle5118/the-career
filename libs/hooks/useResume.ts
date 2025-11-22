/**
 * 統一的Resumeデータ管理Hook
 * 
 * 統一的データ取得、更新、公開機能を提供
 * Supabase APIと統合
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Resume, ResumeFormData } from "@/types/resume";
import { toast } from "react-hot-toast";
import { handleError } from "@/libs/utils/error-handler";
import { RESUME_ERRORS } from "@/constants/errors";

export interface PublishedResumeInfo {
  id: number;
  is_public: boolean;
  public_url_slug: string | null;
  published_at: string;
  updated_at: string;
}

export interface UseResumeReturn {
  // 數據
  resume: Resume | null;
  publishedResume: PublishedResumeInfo | null;
  
  // 操作
  fetchResume: () => Promise<void>;
  fetchPublishedResume: () => Promise<void>;
  updateResume: (data: ResumeFormData) => Promise<void>;
  publishResume: (isPublic?: boolean, slug?: string) => Promise<void>;
  
  // 計算
  completeness: number;
  publicUrl: string | null;
  
  // 狀態
  isLoading: boolean;
  isUpdating: boolean;
}

/**
 * 履歴書の完成度を計算
 * 
 * @param resume 履歴書データ
 * @returns 完成度パーセンテージ (0-100)
 */
export function calculateCompleteness(resume: Resume | null): number {
  if (!resume) return 0;
  
  let score = 0;
  
  // 基本情報 (30%)
  let basicScore = 0;
  if (resume.name_kanji) basicScore += 5;
  if (resume.name_kana) basicScore += 5;
  if (resume.birth_date) basicScore += 5;
  if (resume.phone) basicScore += 5;
  if (resume.email) basicScore += 5;
  if (resume.prefecture && resume.city) basicScore += 5;
  score += basicScore;
  
  // 学歴 (10%)
  if (resume.education && resume.education.length > 0) {
    score += 10;
  }
  
  // 職務経歴 (25%)
  if (resume.work_experience && resume.work_experience.length > 0) {
    const hasDetailedExperience = resume.work_experience.some(exp => 
      exp.positions && exp.positions.length > 0
    );
    if (hasDetailedExperience) {
      score += 25;
    } else {
      score += 10; // 部分スコア
    }
  }
  
  // 自己PR (15%)
  let prScore = 0;
  if (resume.career_summary && resume.career_summary.length > 50) prScore += 8;
  if (resume.self_pr && resume.self_pr.length > 50) prScore += 7;
  score += prScore;
  
  // スキル (10%)
  if (resume.skills && resume.skills.length > 0) {
    score += 10;
  }
  
  // 言語 (5%)
  if (resume.languages && resume.languages.length > 0) {
    score += 5;
  }
  
  // 希望条件 (5%)
  if (resume.preferences && 
      resume.preferences.job_types && 
      resume.preferences.job_types.length > 0) {
    score += 5;
  }
  
  return Math.min(score, 100);
}

export function useResume(): UseResumeReturn {
  // 初期データ
  const [resume, setResume] = useState<Resume | null>(null);
  const [publishedResume, setPublishedResume] = useState<PublishedResumeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 完成度を計算
  const completeness = useMemo(() => {
    return calculateCompleteness(resume);
  }, [resume]);
  
  // 公開URLを計算
  const publicUrl = useMemo(() => {
    if (!publishedResume?.is_public || !publishedResume?.public_url_slug) {
      return null;
    }
    return `/r/${publishedResume.public_url_slug}`;
  }, [publishedResume]);
  
  // APIから履歴書を取得
  const fetchResume = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/resumes');
      
      if (!response.ok) {
        if (response.status === 401) {
          // 未ログイン
          setResume(null);
          return;
        }
        throw new Error('Failed to fetch resume');
      }
      
      const { data } = await response.json();
      
      // APIは単一オブジェクトを返す（1ユーザー1履歴書）
      // dataはResumeまたはnullの可能性がある
      setResume(data);
    } catch (error) {
      handleError(error, {
        feature: 'resume',
        action: 'fetch',
      }, {
        customMessage: RESUME_ERRORS.FETCH_FAILED,
      });
      setResume(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // APIから公開履歴書情報を取得
  const fetchPublishedResume = useCallback(async () => {
    try {
      const response = await fetch('/api/resume/published');
      
      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error('Failed to fetch published resume');
      }
      
      const { data } = await response.json();
      setPublishedResume(data);
    } catch (error) {
      handleError(error, {
        feature: 'resume',
        action: 'fetch_published',
      }, {
        showToast: false, // 公開履歴書取得失敗時はtoastを表示しない
      });
      setPublishedResume(null);
    }
  }, []);
  
  // 初始化時取得履歷和公開履歷 - 使用 useRef 避免無限循環
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      fetchResume();
      fetchPublishedResume();
    }
  }, []); // 只在 mount 時執行一次
  
  // 履歴書を更新（または新規作成）
  const updateResume = useCallback(async (data: ResumeFormData) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/resumes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update resume');
      }
      
      const { data: updatedResume, message } = await response.json();
      setResume(updatedResume);
      toast.success(message || "履歴書を保存しました");
    } catch (error) {
      handleError(error, {
        feature: 'resume',
        action: 'update',
      }, {
        customMessage: RESUME_ERRORS.UPDATE_FAILED,
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);
  
  // 履歴書を公開
  const publishResume = useCallback(async (isPublic = false, slug?: string) => {
    if (!resume) {
      handleError(new Error(RESUME_ERRORS.NOT_FOUND), {
        feature: 'resume',
        action: 'publish',
      }, {
        customMessage: RESUME_ERRORS.NOT_FOUND,
      });
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || RESUME_ERRORS.PUBLISH_FAILED);
      }
      
      const { message } = await response.json();
      
      // published resume情報を更新
      await fetchPublishedResume();
      
      // 成功メッセージを表示
      toast.success(message || "履歴書を公開しました");
    } catch (error) {
      handleError(error, {
        feature: 'resume',
        action: 'publish',
      }, {
        customMessage: RESUME_ERRORS.PUBLISH_FAILED,
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [resume, fetchPublishedResume]);
  
  return {
    resume,
    publishedResume,
    fetchResume,
    fetchPublishedResume,
    updateResume,
    publishResume,
    completeness,
    publicUrl,
    isLoading,
    isUpdating,
  };
}

