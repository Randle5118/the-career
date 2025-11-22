/**
 * 複数履歴書管理Hook
 * 
 * 用途：ユーザーの全ての履歴書を管理
 * 機能：取得、作成、更新、削除、アーカイブ、主要履歴書の切り替え
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Resume } from "@/types/resume";
import { toast } from "react-hot-toast";
import { handleError } from "@/libs/utils/error-handler";
import { calculateCompleteness } from "./useResume";

export interface UseResumesReturn {
  // データ
  resumes: Resume[];
  activeResumes: Resume[]; // 非封存的履歴書
  archivedResumes: Resume[]; // 封存的履歴書
  primaryResume: Resume | null;
  
  // 操作
  fetchResumes: () => Promise<void>;
  createResume: (name: string) => Promise<Resume | null>;
  deleteResume: (id: string) => Promise<void>;
  archiveResume: (id: string) => Promise<void>;
  unarchiveResume: (id: string) => Promise<void>;
  setPrimaryResume: (id: string) => Promise<void>;
  duplicateResume: (id: string, customName?: string) => Promise<Resume | null>;
  
  // 狀態
  isLoading: boolean;
  isProcessing: boolean;
}

export function useResumes(): UseResumesReturn {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 計算衍生狀態
  const activeResumes = resumes
    .filter(r => !r.is_archived)
    .sort((a, b) => {
      // 主要履歴書排在最前
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      // 其他按更新時間排序
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  
  const archivedResumes = resumes
    .filter(r => r.is_archived)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  const primaryResume = resumes.find(r => r.is_primary) || null;
  
  // 取得所有履歴書
  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/resumes/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      
      const { data } = await response.json();
      
      // 為每個履歴書計算完成度
      const resumesWithCompleteness = (data || []).map((resume: Resume) => ({
        ...resume,
        completeness: calculateCompleteness(resume),
      }));
      
      setResumes(resumesWithCompleteness);
    } catch (error) {
      handleError(error, {
        feature: 'resumes',
        action: 'fetch',
      }, {
        customMessage: '履歴書の取得に失敗しました',
      });
      setResumes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 初期化時に取得
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      fetchResumes();
    }
  }, [fetchResumes]);
  
  // 新規履歴書を作成
  const createResume = useCallback(async (name: string): Promise<Resume | null> => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_name: name,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create resume');
      }
      
      const { data: newResume, message } = await response.json();
      
      // ローカル状態を更新
      setResumes(prev => [...prev, {
        ...newResume,
        completeness: calculateCompleteness(newResume),
      }]);
      
      toast.success(message || '履歴書を作成しました');
      return newResume;
    } catch (error) {
      handleError(error, {
        feature: 'resumes',
        action: 'create',
      }, {
        customMessage: '履歴書の作成に失敗しました',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  // 履歴書を削除
  const deleteResume = useCallback(async (id: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete resume');
      }
      
      // ローカル状態を更新
      setResumes(prev => prev.filter(r => r.id !== id));
      
      toast.success('履歴書を削除しました');
    } catch (error) {
      handleError(error, {
        feature: 'resumes',
        action: 'delete',
      }, {
        customMessage: '履歴書の削除に失敗しました',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  // 履歴書をアーカイブ
  const archiveResume = useCallback(async (id: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/resumes/${id}/archive`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to archive resume');
      }
      
      // ローカル状態を更新
      setResumes(prev => prev.map(r => 
        r.id === id ? { ...r, is_archived: true, is_public: false } : r
      ));
      
      toast.success('履歴書をアーカイブしました');
    } catch (error) {
      handleError(error, {
        feature: 'resumes',
        action: 'archive',
      }, {
        customMessage: 'アーカイブに失敗しました',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  // 履歴書のアーカイブを解除
  const unarchiveResume = useCallback(async (id: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/resumes/${id}/unarchive`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unarchive resume');
      }
      
      // ローカル状態を更新
      setResumes(prev => prev.map(r => 
        r.id === id ? { ...r, is_archived: false } : r
      ));
      
      toast.success('アーカイブを解除しました');
    } catch (error) {
      handleError(error, {
        feature: 'resumes',
        action: 'unarchive',
      }, {
        customMessage: 'アーカイブ解除に失敗しました',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  // 主要履歴書を設定
  const setPrimaryResume = useCallback(async (id: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/resumes/${id}/set-primary`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to set primary resume');
      }
      
      // ローカル状態を更新（他の is_primary を false に、選択された履歴書を true に）
      setResumes(prev => prev.map(r => ({
        ...r,
        is_primary: r.id === id,
      })));
      
      toast.success('主要履歴書を設定しました');
    } catch (error) {
      handleError(error, {
        feature: 'resumes',
        action: 'set_primary',
      }, {
        customMessage: '主要履歴書の設定に失敗しました',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  // 履歴書を複製
  const duplicateResume = useCallback(async (id: string, customName?: string): Promise<Resume | null> => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/resumes/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          custom_name: customName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate resume');
      }
      
      const { data: newResume, message } = await response.json();
      
      // ローカル状態を更新
      const resumeWithCompleteness = {
        ...newResume,
        completeness: calculateCompleteness(newResume),
      };
      
      setResumes(prev => [...prev, resumeWithCompleteness]);
      
      toast.success(message || '履歴書を複製しました');
      return resumeWithCompleteness;
    } catch (error) {
      handleError(error, {
        feature: 'resumes',
        action: 'duplicate',
      }, {
        customMessage: '履歴書の複製に失敗しました',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  return {
    resumes,
    activeResumes,
    archivedResumes,
    primaryResume,
    fetchResumes,
    createResume,
    deleteResume,
    archiveResume,
    unarchiveResume,
    setPrimaryResume,
    duplicateResume,
    isLoading,
    isProcessing,
  };
}

