"use client";

import type { Application, SalaryDetails } from "@/types/application";
import { useState, useEffect } from "react";
import { MapPin, Briefcase, Link2, Calendar, User, Banknote, Video, Building2, ExternalLink, Tag, Edit2, Trash2 } from "lucide-react";

// Helper function to format salary display
const formatSalary = (salary: SalaryDetails | undefined): string | null => {
  if (!salary) return null;
  
  if (salary.minAnnualSalary && salary.maxAnnualSalary) {
    return `年収 ${salary.minAnnualSalary}万円〜${salary.maxAnnualSalary}万円`;
  } else if (salary.minAnnualSalary) {
    return `年収 ${salary.minAnnualSalary}万円〜`;
  }
  
  return null;
};

// Helper function to format offer salary (different structure)
const formatOfferSalary = (offerSalary: any): string | null => {
  if (!offerSalary || !offerSalary.salaryBreakdown) return null;
  
  const total = offerSalary.salaryBreakdown.reduce((sum: number, item: any) => sum + (item.salary || 0), 0);
  return `${total}万円`;
};

interface ApplicationCardProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  onViewDetail?: (application: Application) => void;
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
  rejected: { label: "不採用", color: "badge-error" },
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

export default function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onViewDetail,
}: ApplicationCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = () => {
    onDelete(application.id);
    setShowDeleteConfirm(false);
  };

  const statusInfo = statusConfig[application.status];
  const isNextActionOverdue =
    mounted &&
    application.schedule?.deadline &&
    new Date(application.schedule.deadline) < new Date();

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
        // 顯示網站名稱，如果有 scout 資訊則加上標記
        let displayText = application.applicationMethod.siteName;
        if (application.applicationMethod.scoutType === "recruiter" && application.applicationMethod.recruiterName) {
          displayText += ` (リクルーター)`;
        } else if (application.applicationMethod.scoutType === "direct" && application.applicationMethod.scoutName) {
          displayText += ` (スカウト)`;
        }
        
        return {
          icon: Link2,
          text: displayText,
          url: application.applicationMethod.siteUrl,
          companyName: application.applicationMethod.recruiterCompany || application.applicationMethod.scoutCompany,
          companyUrl: undefined,
        };
      case "referral":
        return {
          icon: User,
          text: `紹介: ${application.applicationMethod.referrerName}`,
          url: application.applicationMethod.siteUrl,
          companyName: application.applicationMethod.personFrom,
          companyUrl: undefined,
        };
      case "direct":
        return {
          icon: User,
          text: `直接: ${application.applicationMethod.contactPerson}`,
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
    <>
      <div 
        className="bg-base-100 border border-base-300 rounded-lg hover:border-base-400 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => onViewDetail?.(application)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-2">
            {/* Line 1: Company Name + Link + Actions */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{application.companyName}</h3>
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
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(application);
                  }}
                  className="p-1.5 text-base-content/40 hover:text-primary hover:bg-base-200 rounded transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="p-1.5 text-base-content/40 hover:text-error hover:bg-base-200 rounded transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Line 2: Employment Type + Status */}
            <div className="flex items-center gap-2 mb-1.5">
              {application.employmentType && (
                <div className="badge badge-sm badge-outline">
                  {employmentTypeLabels[application.employmentType]}
                </div>
              )}
              <div className={`badge badge-sm ${statusInfo.color}`}>
              {statusInfo.label}
            </div>
            </div>
            
            {/* Line 3: Position */}
            <p className="text-base-content/60 text-sm">{application.position}</p>
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-sm border-t border-base-200 pt-2">
            {/* Application Method */}
              <div className="flex items-start gap-2">
              <methodInfo.icon className="w-4 h-4 text-base-content/40 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1">
                {methodInfo.url ? (
                  <a
                    href={methodInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base-content/70 hover:text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {methodInfo.text}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <div className="text-base-content/70">{methodInfo.text}</div>
                )}
                {/* Headhunter company info */}
                {methodInfo.companyName && (
                  <div className="text-xs text-base-content/50">
                    {methodInfo.companyUrl ? (
                      <a
                        href={methodInfo.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {methodInfo.companyName}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span>{methodInfo.companyName}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Posted Salary */}
            {application.postedSalary && formatSalary(application.postedSalary) && (
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-base-content/40 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-base-content/70">
                    {formatSalary(application.postedSalary)}
                  </div>
                  {application.postedSalary.notes && (
                    <div className="text-xs text-base-content/50 mt-0.5 line-clamp-2">
                      {application.postedSalary.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desired Salary */}
            {application.desiredSalary && (
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-base-content/40 mt-0.5 shrink-0" />
                <span className="text-base-content/70">希望年収: {application.desiredSalary}万円</span>
              </div>
            )}

            {/* Offer Salary */}
            {application.offerSalary && formatOfferSalary(application.offerSalary) && (
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-success font-medium">
                    オファー: {formatOfferSalary(application.offerSalary)}
                  </div>
                  {application.offerSalary.notes && (
                    <div className="text-xs text-base-content/60 mt-0.5 line-clamp-2">
                      {application.offerSalary.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Schedule / Next Action */}
          {application.schedule?.nextEvent && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                isNextActionOverdue 
                  ? "bg-warning/10 border border-warning/20" 
                  : "bg-info/10 border border-info/20"
              }`}
            >
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-base-content">
                    {application.schedule.nextEvent}
                  </div>
                  {application.schedule.deadline && (
                    <div className={`text-xs mt-1 ${isNextActionOverdue ? "text-warning" : "text-base-content/60"}`}>
                      {mounted ? new Date(application.schedule.deadline).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "..."}
                    </div>
                  )}
                  {application.schedule.interviewMethod && (
                    <div className="mt-2 flex items-start gap-1.5">
                      {application.schedule.interviewMethod.type === "online" ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-base-content/60 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-base-content/60">オンライン面接</div>
                            <a
                              href={application.schedule.interviewMethod.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate block"
                            >
                              {application.schedule.interviewMethod.url}
                            </a>
                          </div>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-base-content/60 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs text-base-content/60">対面面接</div>
                            <div className="text-xs text-base-content/70 mt-0.5">
                              {application.schedule.interviewMethod.address}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
                </div>
              )}

          {/* Tags Section */}
          {application.tags && application.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
                {application.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-sm bg-base-200 text-base-content/80 border-base-300"
                  >
                    {tag}
                  </span>
                ))}
                {application.tags.length > 3 && (
                  <span className="text-xs text-base-content/50">
                    +{application.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="mt-4 text-sm">
              <div className="font-medium mb-1.5 text-base-content/80">メモ</div>
              <p className="text-base-content/60 line-clamp-2 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}
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
