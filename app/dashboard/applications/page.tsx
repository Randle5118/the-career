"use client";

import { useState } from "react";
import type { Application, ApplicationFormData } from "@/types/application";
import ApplicationCard from "@/components/cards/ApplicationCard";
import ApplicationListItem from "@/components/ui/ApplicationListItem";
import { ApplicationModal, ApplicationDetailModal } from "@/components/modals";
import { TabList } from "@/components/forms/TabComponents";
import { FileText, LayoutGrid, List } from "lucide-react";
import { useApplications } from "@/libs/hooks/useApplications";
import { Heading } from "@/components/catalyst/heading";
import { toast } from "react-hot-toast";

type ViewMode = "grid" | "list";

export default function ApplicationsPage() {
  const {
    filteredApplications,
    statusStats,
    addApplication,
    updateApplication,
    deleteApplication,
    setFilterStatus,
    setSearchQuery,
    filterStatus,
    searchQuery,
  } = useApplications();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Tab 配置
  const statusTabs = [
    { id: "all", label: `全て (${statusStats.all})` },
    { id: "bookmarked", label: `ブックマーク (${statusStats.bookmarked})` },
    { id: "applied", label: `応募済み (${statusStats.applied})` },
    { id: "interview", label: `面談・面接 (${statusStats.interview})` },
    { id: "offer", label: `内定 (${statusStats.offer})` },
    { id: "rejected", label: `辞退・不採用 (${statusStats.rejected})` },
  ];

  const handleAddNew = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleViewDetail = (application: Application) => {
    setViewingApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (application: Application) => {
    setEditingApplication(application);
    setIsModalOpen(true);
  };

  const handleEditFromDetail = () => {
    setEditingApplication(viewingApplication);
    setIsDetailModalOpen(false);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingApplication(null);
  };

  const handleDetailClose = () => {
    setIsDetailModalOpen(false);
    setViewingApplication(null);
  };

  const handleSave = async (applicationData: ApplicationFormData) => {
    try {
      if (editingApplication) {
        updateApplication(editingApplication.id, applicationData);
        toast.success("応募情報を更新しました");
      } else {
        addApplication(applicationData);
        toast.success("新しい応募を追加しました");
      }
      handleClose();
    } catch (error) {
      console.error("保存エラー:", error);
      toast.error("保存に失敗しました");
    }
  };

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8 md:px-8 max-w-7xl bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-4 dark:border-white/10">
          <div>
            <Heading>応募管理</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              転職活動の応募状況を管理・追跡しましょう
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="btn btn-primary"
          >
            <FileText className="w-5 h-5 mr-2" />
            新しい応募を追加
          </button>
        </div>

        {/* 狀態統計 Tabs */}
        <div className="mb-6">
          <TabList
            tabs={statusTabs}
            activeTab={filterStatus}
            onTabChange={(tabId) => setFilterStatus(tabId as any)}
            className="mb-4"
          />
        </div>

        {/* 搜索和視圖切換 */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="会社名、職種、タグで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-ghost"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-ghost"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
        </div>

        {/* 應募列表 */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterStatus !== "all" ? "該当する応募がありません" : "応募がまだありません"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterStatus !== "all" 
                ? "検索条件を変更してみてください" 
                : "新しい応募を追加して始めましょう"
              }
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button
                onClick={handleAddNew}
                className="btn btn-primary"
              >
                <FileText className="w-5 h-5 mr-2" />
                最初の応募を追加
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-0 bg-base-100 rounded-lg border border-base-200 overflow-hidden"
          }>
            {filteredApplications.map((application, index) => (
              viewMode === "grid" ? (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onViewDetail={handleViewDetail}
                  onEdit={handleEdit}
                  onDelete={deleteApplication}
                />
              ) : (
                <ApplicationListItem
                  key={application.id}
                  application={application}
                  onEdit={handleEdit}
                  onDelete={deleteApplication}
                  isLast={index === filteredApplications.length - 1}
                />
              )
            ))}
          </div>
        )}

        {/* 應募詳細 Modal */}
        <ApplicationDetailModal
          isOpen={isDetailModalOpen}
          application={viewingApplication}
          onClose={handleDetailClose}
          onEdit={handleEditFromDetail}
          variant="overview"
        />

        {/* 應募編輯 Modal */}
        <ApplicationModal
          isOpen={isModalOpen}
          application={editingApplication}
          onClose={handleClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}