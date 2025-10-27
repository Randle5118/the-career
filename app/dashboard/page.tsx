"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { useApplications } from "@/libs/hooks/useApplications";
import { Calendar, TrendingUp, Briefcase, Award, FileText, Users, BarChart, Kanban, Building2, DollarSign } from "lucide-react";
import { MOCK_CAREERS_FULL } from "@/libs/mock-data/careers";
import { MOCK_SIDE_JOBS } from "@/libs/mock-data/side-jobs";
import type { Career } from "@/types/career";

const STATUS_LABELS: Record<string, string> = {
  bookmarked: "ブックマーク",
  applied: "応募済み",
  interview: "面接中",
  offer: "オファー",
  rejected: "不採用",
  withdrawn: "辞退",
};

export default function DashboardPage() {
  const { applications } = useApplications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 取得 Career 資料
  const careers = useMemo(() => MOCK_CAREERS_FULL.filter((c: Career) => c.employmentType === "full_time"), []);
  const sideJobs = useMemo(() => MOCK_SIDE_JOBS, []);
  const currentCareer = careers.find((c: Career) => c.status === "current");
  
  // Career 統計
  const careerStats = useMemo(() => {
    // 當前薪資 (salary 單位是萬円,需要除以100)
    const latestSalary = currentCareer?.salaryHistory?.[currentCareer.salaryHistory.length - 1];
    const currentSalary = latestSalary?.salaryBreakdown?.reduce((sum: number, item: any) => sum + (item.salary || 0), 0) / 100 || 0;
    
    // 副業收入
    const sideJobIncome = sideJobs
      .filter(job => job.status === "current")
      .reduce((total, job) => {
        const lastSalary = job.salaryHistory?.[job.salaryHistory.length - 1];
        return total + (lastSalary?.salaryBreakdown?.reduce((sum, item) => sum + (item.salary || 0), 0) / 100 || 0);
      }, 0);
    
    // 總年收
    const totalIncome = currentSalary + sideJobIncome;
    
    // 職涯年數 (當前公司)
    const careerYears = currentCareer?.startDate 
      ? Math.floor((new Date().getTime() - new Date(currentCareer.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000) * 10) / 10
      : 0;
    
    return {
      currentSalary,
      sideJobIncome,
      totalIncome,
      careerYears,
      totalCareers: careers.length,
      currentSideJobs: sideJobs.filter(j => j.status === "current").length,
    };
  }, [currentCareer, careers, sideJobs]);

  // 計算應募統計資訊
  const stats = useMemo(() => {
    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 計算平均薪資
    const salaries = applications
      .filter(app => app.postedSalary?.minAnnualSalary)
      .map(app => ({
        min: app.postedSalary!.minAnnualSalary!,
        max: app.postedSalary!.maxAnnualSalary || app.postedSalary!.minAnnualSalary!
      }));
    
    const avgMinSalary = salaries.length > 0
      ? Math.round(salaries.reduce((sum, s) => sum + s.min, 0) / salaries.length)
      : 0;
    
    const avgMaxSalary = salaries.length > 0
      ? Math.round(salaries.reduce((sum, s) => sum + s.max, 0) / salaries.length)
      : 0;

    return {
      total: applications.length,
      bookmarked: byStatus.bookmarked || 0,
      applied: byStatus.applied || 0,
      interview: byStatus.interview || 0,
      offer: byStatus.offer || 0,
      avgMinSalary,
      avgMaxSalary,
    };
  }, [applications]);

  // 最近的應募 (按更新時間排序,取前 3 筆)
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [applications]);

  // 即將到來的面試
  const upcomingInterviews = useMemo(() => {
    return applications
      .filter(app => app.schedule?.deadline)
      .sort((a, b) => {
        const dateA = new Date(a.schedule!.deadline!).getTime();
        const dateB = new Date(b.schedule!.deadline!).getTime();
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [applications]);

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8 md:p-8 max-w-7xl bg-white">
        {/* Welcome Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <div>
            <Heading>ダッシュボード</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              転職活動と職涯の状況を一目で確認できます
            </p>
          </div>
          <Link href="/dashboard/applications" className="btn btn-primary">
            <Briefcase className="w-4 h-4" />
            新しい応募を追加
          </Link>
        </div>

        {/* Career Overview - 職涯狀態 */}
        {currentCareer && (
          <div className="bg-base-100 border border-base-300 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-base-content/40" />
                <div>
                  <h2 className="text-xl font-bold text-base-content">{currentCareer.companyName}</h2>
                  <p className="text-sm text-base-content/70">{currentCareer.position}</p>
                </div>
              </div>
              <Link href="/dashboard/my-career" className="text-sm text-base-content/60 hover:text-primary transition-colors">
                詳細を見る →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-base-50 border border-base-200 rounded-lg p-4">
                <div className="text-xs text-base-content/60 mb-1">現在の年収</div>
                <div className="text-2xl font-bold text-base-content">{Math.round(careerStats.currentSalary)}万円</div>
              </div>
              
              {careerStats.sideJobIncome > 0 && (
                <div className="bg-base-50 border border-base-200 rounded-lg p-4">
                  <div className="text-xs text-base-content/60 mb-1">副業収入</div>
                  <div className="text-2xl font-bold text-base-content">+{Math.round(careerStats.sideJobIncome)}万円</div>
                </div>
              )}
              
              <div className="bg-base-50 border border-base-200 rounded-lg p-4">
                <div className="text-xs text-base-content/60 mb-1">総年収</div>
                <div className="text-2xl font-bold text-primary">{Math.round(careerStats.totalIncome)}万円</div>
              </div>
              
              <div className="bg-base-50 border border-base-200 rounded-lg p-4">
                <div className="text-xs text-base-content/60 mb-1">在籍期間</div>
                <div className="text-2xl font-bold text-base-content">{careerStats.careerYears}年</div>
              </div>
            </div>
            
            {/* 簡單的薪資比較圖表 */}
            {mounted && careerStats.currentSalary > 0 && (
              <div className="mt-4 bg-base-50 border border-base-200 rounded-lg p-4">
                <div className="text-xs text-base-content/60 mb-3">年収内訳</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-base-content/70">本業</span>
                      <span className="text-sm font-semibold">{Math.round(careerStats.currentSalary)}万円</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-2">
                      <div 
                        className="bg-base-content/80 h-2 rounded-full transition-all" 
                        style={{ width: `${(careerStats.currentSalary / careerStats.totalIncome) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {careerStats.sideJobIncome > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-base-content/70">副業</span>
                        <span className="text-sm font-semibold">{Math.round(careerStats.sideJobIncome)}万円</span>
                      </div>
                      <div className="w-full bg-base-200 rounded-full h-2">
                        <div 
                          className="bg-base-content/40 h-2 rounded-full transition-all" 
                          style={{ width: `${(careerStats.sideJobIncome / careerStats.totalIncome) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {careerStats.currentSideJobs > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-base-content/70">
                <Users className="w-4 h-4" />
                <span>副業: {careerStats.currentSideJobs}件</span>
                <Link href="/dashboard/side-jobs" className="text-primary hover:underline ml-2">
                  副業を見る →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Job Search Statistics - 找工作狀態 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">転職活動の状況</h3>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Total Applications */}
          <div className="bg-white border border-base-300 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-base-content/70">総応募数</h2>
              <Briefcase className="w-6 h-6 text-base-content/20" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-base-content">
                {stats.total}
              </p>
              <span className="text-sm text-base-content/50">社</span>
            </div>
            <div className="mt-2 text-xs text-base-content/50">
              ブックマーク: {stats.bookmarked}件
            </div>
          </div>

          {/* Applied */}
          <div className="bg-white border border-base-300 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-base-content/70">応募済み</h2>
              <TrendingUp className="w-6 h-6 text-base-content/20" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-base-content">
                {stats.applied}
              </p>
              <span className="text-sm text-base-content/50">社</span>
            </div>
            <div className="mt-2 text-xs text-base-content/50">
              書類選考中
            </div>
          </div>

          {/* Interviews */}
          <div className="bg-white border border-base-300 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-base-content/70">面接進行中</h2>
              <Calendar className="w-6 h-6 text-base-content/20" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-base-content">
                {stats.interview}
              </p>
              <span className="text-sm text-base-content/50">社</span>
            </div>
            <div className="mt-2 text-xs text-base-content/50">
              {upcomingInterviews.length > 0 ? `次回: ${upcomingInterviews[0].schedule?.nextEvent}` : '予定なし'}
            </div>
          </div>

          {/* Offers */}
          <div className="bg-white border border-base-300 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-base-content/70">オファー獲得</h2>
              <Award className="w-6 h-6 text-base-content/20" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-primary">
                {stats.offer}
              </p>
              <span className="text-sm text-base-content/50">社</span>
            </div>
            <div className="mt-2 text-xs text-base-content/50">
              {stats.avgMinSalary > 0 ? `平均: ${stats.avgMinSalary}-${stats.avgMaxSalary}万円` : '薪資情報なし'}
            </div>
          </div>
        </div>

        {/* 応募進捗の視覺化 */}
        {mounted && stats.total > 0 && (
          <div className="bg-white border border-base-300 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-base-content mb-4">応募ステータス割合</h3>
            <div className="space-y-3">
              {/* Bookmarked */}
              {stats.bookmarked > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-base-content/70">ブックマーク</span>
                    <span className="text-sm font-semibold">{stats.bookmarked}社 ({Math.round((stats.bookmarked / stats.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-base-400 h-2 rounded-full transition-all" 
                      style={{ width: `${(stats.bookmarked / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Applied */}
              {stats.applied > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-base-content/70">書類選考中</span>
                    <span className="text-sm font-semibold text-info">{stats.applied}社 ({Math.round((stats.applied / stats.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-info h-2 rounded-full transition-all" 
                      style={{ width: `${(stats.applied / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Interview */}
              {stats.interview > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-base-content/70">面接進行中</span>
                    <span className="text-sm font-semibold text-warning">{stats.interview}社 ({Math.round((stats.interview / stats.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full transition-all" 
                      style={{ width: `${(stats.interview / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Offer */}
              {stats.offer > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-base-content/70">オファー獲得</span>
                    <span className="text-sm font-semibold text-success">{stats.offer}社 ({Math.round((stats.offer / stats.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all" 
                      style={{ width: `${(stats.offer / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Applications */}
          <div className="bg-white border border-base-300 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-base-content">最近の応募</h2>
              <span className="text-xs text-base-content/50">
                直近の更新
              </span>
            </div>
            {recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
                <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-center text-sm">まだ応募がありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app, index) => {
                  const statusColors: Record<string, string> = {
                    bookmarked: "border-l-base-300",
                    applied: "border-l-info",
                    interview: "border-l-warning",
                    offer: "border-l-success",
                    rejected: "border-l-error",
                    withdrawn: "border-l-base-300",
                  };
                  const statusLabels: Record<string, string> = {
                    bookmarked: "ブックマーク",
                    applied: "応募済み",
                    interview: "面接中",
                    offer: "内定",
                    rejected: "不採用",
                    withdrawn: "辞退",
                  };
                  
                  return (
                    <Link
                      key={app.id}
                      href="/dashboard/applications"
                      className={`block border-l-4 py-3 px-4 bg-base-50 hover:bg-base-100 transition-all ${
                        statusColors[app.status] || "border-l-base-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-base-content mb-1 truncate">
                            {app.companyName}
                          </div>
                          <div className="text-sm text-base-content/70 mb-2 truncate">
                            {app.position}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-base-content/50">
                            <span className={`badge badge-xs ${
                              app.status === "offer" ? "badge-success" :
                              app.status === "interview" ? "badge-warning" :
                              app.status === "applied" ? "badge-info" : "badge-ghost"
                            }`}>
                              {statusLabels[app.status] || app.status}
                            </span>
                            {app.postedSalary?.minAnnualSalary && (
                              <span>
                                {app.postedSalary.minAnnualSalary}
                                {app.postedSalary.maxAnnualSalary && `-${app.postedSalary.maxAnnualSalary}`}
                                万円
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-base-content/30">→</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="mt-6 text-center">
              <Link 
                href="/dashboard/applications" 
                className="text-sm text-base-content/60 hover:text-primary font-medium inline-flex items-center gap-1 transition-colors"
              >
                すべての応募を見る
                <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white border border-base-300 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-base-content">今後の面接</h2>
              <span className="text-xs text-base-content/50">
                スケジュール
              </span>
            </div>
            {upcomingInterviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-center text-sm">予定されている面接はありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingInterviews.map((app) => {
                  const deadline = app.schedule?.deadline;
                  const date = deadline ? new Date(deadline) : null;
                  
                  return (
                    <Link
                      key={app.id}
                      href="/dashboard/statuses"
                      className="block py-3 hover:bg-base-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {date && (
                          <div className="bg-primary text-primary-content rounded-lg px-3 py-2 text-center min-w-[56px]">
                            <div className="text-xs font-medium">
                              {date.toLocaleString("ja-JP", { month: "short" })}
                            </div>
                            <div className="text-2xl font-bold">
                              {date.getDate()}
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-base-content mb-1 truncate">
                            {app.companyName}
                          </div>
                          <div className="text-sm text-base-content/70 mb-2">
                            {app.schedule?.nextEvent || "面接"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-base-content/50">
                            {app.schedule?.interviewMethod?.type === "online" ? (
                              <>
                                <span>💻</span>
                                <span>オンライン面接</span>
                              </>
                            ) : (
                              <>
                                <span>🏢</span>
                                <span>対面面接</span>
                              </>
                            )}
                            {date && (
                              <span>
                                {date.toLocaleString("ja-JP", { 
                                  hour: "2-digit", 
                                  minute: "2-digit"
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="mt-6 text-center">
              <Link 
                href="/dashboard/statuses"
                className="text-sm text-base-content/60 hover:text-primary font-medium inline-flex items-center gap-1 transition-colors"
              >
                カレンダーを見る
                <Calendar className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-base-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-base-content mb-4">クイックアクション</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/applications"
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-base-100 rounded-lg border border-base-300 hover:border-primary transition-all group"
            >
              <FileText className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-center">新規応募追加</span>
            </Link>
            
            <Link
              href="/dashboard/statuses"
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-base-100 rounded-lg border border-base-300 hover:border-warning transition-all group"
            >
              <Kanban className="w-6 h-6 text-warning group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-center">ステータス管理</span>
            </Link>
            
            <Link
              href="/dashboard/my-career"
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-base-100 rounded-lg border border-base-300 hover:border-secondary transition-all group"
            >
              <Users className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-center">MyCareer</span>
            </Link>
            
            <Link
              href="/dashboard/compare"
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-base-100 rounded-lg border border-base-300 hover:border-success transition-all group"
            >
              <BarChart className="w-6 h-6 text-success group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-center">企業比較</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
