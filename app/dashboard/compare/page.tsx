"use client";

import { useState, useMemo } from "react";
import { useApplications } from "@/libs/hooks/useApplications";
import ApplicationCard from "@/components/cards/ApplicationCard";
import { Heading } from "@/components/catalyst/heading";
import { TabList } from "@/components/forms/TabComponents";
import { FileText, BarChart3, TrendingUp, Calendar, MapPin } from "lucide-react";

type CompareView = "overview" | "salary" | "timeline" | "location";

export default function ComparePage() {
  const { applications, filteredApplications, statusStats, setFilterStatus, filterStatus } = useApplications();
  const [compareView, setCompareView] = useState<CompareView>("overview");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  // 比較視圖的 Tab 配置
  const compareTabs = [
    { id: "overview", label: "概要比較", icon: BarChart3 },
    { id: "salary", label: "給与比較", icon: TrendingUp },
    { id: "timeline", label: "スケジュール", icon: Calendar },
    { id: "location", label: "勤務地", icon: MapPin },
  ];

  // 狀態篩選 Tabs
  const statusTabs = useMemo(() => [
    { id: "all", label: `全て (${statusStats.all})` },
    { id: "bookmarked", label: `ブックマーク (${statusStats.bookmarked})` },
    { id: "applied", label: `応募済み (${statusStats.applied})` },
    { id: "interview", label: `面談・面接 (${statusStats.interview})` },
    { id: "offer", label: `内定 (${statusStats.offer})` },
    { id: "rejected", label: `辞退・不採用 (${statusStats.rejected})` },
  ], [statusStats]);

  // 選中的應募數據
  const selectedApps = useMemo(() => 
    applications.filter(app => selectedApplications.includes(app.id)),
    [applications, selectedApplications]
  );

  // 切換選中狀態
  const toggleApplicationSelection = (id: string) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  // 清除所有選中
  const clearSelection = () => {
    setSelectedApplications([]);
  };

  // 全選當前篩選結果
  const selectAllFiltered = () => {
    setSelectedApplications(filteredApplications.map(app => app.id));
  };

  // 給与比較數據
  const salaryComparison = useMemo(() => {
    return selectedApps.map(app => ({
      id: app.id,
      companyName: app.companyName,
      position: app.position,
      postedSalary: app.postedSalary,
      desiredSalary: app.desiredSalary,
      offerSalary: app.offerSalary,
    }));
  }, [selectedApps]);

  // 時間軸數據
  const timelineData = useMemo(() => {
    return selectedApps
      .filter(app => app.schedule?.deadline)
      .map(app => ({
        id: app.id,
        companyName: app.companyName,
        position: app.position,
        event: app.schedule?.nextEvent || "未定",
        deadline: app.schedule?.deadline!,
        interviewMethod: app.schedule?.interviewMethod,
      }))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [selectedApps]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-4 dark:border-white/10">
          <div>
            <Heading>応募比較</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              複数の応募を比較して最適な選択をしましょう
            </p>
          </div>
          <div className="flex gap-2">
            {selectedApplications.length > 0 && (
              <button
                onClick={clearSelection}
                className="btn btn-ghost btn-sm"
              >
                選択をクリア ({selectedApplications.length})
              </button>
            )}
            <button
              onClick={selectAllFiltered}
              className="btn btn-primary btn-sm"
            >
              全て選択 ({filteredApplications.length})
            </button>
          </div>
        </div>

        {/* 狀態篩選 Tabs */}
        <div className="mb-6">
          <TabList
            tabs={statusTabs}
            activeTab={filterStatus}
            onTabChange={(tabId) => setFilterStatus(tabId as any)}
            className="mb-4"
          />
        </div>

        {/* 比較視圖 Tabs */}
        <div className="mb-6">
          <TabList
            tabs={compareTabs}
            activeTab={compareView}
            onTabChange={(tabId) => setCompareView(tabId as CompareView)}
            className="mb-4"
          />
        </div>

        {/* 選中狀態顯示 */}
        {selectedApplications.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedApplications.length} 件の応募を比較中
                </span>
              </div>
              <button
                onClick={clearSelection}
                className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-800"
              >
                クリア
              </button>
            </div>
          </div>
        )}

        {/* 比較內容 */}
        {selectedApplications.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              比較する応募を選択してください
            </h3>
            <p className="text-gray-500 mb-4">
              応募を選択して詳細な比較を行えます
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 概要比較 */}
            {compareView === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedApps.map((application) => (
                  <div key={application.id} className="relative">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => toggleApplicationSelection(application.id)}
                      className="absolute top-2 left-2 z-10 checkbox checkbox-primary"
                    />
                    <ApplicationCard
                      application={application}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 給与比較 */}
            {compareView === "salary" && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">給与比較</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          会社名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          職種
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          掲載給与
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          希望給与
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          オファー給与
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salaryComparison.map((app) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {app.companyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {app.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {app.postedSalary ? (
                              app.postedSalary.type === "annual" ? (
                                `${app.postedSalary.minAnnualSalary || 0} - ${app.postedSalary.maxAnnualSalary || 0}万円`
                              ) : (
                                `${app.postedSalary.minMonthlySalary || 0} - ${app.postedSalary.maxMonthlySalary || 0}万円/月`
                              )
                            ) : (
                              "未記載"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {app.desiredSalary ? `${app.desiredSalary}万円` : "未設定"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {app.offerSalary ? (
                              app.offerSalary.salaryBreakdown ? (
                                `${app.offerSalary.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0)}万円`
                              ) : (
                                "内定受領"
                              )
                            ) : (
                              "未受領"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 時間軸比較 */}
            {compareView === "timeline" && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">スケジュール比較</h3>
                </div>
                <div className="p-6">
                  {timelineData.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">スケジュール情報がありません</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {timelineData.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.companyName}</h4>
                            <p className="text-sm text-gray-500">{item.position}</p>
                            <p className="text-sm text-gray-600">{item.event}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(item.deadline).toLocaleDateString('ja-JP')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.deadline).toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {item.interviewMethod && (
                              <p className="text-xs text-gray-400">
                                {item.interviewMethod.type === "online" ? "オンライン" : "対面"}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 勤務地比較 */}
            {compareView === "location" && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">勤務地比較</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedApps.map((app) => (
                      <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{app.companyName}</h4>
                        <p className="text-sm text-gray-500 mb-2">{app.position}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {app.schedule?.interviewMethod?.type === "in_person" 
                              ? app.schedule.interviewMethod.address 
                              : "リモート可"
                            }
                          </span>
                        </div>
                        {app.tags?.some(tag => tag.includes("リモート")) && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              リモート対応
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 應募列表（用於選擇） */}
        {selectedApplications.length === 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">応募一覧</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((application) => (
                <div key={application.id} className="relative">
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application.id)}
                    onChange={() => toggleApplicationSelection(application.id)}
                    className="absolute top-2 left-2 z-10 checkbox checkbox-primary"
                  />
                  <ApplicationCard
                    application={application}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
