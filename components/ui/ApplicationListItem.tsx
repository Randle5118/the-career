"use client";

import type { Application, SalaryDetails } from "@/types/application";
import { Calendar, ExternalLink, MoreHorizontal, Banknote, Link2, User } from "lucide-react";
import { useState, useEffect } from "react";

// Helper function to format salary display (compact)
const formatSalaryCompact = (salary: SalaryDetails | undefined): string | null => {
  if (!salary) return null;
  
  if (salary.type === "annual") {
    if (salary.minAnnualSalary && salary.maxAnnualSalary) {
      return `¥${salary.minAnnualSalary}〜${salary.maxAnnualSalary}万`;
    } else if (salary.minAnnualSalary) {
      return `¥${salary.minAnnualSalary}万〜`;
    }
  } else if (salary.type === "monthly_with_bonus") {
    if (salary.minMonthlySalary && salary.maxMonthlySalary) {
      return `月¥${salary.minMonthlySalary}〜${salary.maxMonthlySalary}万`;
    }
  }
  
  return null;
};

interface ApplicationListItemProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  isLast?: boolean;
}

// Status badge configuration
const statusConfig = {
  bookmarked: { label: "ブックマーク", color: "badge-ghost" },
  applied: { label: "応募済み", color: "badge-info" },
  casual_interview: { label: "面談", color: "badge-secondary" },
  interview: { label: "面接", color: "badge-primary" },
  first_interview: { label: "一次面接", color: "badge-primary" },
  final_interview: { label: "最終面接", color: "badge-warning" },
  offer: { label: "内定", color: "badge-success" },
  offer_received: { label: "オファー受領", color: "badge-success" },
  rejected: { label: "終了", color: "badge-error" },
  withdrawn: { label: "辞退", color: "badge-ghost" },
};

const employmentTypeLabels = {
  full_time: "正社員",
  contract: "契約社員",
  temporary: "派遣社員",
  part_time: "パート・アルバイト",
  freelance: "フリーランス",
  side_job: "副業",
  dispatch: "派遣", // 保留向後相容性
};

export default function ApplicationListItem({
  application,
  onEdit,
  onDelete,
  isLast = false,
}: ApplicationListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statusInfo = statusConfig[application.status];
  const isNextActionOverdue =
    mounted &&
    application.schedule?.deadline &&
    new Date(application.schedule.deadline) < new Date();

  const handleDelete = () => {
    onDelete(application.id);
    setShowDeleteConfirm(false);
  };

  // Get application method info
  const getMethodIcon = () => {
    if (!application.applicationMethod) return Link2;
    return application.applicationMethod.type === "job_site" ? Link2 : User;
  };

  const getMethodText = () => {
    if (!application.applicationMethod) return "未設定";
    
    switch (application.applicationMethod.type) {
      case "job_site":
        return application.applicationMethod.siteName;
      case "headhunter":
        return application.applicationMethod.headhunterName;
      case "referral":
        return `紹介: ${application.applicationMethod.referrerName}`;
      case "direct":
        return `直接: ${application.applicationMethod.contactPerson}`;
      case "recruiter":
        return `リクルーター: ${application.applicationMethod.recruiterName}`;
      default:
        return "未設定";
    }
  };

  const MethodIcon = getMethodIcon();

  return (
    <>
      <div className={`hover:bg-base-50 transition-colors ${!isLast ? 'border-b border-base-200' : ''}`}>
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-start lg:items-center gap-3 lg:gap-4">
            {/* Company & Position - 35% */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">
                      {application.companyName}
                    </h3>
                    {application.employmentType && (
                      <span className="badge badge-xs badge-outline shrink-0">
                        {employmentTypeLabels[application.employmentType]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-base-content/70 truncate">
                    {application.position}
                  </p>
                  {/* Tags - Mobile */}
                  {application.tags && application.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 lg:hidden">
                      {application.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="badge badge-xs bg-base-200 text-base-content/80 border-base-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {application.tags.length > 3 && (
                        <span className="badge badge-xs badge-ghost">
                          +{application.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status - 12% */}
            <div className="w-24 sm:w-28 shrink-0 hidden sm:block">
              <span className={`badge badge-sm ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Method & Salary - 25% */}
            <div className="flex-1 min-w-0 hidden lg:block">
              <div className="space-y-1.5 text-sm text-base-content/70">
                <div className="flex items-center gap-1.5 truncate">
                  <MethodIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{getMethodText()}</span>
                </div>
                {(application.postedSalary || application.desiredSalary) && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Banknote className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {application.offerSalary 
                        ? `オファー: ${formatSalaryCompact(application.offerSalary)}`
                        : application.desiredSalary 
                          ? `希望: ${application.desiredSalary}万`
                          : formatSalaryCompact(application.postedSalary)
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags - Desktop - 15% */}
            <div className="w-40 shrink-0 hidden xl:block">
              {application.tags && application.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {application.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="badge badge-xs bg-base-200 text-base-content/80 border-base-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {application.tags.length > 2 && (
                    <span className="badge badge-xs badge-ghost">
                      +{application.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Date - 13% */}
            <div className="w-32 shrink-0 hidden xl:block">
              {application.schedule?.deadline && (
                <div className="flex items-center gap-1.5 text-sm text-base-content/60">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {mounted ? new Date(application.schedule.deadline).toLocaleDateString("ja-JP", {
                      month: "2-digit",
                      day: "2-digit",
                    }) : "..."}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {application.applicationMethod?.type === "job_site" && 
               application.applicationMethod.jobUrl && (
                <a
                  href={application.applicationMethod.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-base-200 rounded transition-colors"
                  title="求人を見る"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              
              <div className="relative">
                <button
                  className="p-2 hover:bg-base-200 rounded transition-colors"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-base-100 rounded-lg shadow-lg border border-base-300 py-1 z-20">
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-base-200 transition-colors"
                        onClick={() => {
                          onEdit(application);
                          setShowMenu(false);
                        }}
                      >
                        編集
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-error hover:bg-base-200 transition-colors"
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Next Action - Mobile & Desktop */}
          {application.schedule?.nextEvent && (
            <div className={`mt-3 p-2 rounded text-xs ${
              isNextActionOverdue 
                ? "bg-warning/10 text-warning-content" 
                : "bg-info/10 text-info-content"
            }`}>
              <span className="font-medium">次: </span>
              {application.schedule.nextEvent}
              {application.schedule.deadline && (
                <span className="ml-2 opacity-70">
                  ({mounted ? new Date(application.schedule.deadline).toLocaleString("ja-JP", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "..."})
                </span>
              )}
            </div>
          )}

          {/* Mobile Status Badge */}
          <div className="mt-2 md:hidden">
            <span className={`badge badge-sm ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">応募情報を削除</h3>
            <p className="py-4">
              {application.companyName} の応募情報を削除しますか?
              <br />
              この操作は取り消せません。
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                キャンセル
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                削除する
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
          />
        </div>
      )}
    </>
  );
}
