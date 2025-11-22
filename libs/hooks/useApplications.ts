/**
 * 統一的 Application 數據管理 Hook
 * 
 * 提供統一的數據獲取、更新、篩選功能
 * 所有 Application 相關頁面都應該使用這個 Hook
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { Application, ApplicationFormData, ApplicationStatus } from "@/types/application";
import { createClient } from "@/libs/supabase/client";
import { handleError } from "@/libs/utils/error-handler";
import { transformApplicationFromDB, transformApplicationToDB } from "@/libs/utils/transformers";
import { APPLICATION_ERRORS } from "@/constants/errors";
import { toast } from "react-hot-toast";

export interface UseApplicationsOptions {
  initialFilter?: {
    status?: ApplicationStatus | "all";
    searchQuery?: string;
    userId?: string;
  };
}

export interface UseApplicationsReturn {
  // 數據
  applications: Application[];
  filteredApplications: Application[];
  
  // 統計
  statusStats: Record<string, number>;
  
  // 操作
  addApplication: (data: ApplicationFormData) => void;
  updateApplication: (id: string, data: ApplicationFormData) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  
  // 篩選
  setFilterStatus: (status: ApplicationStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // 狀態
  filterStatus: ApplicationStatus | "all";
  searchQuery: string;
  isLoading: boolean;
}

export function useApplications(options: UseApplicationsOptions = {}): UseApplicationsReturn {
  const { initialFilter = {} } = options;
  
  // 初始數據
  const [applications, setApplications] = useState<Application[]>([]);
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">(
    initialFilter.status || "all"
  );
  const [searchQuery, setSearchQuery] = useState(initialFilter.searchQuery || "");
  const [isLoading, setIsLoading] = useState(true);

  // Supabase client
  const supabase = createClient();

  // 從資料庫獲取應募資料
  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 獲取當前用戶
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        handleError(userError, {
          feature: 'user',
          action: 'fetch',
        });
        return;
      }

      if (!user) {
        setApplications([]);
        return;
      }

      // 獲取應募資料
      let query = supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      // 如果有指定 userId 過濾（雖然 RLS 已經保證只能看到自己的資料）
      if (initialFilter.userId) {
        query = query.eq("user_id", initialFilter.userId);
      }

      const { data, error } = await query;

      if (error) {
        handleError(error, {
          feature: 'application',
          action: 'fetch',
        }, {
          customMessage: APPLICATION_ERRORS.FETCH_FAILED,
        });
        return;
      }

      // 轉換資料庫欄位名稱為 camelCase
      const transformedData: Application[] = (data || []).map(row =>
        transformApplicationFromDB(row as Parameters<typeof transformApplicationFromDB>[0])
      );

      setApplications(transformedData);
    } catch (error) {
      handleError(error, {
        feature: 'application',
        action: 'fetch',
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, initialFilter.userId]);

  // 初始載入 - 使用 useRef 避免無限循環
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      fetchApplications();
    }
  }, []); // 只在 mount 時執行一次

  // 篩選後的數據
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // 按狀態篩選
    if (filterStatus !== "all") {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // 按搜索關鍵詞篩選
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.companyName.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        app.notes?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [applications, filterStatus, searchQuery]);

  // 狀態統計
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {
      all: applications.length,
      bookmarked: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    applications.forEach(app => {
      if (stats.hasOwnProperty(app.status)) {
        stats[app.status]++;
      }
    });

    return stats;
  }, [applications]);

  // 新增應募
  const addApplication = useCallback(async (data: ApplicationFormData) => {
    try {
      setIsLoading(true);
      
      // 獲取當前用戶
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("ユーザー情報の取得に失敗しました");
        return;
      }

      // 準備資料 - 使用統一的轉換函數
      const insertData = {
        user_id: user.id,
        ...transformApplicationToDB(data),
      };

      const { error } = await supabase
        .from("applications")
        .insert(insertData);

      if (error) {
        handleError(error, {
          feature: 'application',
          action: 'create',
        }, {
          customMessage: APPLICATION_ERRORS.CREATE_FAILED,
        });
        return;
      }

      toast.success("新しい応募を追加しました");
      
      // 重新獲取資料
      await fetchApplications();
    } catch (error) {
      handleError(error, {
        feature: 'application',
        action: 'create',
      }, {
        customMessage: APPLICATION_ERRORS.CREATE_FAILED,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchApplications]);

  // 更新應募
  const updateApplication = useCallback(async (id: string, data: ApplicationFormData) => {
    try {
      setIsLoading(true);

      // 準備資料 - 使用統一的轉換函數
      const updateData = {
        ...transformApplicationToDB(data),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("applications")
        .update(updateData)
        .eq("id", id);

      if (error) {
        handleError(error, {
          feature: 'application',
          action: 'update',
        }, {
          customMessage: APPLICATION_ERRORS.UPDATE_FAILED,
        });
        return;
      }

      toast.success("応募情報を更新しました");
      
      // 重新獲取資料
      await fetchApplications();
    } catch (error) {
      handleError(error, {
        feature: 'application',
        action: 'update',
      }, {
        customMessage: APPLICATION_ERRORS.UPDATE_FAILED,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchApplications]);

  // 刪除應募
  const deleteApplication = useCallback(async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id);

      if (error) {
        handleError(error, {
          feature: 'application',
          action: 'delete',
        }, {
          customMessage: APPLICATION_ERRORS.DELETE_FAILED,
        });
        return;
      }

      toast.success("応募を削除しました");
      
      // 重新獲取資料
      await fetchApplications();
    } catch (error) {
      handleError(error, {
        feature: 'application',
        action: 'delete',
      }, {
        customMessage: APPLICATION_ERRORS.DELETE_FAILED,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchApplications]);

  // 更新狀態
  const updateApplicationStatus = useCallback(async (id: string, status: ApplicationStatus) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("applications")
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        handleError(error, {
          feature: 'application',
          action: 'update_status',
        }, {
          customMessage: APPLICATION_ERRORS.STATUS_UPDATE_FAILED,
        });
        return;
      }

      toast.success("ステータスを更新しました");
      
      // 重新獲取資料
      await fetchApplications();
    } catch (error) {
      handleError(error, {
        feature: 'application',
        action: 'update_status',
      }, {
        customMessage: APPLICATION_ERRORS.STATUS_UPDATE_FAILED,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchApplications]);

  // 清除篩選
  const clearFilters = useCallback(() => {
    setFilterStatus("all");
    setSearchQuery("");
  }, []);

  return {
    // 數據
    applications,
    filteredApplications,
    
    // 統計
    statusStats,
    
    // 操作
    addApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
    
    // 篩選
    setFilterStatus,
    setSearchQuery,
    clearFilters,
    
    // 狀態
    filterStatus,
    searchQuery,
    isLoading,
  };
}
