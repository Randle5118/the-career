"use client";

import { useState, useEffect } from "react";
import type { Career, EmploymentStatus, EmploymentType, SalaryChange, SalaryComponent, Currency, OfferSalary } from "@/types/career";
import { Calendar, Briefcase, TrendingUp, FileText, Edit2, Tag, ChevronDown, ChevronUp, History, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatSalaryFull, formatSalaryCompact, CURRENCY_CONFIG } from "@/libs/currency";

interface SideJobCardProps {
  career: Career;
  onEdit: (career: Career) => void;
}

const employmentStatusLabels: Record<EmploymentStatus, string> = {
  current: "進行中",
  left: "終了",
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: "正社員",
  contract: "契約社員",
  temporary: "派遣社員",
  part_time: "パート・アルバイト",
  freelance: "フリーランス",
  side_job: "副業",
  dispatch: "派遣", // 保留向後相容性
};

const formatOfferSalary = (offerSalary: OfferSalary): string => {
  if (!offerSalary || !offerSalary.salaryBreakdown || !offerSalary.currency) {
    return "0万円";
  }
  
  const total = offerSalary.salaryBreakdown.reduce((sum: number, item: SalaryComponent) => sum + item.salary, 0);
  return formatSalaryFull(total, offerSalary.currency);
};

const formatDateRange = (startDate: string, endDate?: string): string => {
  // 處理 YYYYMM 或 YYYY-MM 格式
  const formatDate = (dateStr: string) => {
    if (dateStr.match(/^\d{6}$/)) {
      // YYYYMM 格式
      const year = dateStr.substring(0, 4);
      const month = parseInt(dateStr.substring(4, 6));
      return `${year}年${month}月`;
    } else if (dateStr.match(/^\d{4}-\d{2}$/)) {
      // YYYY-MM 格式
      const [year, month] = dateStr.split('-');
      return `${year}年${parseInt(month)}月`;
    }
    return dateStr;
  };
  
  const startStr = formatDate(startDate);
  
  if (!endDate) {
    return `${startStr} 〜 現在`;
  }
  
  const endStr = formatDate(endDate);
  
  // Calculate duration
  const getYearMonth = (dateStr: string) => {
    if (dateStr.match(/^\d{6}$/)) {
      return {
        year: parseInt(dateStr.substring(0, 4)),
        month: parseInt(dateStr.substring(4, 6))
      };
    } else if (dateStr.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = dateStr.split('-');
      return {
        year: parseInt(year),
        month: parseInt(month)
      };
    }
    return { year: 0, month: 0 };
  };
  
  const start = getYearMonth(startDate);
  const end = getYearMonth(endDate);
  const diffMonths = (end.year - start.year) * 12 + (end.month - start.month);
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  
  let duration = "";
  if (years > 0) duration += `${years}年`;
  if (months > 0) duration += `${months}ヶ月`;
  
  return `${startStr} 〜 ${endStr} (${duration})`;
};

const formatSalaryChange = (change: SalaryChange): string => {
  if (!change || !change.salaryBreakdown || !change.currency) {
    return "0万円";
  }
  
  const total = change.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0);
  return formatSalaryFull(total, change.currency);
};

const formatYearMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split("-");
  return `${year}年${parseInt(month)}月`;
};

const SideJobCard = ({ career, onEdit }: SideJobCardProps) => {
  const isCurrent = career.status === "current";
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure chart only renders on client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get latest salary from history (separate from offer)
  const latestSalary = career.salaryHistory && career.salaryHistory.length > 0
    ? career.salaryHistory[career.salaryHistory.length - 1]
    : null;

  // Sort salary history by date (newest first for display)
  const sortedHistory = career.salaryHistory 
    ? [...career.salaryHistory].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
    : [];

  // Prepare pie chart data for earnings breakdown
  const pieChartData = latestSalary?.salaryBreakdown.map((item, index) => ({
    id: index,
    label: item.salaryType,
    salaryType: item.salaryType,
    value: item.salary,
  })) || [];

  // Colors for pie chart - more vibrant for side jobs
  const COLORS = ['#5b8ff9', '#5ad8a6', '#f6bd16', '#e86452', '#6dc8ec', '#945fb9', '#ff9845', '#8b5cf6'];

  // Calculate total earnings
  const totalEarnings = latestSalary?.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0) || 0;

  return (
    <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm">
      {/* Header with Company and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-base-content">{career.companyName}</h3>
            <p className="text-sm text-base-content/70">{career.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`badge badge-sm ${
              isCurrent ? "badge-success" : "badge-ghost"
            }`}
          >
            {employmentStatusLabels[career.status]}
          </span>
          <button
            onClick={() => onEdit(career)}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Earnings Information */}
        <div className="space-y-4">
          {/* Total Earnings Display */}
          {latestSalary && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-base-content/60 mb-1">副業収入</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatSalaryChange(latestSalary)}
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              {latestSalary.notes && (
                <div className="text-xs text-base-content/60 mt-2 italic">
                  {latestSalary.notes}
                </div>
              )}
            </div>
          )}

          {/* Earnings Breakdown */}
          {latestSalary && latestSalary.salaryBreakdown.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-base-content/80">収入内訳</h4>
              <div className="space-y-1.5">
                {latestSalary.salaryBreakdown.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between text-sm p-2 rounded transition-all cursor-default"
                    style={{
                      backgroundColor: hoveredIndex === index ? 'oklch(var(--bc) / 0.08)' : 'transparent',
                      fontWeight: hoveredIndex === index ? 600 : 400,
                      opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: COLORS[index % COLORS.length],
                          opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
                        }}
                      />
                      <span className="text-base-content/80">{item.salaryType}</span>
                    </div>
                    <span className="font-medium text-base-content">
                      {formatSalaryCompact(item.salary, latestSalary.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employment Type */}
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-base-content/60" />
            <span className="text-sm text-base-content/70">
              {employmentTypeLabels[career.employmentType]}
            </span>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-base-content/60" />
            <span className="text-sm text-base-content/70">
              {formatDateRange(career.startDate, career.endDate)}
            </span>
          </div>
        </div>

        {/* Right Column - Chart and Additional Info */}
        <div className="space-y-4">
          {/* Pie Chart for Earnings Breakdown */}
          {mounted && pieChartData.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-base-200">
              <div className="text-center mb-3">
                <h4 className="text-sm font-semibold text-base-content/80">収入構成</h4>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                    onMouseEnter={(_, index) => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke={hoveredIndex === index ? COLORS[index % COLORS.length] : 'transparent'}
                        strokeWidth={hoveredIndex === index ? 2 : 0}
                        opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const data = props.payload;
                      return [
                        <div key="tooltip" className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                          <div className="text-sm text-gray-600 font-medium">
                            {data.salaryType}
                          </div>
                          <div className="font-bold text-primary text-base">
                            {formatSalaryCompact(value, latestSalary?.currency || 'JPY')}
                          </div>
                        </div>
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Loading placeholder when not mounted */}
          {!mounted && pieChartData.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-base-200">
              <div className="flex items-center justify-center h-48">
                <div className="loading loading-spinner loading-lg text-primary"></div>
              </div>
            </div>
          )}

          {/* Tags */}
          {career.tags && career.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-base-content/60 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {career.tags.map((tag, index) => (
                  <span key={index} className="badge badge-sm badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {career.notes && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-base-content/60 mt-0.5 shrink-0" />
              <p className="text-sm text-base-content/70 line-clamp-3">{career.notes}</p>
            </div>
          )}

          {/* Offer Salary */}
          {career.offerSalary && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">オファー給与</span>
              </div>
              <div className="text-sm text-base-content/80">
                {formatOfferSalary(career.offerSalary)}
              </div>
              {career.offerSalary.notes && (
                <div className="text-xs text-base-content/60 mt-1">
                  {career.offerSalary.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Salary History Toggle */}
      {career.salaryHistory && career.salaryHistory.length > 1 && (
        <div className="mt-6 pt-4 border-t border-base-300">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <History className="w-4 h-4" />
            <span>収入履歴を見る ({career.salaryHistory.length}回)</span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-auto" />
            )}
          </button>

          {/* Salary History Timeline */}
          {showHistory && (
            <div className="mt-4 space-y-3">
              {sortedHistory.map((change, idx) => {
                const isLatest = idx === 0; // Newest first
                const isCurrentJob = career.status === "current";
                const shouldShowCurrent = isLatest && isCurrentJob;
                return (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${shouldShowCurrent ? 'bg-success' : 'bg-base-content/30'}`} />
                      {idx < sortedHistory.length - 1 && (
                        <div className="w-px h-full bg-base-content/20 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base-content">
                            {shouldShowCurrent ? "現在の収入" : "収入"}
                          </span>
                          <span className="text-base-content/80">
                            {formatSalaryChange(change)}
                          </span>
                          {shouldShowCurrent && (
                            <span className="badge badge-success badge-xs">現在</span>
                          )}
                        </div>
                        <span className="text-base-content/60 text-xs">
                          {formatYearMonth(change.yearMonth)}
                        </span>
                      </div>
                      {change.position && (
                        <div className="text-base-content/70 mb-0.5">
                          {change.position}
                        </div>
                      )}
                      {change.notes && (
                        <div className="text-base-content/60 italic">
                          {change.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Offer Document */}
      {career.offerDocumentUrl && (
        <div className="mt-4 pt-4 border-t border-base-300">
          <a
            href={career.offerDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            オファーレターを表示
          </a>
        </div>
      )}
    </div>
  );
};

export default SideJobCard;
