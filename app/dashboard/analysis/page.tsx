"use client";

import { useState } from "react";
import { useApplications } from "@/libs/hooks/useApplications";
import { Heading } from "@/components/catalyst/heading";
import {
  TrendingUp,
  Building2,
  DollarSign,
  MapPin,
  Sparkles,
  Calendar,
  ExternalLink,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Application } from "@/types/application";

/**
 * 応募分析ページ
 *
 * 目的：応募済みの企業をAI分析し、より良い意思決定をサポート
 */
export default function AnalysisPage() {
  const router = useRouter();
  const { applications, filteredApplications, isLoading } = useApplications();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // 狀態標籤配色
  const getStatusBadge = (status: Application["status"]) => {
    const badges = {
      bookmarked: { label: "ブックマーク", class: "badge-ghost" },
      applied: { label: "応募済み", class: "badge-info" },
      interview: { label: "面接中", class: "badge-warning" },
      offer: { label: "内定", class: "badge-success" },
      rejected: { label: "終了", class: "badge-error" },
    };
    return badges[status] || badges.bookmarked;
  };

  // 格式化薪資顯示
  const formatSalary = (app: Application) => {
    if (!app.postedSalary) return "給与未設定";

    const { minAnnualSalary, maxAnnualSalary } = app.postedSalary;

    if (minAnnualSalary && maxAnnualSalary) {
      return `${minAnnualSalary}万円 〜 ${maxAnnualSalary}万円`;
    } else if (minAnnualSalary) {
      return `${minAnnualSalary}万円〜`;
    } else if (maxAnnualSalary) {
      return `〜${maxAnnualSalary}万円`;
    }

    return "給与未設定";
  };

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-4 dark:border-white/10 mb-8">
          <div>
            <Heading>応募分析</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              応募済みの企業をAI分析し、より良いキャリア選択をサポートします
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/dashboard/applications")}
          >
            ＋ 応募を追加
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-base-content mb-3">
              まだ応募がありません
            </h2>

            <p className="text-base-content/60 text-center max-w-md mb-8">
              応募を追加すると、AIが企業を分析し、
              <br />
              より良い意思決定をサポートします。
            </p>

            <button
              className="btn btn-primary btn-lg"
              onClick={() => router.push("/dashboard/applications")}
            >
              ＋ 最初の応募を追加
            </button>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && applications.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">総応募数</p>
                    <p className="text-2xl font-bold text-base-content">
                      {applications.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">面接中</p>
                    <p className="text-2xl font-bold text-base-content">
                      {
                        applications.filter((a) => a.status === "interview")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">内定</p>
                    <p className="text-2xl font-bold text-base-content">
                      {applications.filter((a) => a.status === "offer").length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">AI分析済み</p>
                    <p className="text-2xl font-bold text-base-content">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map((app) => {
                const statusBadge = getStatusBadge(app.status);

                return (
                  <div
                    key={app.id}
                    className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-base-content">
                            {app.companyName}
                          </h3>
                          {app.companyUrl && (
                            <a
                              href={app.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-base-content/40 hover:text-primary"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-base-content/70">
                          {app.position}
                        </p>
                      </div>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatSalary(app)}</span>
                      </div>

                      {app.schedule?.deadline && (
                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(app.schedule.deadline).toLocaleDateString(
                              "ja-JP"
                            )}
                          </span>
                        </div>
                      )}

                      {app.tags && app.tags.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <Tag className="w-4 h-4 text-base-content/60 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {app.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="badge badge-sm badge-ghost"
                              >
                                {tag}
                              </span>
                            ))}
                            {app.tags.length > 3 && (
                              <span className="badge badge-sm badge-ghost">
                                +{app.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-base-300">
                      <button
                        className="btn btn-sm btn-primary flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open AI Analysis Modal
                          setSelectedApp(app);
                        }}
                      >
                        <Sparkles className="w-4 h-4" />
                        AI分析
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/applications?id=${app.id}`);
                        }}
                      >
                        詳細
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
