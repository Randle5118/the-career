"use client";

import React from "react";
import type { Application } from "@/types/application";
import { 
  Building2, 
  Briefcase, 
  User, 
  Banknote, 
  Tag as TagIcon, 
  ExternalLink, 
  FileText,
  Mail,
  UserCheck
} from "lucide-react";

interface BasicInfoSectionProps {
  application: Application;
  onEdit?: () => void;
}

export default function BasicInfoSection({ 
  application, 
  onEdit 
}: BasicInfoSectionProps) {
  // 應募方法顯示
  const getApplicationMethodLabel = () => {
    const method = application.applicationMethod;
    if (!method) return "未設定";

    switch (method.type) {
      case "job_site":
        // 顯示網站名稱和 scout 資訊
        if (method.scoutType === "recruiter" && method.recruiterName) {
          return `${method.siteName} (${method.recruiterName}${
            method.recruiterCompany ? ` - ${method.recruiterCompany}` : ""
          })`;
        } else if (method.scoutType === "direct" && method.scoutName) {
          return `${method.siteName} (${method.scoutName}${
            method.scoutCompany ? ` - ${method.scoutCompany}` : ""
          })`;
        }
        return method.siteName;
      case "referral":
        // 顯示紹介者和關係
        return `${method.referrerName} (${method.personFrom})`;
      case "direct":
        // 顯示連絡先担当者
        return method.contactPerson;
      default:
        return "未設定";
    }
  };

  // 取得 email（用於顯示郵件 icon）
  const getApplicationMethodEmail = () => {
    const method = application.applicationMethod;
    if (!method) return undefined;

    switch (method.type) {
      case "job_site":
        return method.scoutEmail;
      case "referral":
        return method.referrerEmail;
      case "direct":
        return method.contactEmail;
      default:
        return undefined;
    }
  };

  // 應募方法連結
  const getApplicationMethodUrl = () => {
    const method = application.applicationMethod;
    if (!method) return undefined;

    switch (method.type) {
      case "job_site":
        return method.siteUrl;
      case "referral":
        return method.siteUrl;
      case "direct":
        return method.siteUrl;
      default:
        return undefined;
    }
  };

  // 給与顯示
  const getSalaryDisplay = () => {
    const parts = [];
    if (application.postedSalary) {
      const posted = application.postedSalary.type === "annual"
        ? `年収 ${application.postedSalary.minAnnualSalary || 0}〜${application.postedSalary.maxAnnualSalary || 0}万円`
        : `月給 ${application.postedSalary.minMonthlySalary || 0}〜${application.postedSalary.maxMonthlySalary || 0}万円`;
      parts.push(posted);
    }
    if (application.desiredSalary) {
      parts.push(`希望: ${application.desiredSalary}万円`);
    }
    if (application.offerSalary) {
      const offer = application.offerSalary.salaryBreakdown?.reduce(
        (sum, item) => sum + item.salary,
        0
      );
      parts.push(`オファー: ${offer}万円`);
    }
    return parts.join(" / ");
  };

  return (
    <div className="text-base-content/60 text-sm divide-y divide-base-300">
      {/* 会社名 */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2 w-32 shrink-0">
          <Building2 className="w-4 h-4" />
          <div className="text-sm">会社名</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-base-content/90 truncate">{application.companyName}</span>
            {application.companyUrl && (
              <a
                href={application.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base-content/60 hover:text-primary transition-colors shrink-0"
                title="会社サイトを開く"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 職種 */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2 w-32 shrink-0">
          <Briefcase className="w-4 h-4" />
          <div className="text-sm">職種</div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-base-content/90 truncate block">{application.position}</span>
        </div>
      </div>

      {/* 雇用形態 */}
      {application.employmentType && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2 w-32 shrink-0">
            <UserCheck className="w-4 h-4" />
            <div className="text-sm">雇用形態</div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="badge badge-outline text-sm">
              {employmentTypeLabels[application.employmentType]}
            </span>
          </div>
        </div>
      )}

      {/* 応募方法 */}
      <div className="flex items-start justify-between py-4">
        <div className="flex items-center space-x-2 w-32 shrink-0 pt-1">
          <User className="w-4 h-4" />
          <div className="text-sm">応募方法</div>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="text-sm font-medium text-base-content/90">
            {getApplicationMethodLabel()}
          </div>
          
          {/* Email 連結 */}
          {getApplicationMethodEmail() && (
            <a
              href={`mailto:${getApplicationMethodEmail()}`}
              className="flex items-center gap-2 text-xs text-base-content/60 hover:text-primary transition-colors w-fit"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{getApplicationMethodEmail()}</span>
            </a>
          )}
          
          {/* URL 連結 */}
          {getApplicationMethodUrl() && (
            <a
              href={getApplicationMethodUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-base-content/60 hover:text-primary transition-colors w-fit"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="truncate">{getApplicationMethodUrl()}</span>
            </a>
          )}
          
          {/* 応募方法のメモ */}
          {application.applicationMethod?.memo && (
            <div className="pt-1 pl-4 border-l-2 border-base-300">
              <p className="text-xs text-base-content/70 whitespace-pre-wrap">
                {application.applicationMethod.memo}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 給与情報 */}
      {(application.postedSalary || application.desiredSalary || application.offerSalary) && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2 w-32 shrink-0">
            <Banknote className="w-4 h-4" />
            <div className="text-sm">給与</div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-base-content/90 truncate block">{getSalaryDisplay()}</span>
          </div>
        </div>
      )}

      {/* タグ */}
      {application.tags && application.tags.length > 0 && (
        <div className="flex items-start justify-between py-4">
          <div className="flex items-center space-x-2 w-32 shrink-0 pt-1">
            <TagIcon className="w-4 h-4" />
            <div className="text-sm">タグ</div>
          </div>
          <div className="flex-1 flex flex-wrap gap-2 min-w-0">
            {application.tags.map((tag, index) => (
              <span 
                key={index} 
                className="badge badge-outline text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* メモ */}
      {application.notes && (
        <div className="flex items-start justify-between py-4">
          <div className="flex items-center space-x-2 w-32 shrink-0 pt-1">
            <FileText className="w-4 h-4" />
            <div className="text-sm">メモ</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-base-content/90 whitespace-pre-wrap">
              {application.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// 雇用形態のラベル
const employmentTypeLabels: Record<string, string> = {
  full_time: "正社員",
  contract: "契約社員",
  part_time: "パート・アルバイト",
  dispatch: "派遣",
  freelance: "フリーランス",
  side_job: "副業",
};
