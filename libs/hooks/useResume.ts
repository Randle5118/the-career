/**
 * 統一的 Resume 數據管理 Hook
 * 
 * 提供統一的數據獲取、更新功能
 * 目前使用 mock 數據，一個用戶一個履歷
 */

import { useState, useMemo, useCallback } from "react";
import type { Resume, ResumeFormData } from "@/types/resume";
import { getMockResume } from "@/libs/mock-data";
import { toast } from "react-hot-toast";

export interface UseResumeReturn {
  // 數據
  resume: Resume | null;
  
  // 操作
  updateResume: (data: ResumeFormData) => Promise<void>;
  
  // 計算
  completeness: number;
  
  // 狀態
  isLoading: boolean;
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
  const [resume, setResume] = useState<Resume | null>(() => getMockResume());
  const [isLoading, setIsLoading] = useState(false);
  
  // 計算完整度
  const completeness = useMemo(() => {
    return calculateCompleteness(resume);
  }, [resume]);
  
  // 更新履歷
  const updateResume = useCallback(async (data: ResumeFormData) => {
    setIsLoading(true);
    
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!resume) {
        throw new Error("履歷書が見つかりません");
      }
      
      // 更新數據
      const updatedResume: Resume = {
        ...resume,
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      // 重新計算完整度
      updatedResume.completeness = calculateCompleteness(updatedResume);
      
      setResume(updatedResume);
      toast.success("履歴書を保存しました");
    } catch (error) {
      console.error("[useResume] Update error:", error);
      toast.error("保存に失敗しました");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [resume]);
  
  return {
    resume,
    updateResume,
    completeness,
    isLoading,
  };
}

