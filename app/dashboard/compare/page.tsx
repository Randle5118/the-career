"use client";

import { useState, useMemo } from "react";
import { useApplications } from "@/libs/hooks/useApplications";
import type { Application } from "@/types/application";
import { Heading } from "@/components/catalyst/heading";
import { X, Plus, Briefcase, Building2, Banknote, User, Tag as TagIcon, ExternalLink, CheckCircle, FileText, Edit2, Trash2 } from "lucide-react";

const MAX_COMPARE_ITEMS = 3;

export default function ComparePage() {
  const { applications } = useApplications();
  // 最多選 3 個,用陣列索引代表插槽位置
  const [selectedSlots, setSelectedSlots] = useState<(string | null)[]>([null, null, null]);
  const [isSelectingForSlot, setIsSelectingForSlot] = useState<number | null>(null);

  // 獲取選中的應募數據
  const selectedApps = useMemo(() => 
    selectedSlots.map(id => id ? applications.find(app => app.id === id) : null),
    [selectedSlots, applications]
  );

  // 選擇應募到指定插槽
  const selectApplication = (slotIndex: number, appId: string) => {
    const newSlots = [...selectedSlots];
    newSlots[slotIndex] = appId;
    setSelectedSlots(newSlots);
    setIsSelectingForSlot(null);
  };

  // 移除插槽中的應募
  const removeFromSlot = (slotIndex: number) => {
    const newSlots = [...selectedSlots];
    newSlots[slotIndex] = null;
    setSelectedSlots(newSlots);
  };

  // 清除所有選擇
  const clearAll = () => {
    setSelectedSlots([null, null, null]);
    setIsSelectingForSlot(null);
  };

  // 獲取可選擇的應募(排除已選中的)
  const availableApplications = useMemo(() => 
    applications.filter(app => !selectedSlots.includes(app.id)),
    [applications, selectedSlots]
  );

  // 格式化薪資
  const formatSalary = (app: Application | null | undefined): string => {
    if (!app) return "-";
    
    if (app.offerSalary?.salaryBreakdown) {
      const total = app.offerSalary.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0);
      return `¥${total}万`;
    }
    
    if (app.desiredSalary) {
      return `¥${app.desiredSalary}万`;
    }
    
    if (app.postedSalary) {
      const min = app.postedSalary.minAnnualSalary || 0;
      const max = app.postedSalary.maxAnnualSalary || 0;
      return `¥${min}〜${max}万`;
    }
    
    return "-";
  };

  // 獲取應募方法
  const getApplicationMethod = (app: Application | null | undefined): string => {
    if (!app?.applicationMethod) return "-";
    
    switch (app.applicationMethod.type) {
      case "job_site":
        return app.applicationMethod.siteName;
      case "referral":
        return `紹介: ${app.applicationMethod.referrerName}`;
      case "direct":
        return "直接応募";
      default:
        return "-";
    }
  };

  // 獲取狀態標籤
  const getStatusLabel = (app: Application | null | undefined): string => {
    if (!app) return "-";
    switch (app.status) {
      case "bookmarked": return "ブックマーク";
      case "applied": return "応募済み";
      case "interview": return "面談・面接";
      case "offer": return "内定";
      case "rejected": return "終了";
      default: return "-";
    }
  };

  const getStatusColor = (app: Application | null | undefined): string => {
    if (!app) return "bg-gray-100 text-gray-600";
    switch (app.status) {
      case "bookmarked": return "bg-blue-100 text-blue-700";
      case "applied": return "bg-purple-100 text-purple-700";
      case "interview": return "bg-yellow-100 text-yellow-700";
      case "offer": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-6 mb-8">
          <div>
            <Heading>応募比較</Heading>
            <p className="mt-2 text-base/6 text-base-content/60 sm:text-sm/6">
              最大3件の応募を選択して比較できます
            </p>
          </div>
          {selectedSlots.some(slot => slot !== null) && (
            <button
              onClick={clearAll}
              className="btn btn-ghost btn-sm"
            >
              すべてクリア
            </button>
          )}
        </div>

        {/* 比較表格 - 整合選擇器 */}
        {(
          <div className="bg-white rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: '200px' }} />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th className="px-6 py-6 text-left text-sm font-semibold text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-base-content/40" />
                        <span>応募先</span>
                      </div>
                    </th>
                    {selectedSlots.map((slotId, index) => {
                      const app = selectedApps[index];
                      return (
                        <th key={index} className="px-6 py-6 text-center relative">
                          {app ? (
                            // 已選擇的應募
                            <div className="flex flex-col gap-3">
                              {/* 公司名 */}
                              <div className="font-bold text-base truncate">
                                {app.companyName}
                              </div>
                              
                              {/* 操作按鈕 - 只用 icon */}
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setIsSelectingForSlot(index)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary hover:text-white transition-all border border-base-300"
                                  title="変更"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFromSlot(index)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error hover:text-white transition-all border border-base-300"
                                  title="削除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            // 空插槽
                            <button
                              onClick={() => setIsSelectingForSlot(index)}
                              className="w-full py-3 flex flex-col items-center justify-center gap-2 hover:bg-base-50 rounded-lg transition-all border-2 border-dashed border-base-300"
                            >
                              <Plus className="w-5 h-5 text-base-content/40" />
                            </button>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {/* 職種 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-base-content/40" />
                        <span>職種</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center text-sm ${!app ? 'bg-base-100' : ''}`}>
                        {app ? app.position : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* 雇用形態 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-base-content/40" />
                        <span>雇用形態</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center text-sm ${!app ? 'bg-base-100' : ''}`}>
                        {app ? (
                          app.employmentType === "full_time" ? "正社員" :
                          app.employmentType === "contract" ? "契約社員" :
                          app.employmentType === "freelance" ? "フリーランス" :
                          app.employmentType === "side_job" ? "副業" : "-"
                        ) : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* 掲載年収 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-base-content/40" />
                        <span>掲載年収</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center text-sm ${!app ? 'bg-base-100' : ''}`}>
                        {app ? (
                          app.postedSalary ? 
                            `¥${app.postedSalary.minAnnualSalary || 0}〜${app.postedSalary.maxAnnualSalary || 0}万` 
                            : "-"
                        ) : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* 希望年収 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-base-content/40" />
                        <span>希望年収</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center text-sm ${!app ? 'bg-base-100' : 'font-semibold'}`}>
                        {app ? (
                          app.desiredSalary ? `¥${app.desiredSalary}万` : "-"
                        ) : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* オファー年収 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-base-content/40" />
                        <span>オファー年収</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center text-sm ${!app ? 'bg-base-100' : 'font-semibold text-success'}`}>
                        {app ? (
                          app.offerSalary?.salaryBreakdown ?
                            `¥${app.offerSalary.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0)}万`
                            : "-"
                        ) : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* 応募経路 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-base-content/40" />
                        <span>応募経路</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center text-sm ${!app ? 'bg-base-100' : ''}`}>
                        {app ? getApplicationMethod(app) : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* 狀態 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-base-content/40" />
                        <span>ステータス</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center ${!app ? 'bg-base-100' : ''}`}>
                        {app ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app)}`}>
                            {getStatusLabel(app)}
                          </span>
                        ) : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* URL */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-base-content/40" />
                        <span>会社サイト</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 text-center text-sm ${!app ? 'bg-base-100' : ''}`}>
                        {app ? (
                          app.companyUrl ? (
                            <a
                              href={app.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              サイトを見る
                            </a>
                          ) : (
                            "-"
                          )
                        ) : <span className="text-base-content/30">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Tags */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-base-content/40" />
                        <span>タグ</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 ${!app ? 'bg-base-100' : ''}`}>
                        {app ? (
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {app.tags && app.tags.length > 0 ? (
                              app.tags.map((tag, i) => (
                                <span key={i} className="badge badge-sm badge-outline whitespace-nowrap">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-base-content/40">-</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-base-content/30">-</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* オファー詳細 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-base-content/40" />
                        <span>オファー詳細</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 ${!app ? 'bg-base-100' : ''}`}>
                        {app ? (
                          app.offerSalary?.salaryBreakdown ? (
                            <div className="space-y-2">
                              {app.offerSalary.salaryBreakdown.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                  <span className="text-base-content/70">{item.salaryType}</span>
                                  <span className="font-medium">¥{item.salary}万</span>
                                </div>
                              ))}
                              {app.offerSalary.notes && (
                                <div className="mt-2 pt-2 border-t border-base-200">
                                  <p className="text-xs text-base-content/60 italic">
                                    {app.offerSalary.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-xs text-base-content/40">-</span>
                            </div>
                          )
                        ) : (
                          <div className="text-center">
                            <span className="text-base-content/30">-</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 備註 */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-base-content/70 bg-base-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-base-content/40" />
                        <span>備考</span>
                      </div>
                    </td>
                    {selectedApps.map((app, index) => (
                      <td key={index} className={`px-6 py-4 ${!app ? 'bg-base-100' : ''}`}>
                        {app ? (
                          app.notes ? (
                            <div className="text-sm text-base-content/70 max-w-xs">
                              <p className="line-clamp-3" title={app.notes}>
                                {app.notes}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-xs text-base-content/40">-</span>
                            </div>
                          )
                        ) : (
                          <div className="text-center">
                            <span className="text-base-content/30">-</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 選擇應募的 Modal */}
        {isSelectingForSlot !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
                <h3 className="text-lg font-semibold">
                  応募を選択 (スロット {isSelectingForSlot + 1})
                </h3>
                <button
                  onClick={() => setIsSelectingForSlot(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {availableApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-base-content/60">
                      選択可能な応募がありません
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableApplications.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => selectApplication(isSelectingForSlot, app.id)}
                        className="text-left border-2 border-base-300 rounded-lg p-4 hover:border-primary hover:bg-base-50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-base truncate pr-2">
                            {app.companyName}
                          </h4>
                          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app)}`}>
                            {getStatusLabel(app)}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/70 mb-2 truncate">
                          {app.position}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-base-content/60">
                            {getApplicationMethod(app)}
                          </span>
                          <span className="font-medium text-success">
                            {formatSalary(app)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 空狀態提示 */}
        {selectedSlots.every(slot => slot === null) && (
          <div className="text-center py-12 bg-base-50 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-base-content/40" />
            </div>
            <h3 className="text-lg font-medium text-base-content mb-2">
              応募を選択して比較を開始
            </h3>
            <p className="text-base-content/60">
              上のスロットをクリックして、比較したい応募を選択してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
