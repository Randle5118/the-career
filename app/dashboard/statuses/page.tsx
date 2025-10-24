"use client";

import { useState } from "react";
import type { Application, ApplicationFormData } from "@/types/application";
import { ApplicationModal, ApplicationDetailModal } from "@/components/modals";
import CalendarView from "@/components/ui/CalendarView";
import KanbanView from "@/components/ui/KanbanView";
import { Calendar, Columns } from "lucide-react";
import { useApplications } from "@/libs/hooks/useApplications";
import { Heading } from "@/components/catalyst/heading";
import { toast } from "react-hot-toast";

type ViewMode = "status" | "calendar";

export default function ApplicationsPage() {
  const {
    applications,
    addApplication,
    updateApplication,
    updateApplicationStatus,
  } = useApplications();
  
  const [viewMode, setViewMode] = useState<ViewMode>("status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);

  const handleAddNew = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleViewDetail = (application: Application) => {
    console.log('ApplicationsPage: handleViewDetail called', { application });
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <div>
            <Heading>応募ステータス</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              応募の進捗状況とスケジュールを管理できます
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="btn btn-primary"
          >
            <Calendar className="w-5 h-5 mr-2" />
            新しい応募を追加
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-base-300">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode("status")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                viewMode === "status"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
              }`}
            >
              <Columns className="w-4 h-4" />
              ステータス
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                viewMode === "calendar"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
              }`}
            >
              <Calendar className="w-4 h-4" />
              カレンダー
            </button>
          </div>
        </div>

        {/* View Content */}
        <div className="mt-6">
          {viewMode === "status" ? (
            <KanbanView
              applications={applications}
              onUpdateStatus={updateApplicationStatus}
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
              key={applications.length}
            />
          ) : (
            <CalendarView
              applications={applications}
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
            />
          )}
        </div>

        {/* 應募詳細 Modal */}
        <ApplicationDetailModal
          isOpen={isDetailModalOpen}
          application={viewingApplication}
          onClose={handleDetailClose}
          onEdit={handleEditFromDetail}
          variant={viewMode === "calendar" ? "schedule" : "status"}
        />

        {/* 応募編輯 Modal */}
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
