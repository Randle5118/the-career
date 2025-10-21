"use client";

import Link from "next/link";
import { useState } from "react";
import { Heading } from "@/components/catalyst/heading";

// Mock data for dashboard overview (will be replaced with API calls)
const mockStats = {
  totalApplications: 3,
  activeApplications: 2,
  interviews: 1,
  offers: 0,
};

const mockUpcomingActions = [
  {
    id: "1",
    companyName: "株式会社サンプル",
    action: "面接の準備をする",
    dueDate: "2025-10-15",
    isOverdue: false,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8 md:p-8 max-w-7xl bg-white">
        {/* Welcome Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-4 dark:border-white/10">
          <div>
            <Heading>ダッシュボード</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              転職活動の状況を一目で確認できます
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Applications */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-600">応募中</h2>
              <div className="text-2xl opacity-30">📊</div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-blue-600">
                {mockStats.totalApplications}
              </p>
              <span className="text-sm text-gray-500">社</span>
            </div>
          </div>

          {/* Active Applications */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-600">今週の面接</h2>
              <div className="text-2xl opacity-30">⚡</div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-green-600">
                {mockStats.activeApplications}
              </p>
              <span className="text-sm text-gray-500">件</span>
            </div>
          </div>

          {/* Interviews */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-600">通過企業</h2>
              <div className="text-2xl opacity-30">🎯</div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-purple-600">
                {mockStats.interviews}
              </p>
              <span className="text-sm text-gray-500">社</span>
            </div>
          </div>

          {/* Offers */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-600">履歴書</h2>
              <div className="text-2xl opacity-30">🎉</div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-orange-600">
                {mockStats.offers}
              </p>
              <span className="text-sm text-gray-500">件</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">最近の応募</h2>
              <span className="text-xs text-gray-500">
                最新の応募状況
              </span>
            </div>
            {mockUpcomingActions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="text-6xl mb-4 opacity-20">✨</div>
                <p className="text-center text-sm">予定されているアクションはありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockUpcomingActions.map((action, index) => (
                  <div
                    key={action.id}
                    className={`border-l-4 py-3 px-4 transition-all ${
                      index === 0 ? "border-l-blue-500" : 
                      index === 1 ? "border-l-yellow-500" : 
                      index === 2 ? "border-l-orange-500" : "border-l-green-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-[14px] text-gray-900 mb-1">
                          {action.companyName}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {action.action}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-xs">
                            書類選考中
                          </span>
                          <span>
                            {action.dueDate}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link 
                href="/dashboard/applications" 
                className="text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
              >
                すべて見る
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">今後の面接</h2>
              <span className="text-xs text-gray-500">
                スケジュール管理
              </span>
            </div>
            <div className="space-y-4">
              {/* Mock interview schedule */}
              <div className="py-3">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-center min-w-[56px]">
                    <div className="text-xs font-medium">10月</div>
                    <div className="text-2xl font-bold">14</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px] text-gray-900 mb-1">
                      テックイノベーション株式会社
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      一次面接
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📍</span>
                      <span>14:00 - オンライン</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="py-3">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-center min-w-[56px]">
                    <div className="text-xs font-medium">10月</div>
                    <div className="text-2xl font-bold">15</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px] text-gray-900 mb-1">
                      株式会社デジタルフューチャー
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      二次面接
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📍</span>
                      <span>10:30 - 渋谷オフィス</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                カレンダーを見る
              </button>
            </div>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">転職活動の進捗</h2>
            <span className="text-xs text-gray-500">今月の目標達成状況</span>
          </div>
          
          <div className="space-y-4">
            {/* Progress Bar 1 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">応募数 (目標: 20社)</span>
                <span className="text-sm font-bold text-gray-900">12 / 20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-900 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            {/* Progress Bar 2 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">面接数 (目標: 10回)</span>
                <span className="text-sm font-bold text-gray-900">7 / 10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-900 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            {/* Progress Bar 3 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">企業リサーチ (目標: 30社)</span>
                <span className="text-sm font-bold text-gray-900">24 / 30</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-900 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
