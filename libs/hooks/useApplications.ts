/**
 * 統一的 Application 數據管理 Hook
 * 
 * 提供統一的數據獲取、更新、篩選功能
 * 所有 Application 相關頁面都應該使用這個 Hook
 */

import { useState, useMemo, useCallback } from "react";
import type { Application, ApplicationFormData, ApplicationStatus } from "@/types/application";
import { getMockApplications } from "@/libs/mock-data";
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
  const [applications, setApplications] = useState<Application[]>(() => {
    const mockData = getMockApplications();
    // 如果指定了 userId，則篩選
    if (initialFilter.userId) {
      return mockData.filter(app => app.userId === initialFilter.userId);
    }
    return mockData;
  });
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">(
    initialFilter.status || "all"
  );
  const [searchQuery, setSearchQuery] = useState(initialFilter.searchQuery || "");
  const [isLoading, setIsLoading] = useState(false);

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
  const addApplication = useCallback((data: ApplicationFormData) => {
    setIsLoading(true);
    try {
      const newApplication: Application = {
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: "user-001", // TODO: 從認證系統獲取
        ...data,
        desiredSalary: typeof data.desiredSalary === 'string' 
          ? parseFloat(data.desiredSalary) || 0 
          : data.desiredSalary || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setApplications(prev => [...prev, newApplication]);
      toast.success("新しい応募を追加しました");
    } catch (error) {
      toast.error("応募の追加に失敗しました");
      console.error("Add application error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 更新應募
  const updateApplication = useCallback((id: string, data: ApplicationFormData) => {
    setIsLoading(true);
    try {
      setApplications(prev => prev.map(app =>
        app.id === id
          ? { 
              ...app, 
              ...data, 
              desiredSalary: typeof data.desiredSalary === 'string' 
                ? parseFloat(data.desiredSalary) || 0 
                : data.desiredSalary || 0,
              updatedAt: new Date().toISOString() 
            }
          : app
      ));
      toast.success("応募情報を更新しました");
    } catch (error) {
      toast.error("応募の更新に失敗しました");
      console.error("Update application error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 刪除應募
  const deleteApplication = useCallback((id: string) => {
    setIsLoading(true);
    try {
      setApplications(prev => prev.filter(app => app.id !== id));
      toast.success("応募を削除しました");
    } catch (error) {
      toast.error("応募の削除に失敗しました");
      console.error("Delete application error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 更新狀態
  const updateApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    setIsLoading(true);
    try {
      setApplications(prev => prev.map(app =>
        app.id === id
          ? { ...app, status, updatedAt: new Date().toISOString() }
          : app
      ));
      toast.success("ステータスを更新しました");
    } catch (error) {
      toast.error("ステータスの更新に失敗しました");
      console.error("Update status error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
