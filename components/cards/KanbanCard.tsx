"use client";

import { useState, useEffect } from "react";
import type { Application, SalaryDetails } from "@/types/application";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Banknote, Calendar, Link2, User, Video, Building2, ExternalLink, Edit2, Trash2 } from "lucide-react";

// Helper function to format salary display (compact)
const formatSalaryCompact = (salary: SalaryDetails | undefined): string | null => {
  if (!salary) return null;
  
  if (salary.minAnnualSalary && salary.maxAnnualSalary) {
    return `¥${salary.minAnnualSalary}〜${salary.maxAnnualSalary}万`;
  } else if (salary.minAnnualSalary) {
    return `¥${salary.minAnnualSalary}万〜`;
  }
  
  return null;
};

interface KanbanCardProps {
  application: Application;
  onViewDetail?: (application: Application) => void;
  onEdit: (application: Application) => void;
}

const employmentTypeLabels = {
  full_time: "正社員",
  contract: "契約社員",
  temporary: "派遣社員",
  part_time: "パート・アルバイト",
  freelance: "フリーランス",
  side_job: "副業",
  dispatch: "派遣", // 保留向後相容性
};

export default function KanbanCard({ 
  application, 
  onViewDetail, 
  onEdit 
}: KanbanCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 獲取應募方法資訊
  const getApplicationMethodInfo = (): {
    icon: typeof Link2 | typeof User;
    text: string;
    url: string | undefined;
    companyName: string | undefined;
    companyUrl: string | undefined;
  } => {
    if (!application.applicationMethod) {
      return {
        icon: Link2,
        text: "未設定",
        url: undefined,
        companyName: undefined,
        companyUrl: undefined,
      };
    }

    switch (application.applicationMethod.type) {
      case "job_site":
        return {
          icon: Link2,
          text: application.applicationMethod.siteName,
          url: application.applicationMethod.siteUrl,
          companyName: application.applicationMethod.recruiterCompany || application.applicationMethod.scoutCompany,
          companyUrl: undefined,
        };
      case "referral":
        return {
          icon: User,
          text: application.applicationMethod.referrerName,
          url: application.applicationMethod.siteUrl,
          companyName: application.applicationMethod.personFrom,
          companyUrl: undefined,
        };
      case "direct":
        return {
          icon: User,
          text: application.applicationMethod.contactPerson,
          url: application.applicationMethod.siteUrl,
          companyName: undefined,
          companyUrl: undefined,
        };
      default:
        return {
          icon: User,
          text: "未設定",
          url: undefined,
          companyName: undefined,
          companyUrl: undefined,
        };
    }
  };

  const methodInfo = getApplicationMethodInfo();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-base-100 border border-base-300 rounded-lg hover:border-base-400 transition-all ${
        isDragging ? "shadow-xl" : "shadow-sm"
      }`}
    >
      {/* 頭部：Drag Handle + 操作 icons - 整個區域可拖拉 */}
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-between gap-2 px-4 py-2 border-b border-base-200 cursor-grab active:cursor-grabbing"
      >
        {/* Drag Handle Icon */}
        <div className="shrink-0">
          <GripVertical className="w-4 h-4 text-base-content/40" />
        </div>
        
        {/* Action Icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(application);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 text-base-content/40 hover:text-primary hover:bg-base-200 rounded transition-colors"
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Delete action
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 text-base-content/40 hover:text-error hover:bg-base-200 rounded transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 主體：其他資訊置中顯示 */}
      <div 
        className="px-4 py-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail?.(application);
        }}
      >
        {/* Schedule / Next Action - 移到最上面 */}
        {application.schedule?.nextEvent && (
          <div className="mb-3 p-2.5 bg-warning/10 border border-warning/20 rounded text-xs">
            <div className="space-y-2">
              {/* 活動名稱 */}
              <div className="font-medium text-center text-base-content/80 line-clamp-2">
                {application.schedule.nextEvent}
              </div>
              
              {/* 日期時間 */}
              {application.schedule.deadline && (
                <div className="flex items-center justify-center gap-1.5 text-base-content/60">
                  <Calendar className="w-3.5 h-3.5 text-warning" />
                  <span>
                    {mounted ? new Date(application.schedule.deadline).toLocaleString("ja-JP", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "..."}
                  </span>
                </div>
              )}
              
              {/* 面試方式 */}
              {application.schedule.interviewMethod && (
                <div className="flex items-center justify-center gap-1.5">
                  {application.schedule.interviewMethod.type === "online" ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-warning" />
                      <span className="text-base-content/70">オンライン</span>
                      {application.schedule.interviewMethod.url && (
                        <a
                          href={application.schedule.interviewMethod.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline ml-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-warning" />
                      <span className="text-base-content/70 truncate">
                        対面: {application.schedule.interviewMethod.address}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 公司名 */}
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="font-semibold text-base truncate">{application.companyName}</h3>
          {application.companyUrl && (
            <a
              href={application.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-content/40 hover:text-primary transition-colors shrink-0"
              title="会社サイトを見る"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* 應募方法 */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-base-content/60 mb-2 p-2 bg-base-200/50 rounded">
          <methodInfo.icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{methodInfo.text}</span>
        </div>

        {/* 詳細を見るボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onViewDetail === 'function') {
              onViewDetail(application);
            } else if (typeof onEdit === 'function') {
              onEdit(application);
            }
          }}
          className="w-full text-xs text-center text-base-content/60 hover:text-base-content py-2 hover:bg-base-200 rounded transition-colors border border-base-300"
        >
          詳細を見る
        </button>
      </div>
    </div>
  );
}
