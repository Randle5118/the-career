"use client";

import React, { useState } from "react";
import type { Application } from "@/types/application";
import Modal from "./Modal";
import { Edit } from "lucide-react";
import BasicInfoSection from "./detail-sections/BasicInfoSection";
import ScheduleSection from "./detail-sections/ScheduleSection";

interface ApplicationDetailModalProps {
  isOpen: boolean;
  application: Application | null;
  onClose: () => void;
  onEdit: () => void;
  variant?: 'overview' | 'status' | 'schedule';
}

/**
 * 應募情報の詳細表示モーダル（読み取り専用）
 * variant に応じて表示順序とタブを変更
 */
export default function ApplicationDetailModal({
  isOpen,
  application,
  onClose,
  onEdit,
  variant = 'overview'
}: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!application) return null;

  // variant に応じたタブ構成
  const getTabsConfig = () => {
    switch (variant) {
      case 'schedule':
        // 行事曆頁面：日程優先
        return [
          { id: 'schedule', label: '日程管理', component: <ScheduleSection application={application} /> },
          { id: 'basic', label: '基本情報', component: <BasicInfoSection application={application} /> },
        ];
      case 'status':
      case 'overview':
      default:
        // 應募一覽和狀態管理：基本情報優先
        return [
          { id: 'basic', label: '基本情報', component: <BasicInfoSection application={application} /> },
          { id: 'schedule', label: '日程管理', component: <ScheduleSection application={application} /> },
        ];
    }
  };

  const tabs = getTabsConfig();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="応募情報の詳細"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* タブ */}
        <div className="border-b border-base-300">
          <div className="flex gap-4">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-primary text-primary'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="min-h-[400px]">
          {tabs[activeTab].component}
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
          <button onClick={onClose} className="btn btn-ghost">
            閉じる
          </button>
          <button onClick={onEdit} className="btn btn-primary">
            <Edit className="w-4 h-4" />
            編集
          </button>
        </div>
      </div>
    </Modal>
  );
}
