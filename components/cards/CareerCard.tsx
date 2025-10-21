"use client";

import { useState, useEffect } from "react";
import type { Career, EmploymentStatus, EmploymentType, SalaryChange, SalaryComponent, Currency, OfferSalary } from "@/types/career";
import { Calendar, Briefcase, TrendingUp, FileText, Edit2, Tag, ChevronDown, ChevronUp, History } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatSalaryFull, formatSalaryCompact, CURRENCY_CONFIG } from "@/libs/currency";

interface CareerCardProps {
  career: Career;
  onEdit: (career: Career) => void;
}

const employmentStatusLabels: Record<EmploymentStatus, string> = {
  current: "現職",
  left: "退職",
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

const CareerCard = ({ career, onEdit }: CareerCardProps) => {
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

  // Prepare pie chart data for MUI X Charts
  const pieChartData = latestSalary?.salaryBreakdown.map((item, index) => ({
    id: index,
    label: item.salaryType,
    salaryType: item.salaryType,
    value: item.salary,
  })) || [];

  // Colors for pie chart - matching the reference image
  const COLORS = ['#5b8ff9', '#5ad8a6', '#5d7092', '#f6bd16', '#e86452', '#6dc8ec', '#945fb9', '#ff9845'];

  return (
    <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm">
      {/* Main Content - Left Right Layout (4:6) */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Current Salary (40%) */}
        {latestSalary && (
          <div className="flex flex-col lg:w-[40%] w-full order-2 lg:order-1">
              {/* Salary Header */}
              <div className="pb-3 border-b border-base-300">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <span className="font-semibold text-base-content">
                      {career.status === "current" ? "現在の給与" : "給与"}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-success block">
                  {formatSalaryChange(latestSalary)}
                </span>
                
                </div>
                
              </div>
            
            {/* Position and Notes */}
            {(latestSalary.position || latestSalary.notes) && (
              <div className="space-y-1 pt-2">
                {latestSalary.position && (
                  <div className="text-sm text-base-content/70">
                    {latestSalary.position}
                  </div>
                )}
                {latestSalary.notes && (
                  <div className="text-xs text-base-content/60 italic">
                    {latestSalary.notes}
                  </div>
                )}
              </div>
            )}

            {/* Pie Chart - 佔據主要空間 */}
            {mounted && pieChartData.length > 0 && (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={280} height={280}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={1}
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
                              {formatSalaryCompact(value, latestSalary.currency)}
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
              <div className="flex items-center justify-center py-4">
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              </div>
            )}

            {/* Salary Breakdown - 在圓餅圖下方 */}
            <div className="space-y-1.5 pt-2">
              {latestSalary.salaryBreakdown.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm rounded transition-all cursor-default"
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

            {/* Salary History Toggle */}
            {career.salaryHistory && career.salaryHistory.length > 1 && (
              <div className="pt-4 mt-4 border-t border-base-300">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <History className="w-4 h-4" />
                  <span>給与履歴を見る ({career.salaryHistory.length}回)</span>
                  {showHistory ? (
                    <ChevronUp className="w-4 h-4 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  )}
                </button>

                {/* Salary History Timeline */}
                {showHistory && (
                  <div className="mt-4 space-y-3">
                    {career.salaryHistory.map((change, idx) => {
                      const isLatest = idx === career.salaryHistory.length - 1;
                      const isCurrentJob = career.status === "current";
                      const shouldShowCurrent = isLatest && isCurrentJob;
                      return (
                        <div key={idx} className="flex gap-3 text-xs">
                          <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${shouldShowCurrent ? 'bg-success' : 'bg-base-content/30'}`} />
                            {idx < career.salaryHistory!.length - 1 && (
                              <div className="w-px h-full bg-base-content/20 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-base-content">
                                  {shouldShowCurrent ? "現在の給与" : "給与"}
                                </span>
                                <span className="text-base-content/80">
                                  {formatSalaryChange(change)}
                                </span>
                                {shouldShowCurrent && (
                                  <span className="badge badge-success badge-xs">現在</span>
                                )}
                              </div>
                              <span className="text-base-content/60 text-xs">
                                {change.yearMonth}
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
          </div>
        )}
        
        {/* Right Side - Basic Info (60%) */}
        <div className="lg:w-[60%] space-y-3 order-1 lg:order-2">
          {/* Company Name and Position */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-base-content">{career.companyName}</h3>
              <span
                className={`badge badge-sm ${
                  isCurrent ? "badge-success" : "badge-ghost"
                }`}
              >
                {employmentStatusLabels[career.status]}
              </span>
              <button
                onClick={() => onEdit(career)}
                className="btn btn-ghost btn-sm btn-circle ml-auto"
                aria-label="編集"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-base text-base-content/80 font-medium">{career.position}</p>
          </div>
        {/* Date Range */}
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-base-content/60 mt-0.5 shrink-0" />
          <span className="text-sm text-base-content/70">
            {formatDateRange(career.startDate, career.endDate)}
          </span>
        </div>

        {/* Employment Type */}
        <div className="flex items-start gap-2">
          <Briefcase className="w-4 h-4 text-base-content/60 mt-0.5 shrink-0" />
          <span className="text-sm text-base-content/70">
            {employmentTypeLabels[career.employmentType]}
          </span>
        </div>

        {/* Offer Salary */}
        {career.offerSalary && (
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-base-content/60 mt-0.5 shrink-0" />
            <div className="text-sm text-base-content/70">
              <div className="flex items-center gap-2">
                <span className="font-medium">応募時オファー給与:</span>
                <span className="text-base-content">{formatOfferSalary(career.offerSalary)}</span>
              </div>
              {career.offerSalary.notes && (
                <div className="text-xs text-base-content/60 mt-1">
                  {career.offerSalary.notes}
                </div>
              )}
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
            <p className="text-sm text-base-content/70 line-clamp-2">{career.notes}</p>
          </div>
        )}

        {/* Offer Document */}
        {career.offerDocumentUrl && (
          <div className="pt-2 border-t border-base-300">
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
      </div>
    </div>
  );
};

export default CareerCard;

