/**
 * 単一履歴書管理Hook
 * 
 * 用途：特定のIDの履歴書を取得・更新
 * useResume: 主要履歴書専用 (従来)
 * useSingleResume: 任意の履歴書 (新規)
 */

import { useState, useEffect, useCallback } from "react";
import type { Resume, ResumeFormData } from "@/types/resume";
import { toast } from "react-hot-toast";
import { handleError } from "@/libs/utils/error-handler";
import { calculateCompleteness } from "./useResume";

export interface UseSingleResumeReturn {
  resume: Resume | null;
  isLoading: boolean;
  isSaving: boolean;
  updateResume: (data: ResumeFormData) => Promise<void>;
  fetchResume: (id: string) => Promise<void>;
}

export function useSingleResume(resumeId?: string): UseSingleResumeReturn {
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 履歴書を取得
  const fetchResume = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/resumes/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('履歴書が見つかりません');
        }
        throw new Error('履歴書の取得に失敗しました');
      }
      
      const { data } = await response.json();
      
      // 完成度を計算
      const resumeWithCompleteness = {
        ...data,
        completeness: calculateCompleteness(data),
      };
      
      setResume(resumeWithCompleteness);
    } catch (error) {
      handleError(error, {
        feature: 'resume',
        action: 'fetch',
      }, {
        customMessage: '履歴書の取得に失敗しました',
      });
      setResume(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 初期化時にresumeIdが指定されていれば取得
  useEffect(() => {
    if (resumeId) {
      fetchResume(resumeId);
    } else {
      setIsLoading(false);
    }
  }, [resumeId, fetchResume]);
  
  // 履歴書を更新
  const updateResume = useCallback(async (data: ResumeFormData) => {
    if (!resume) {
      toast.error('履歴書が読み込まれていません');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '履歴書の更新に失敗しました');
      }
      
      const { data: updatedResume, message } = await response.json();
      
      // ローカル状態を更新
      setResume({
        ...updatedResume,
        completeness: calculateCompleteness(updatedResume),
      });
      
      toast.success(message || '履歴書を更新しました');
    } catch (error) {
      handleError(error, {
        feature: 'resume',
        action: 'update',
      }, {
        customMessage: '履歴書の更新に失敗しました',
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [resume]);
  
  return {
    resume,
    isLoading,
    isSaving,
    updateResume,
    fetchResume,
  };
}

