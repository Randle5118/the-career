"use client";

import { useState, useMemo, useEffect, useId } from "react";
import type { Career, CareerFormData, OfferSalary, SalaryChange } from "@/types/career";
import CareerCard from "@/components/cards/CareerCard";
import CareerModal from "@/components/modals/CareerModal";
import { toast } from "react-hot-toast";
import { Briefcase } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from "recharts";
import { formatSalaryCompact } from "@/libs/currency";
import { getMockCareers } from "@/libs/mock-data";
import { Heading } from "@/components/catalyst/heading";

// 使用統一的 mock 數據
const mockCareers = getMockCareers();

// Check for timeline overlaps and inconsistencies
const checkTimelineIssues = (careers: Career[]) => {
  const issues: string[] = [];
  
  // Use a fixed date to avoid hydration mismatch
  const currentDate = new Date("2024-12-01");
  
  // Sort careers by start date
  const sortedCareers = [...careers].sort((a, b) => 
    new Date(a.startDate + "-01").getTime() - new Date(b.startDate + "-01").getTime()
  );
  
  // Check for overlaps (only within same employment type)
  for (let i = 0; i < sortedCareers.length - 1; i++) {
    const current = sortedCareers[i];
    const next = sortedCareers[i + 1];
    
    // Only check overlaps for same employment type (正職不能重疊，副業可以同時進行)
    if (current.employmentType === 'full_time' && next.employmentType === 'full_time') {
      const currentEnd = current.endDate ? new Date(current.endDate + "-01") : currentDate;
      const nextStart = new Date(next.startDate + "-01");
      
      // Check if current job ends after next job starts (overlap)
      if (currentEnd > nextStart) {
        issues.push(`⚠️ 正職時間重疊: ${current.companyName} (${current.startDate} - ${current.endDate || '現在'}) 與 ${next.companyName} (${next.startDate} - ${next.endDate || '現在'}) 重疊`);
      }
      
      // Check if there's a gap less than 1 month (might be unrealistic)
      const gapDays = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24);
      if (gapDays > 0 && gapDays < 30) {
        issues.push(`⚠️ 短暫間隔: ${current.companyName} 結束後 ${Math.round(gapDays)} 天就開始 ${next.companyName} 工作`);
      }
    }
  }
  
  // Check for multiple current full-time jobs (副業可以同時進行)
  const currentFullTimeJobs = careers.filter(c => c.status === 'current' && c.employmentType === 'full_time');
  if (currentFullTimeJobs.length > 1) {
    issues.push(`⚠️ 多個正職現職: 發現 ${currentFullTimeJobs.length} 個標記為「現職」的正職工作: ${currentFullTimeJobs.map(c => c.companyName).join(', ')}`);
  }
  
  // Check for future start dates
  const futureJobs = careers.filter(c => new Date(c.startDate + "-01") > currentDate);
  if (futureJobs.length > 0) {
    issues.push(`⚠️ 未來開始日期: ${futureJobs.map(c => `${c.companyName} (${c.startDate})`).join(', ')}`);
  }
  
  return issues;
};

export default function MyCareerPage() {
  const [careers, setCareers] = useState<Career[]>(mockCareers);
  const [mounted, setMounted] = useState(false);
  const baseId = useId();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingCareerId, setEditingCareerId] = useState<string | null>(null);
  
  // Chart selection state
  const [selectedChart, setSelectedChart] = useState<'companies' | 'years' | 'growth'>('growth');

  // Ensure chart only renders on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for timeline issues
  const timelineIssues = useMemo(() => {
    return checkTimelineIssues(careers);
  }, [careers]);

  // Filter only full-time careers
  const fullTimeCareers = useMemo(() => {
    return careers.filter(career => career.employmentType === "full_time");
  }, [careers]);

  // Salary trend data for simplified chart
  const salaryTrendData = useMemo(() => {
    // Collect all salary changes with total and base salary
    const allChanges: Array<{
      date: string;
      totalSalary: number;
      baseSalary: number;
      company: string;
      position: string;
      currency: string;
    }> = [];

    fullTimeCareers.forEach((career) => {
      if (career.salaryHistory && career.salaryHistory.length > 0) {
        career.salaryHistory.forEach((change) => {
          const [year, month] = change.yearMonth.split("-");
          const totalSalary = change.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0);
          const baseSalary = change.salaryBreakdown.find(item => item.salaryType === "基本給")?.salary || 0;

          allChanges.push({
            date: `${year}/${month}`,
            totalSalary,
            baseSalary,
            company: career.companyName,
            position: change.position || career.position,
            currency: change.currency,
          });
        });
      }
    });

    // Sort by date
    allChanges.sort((a, b) => a.date.localeCompare(b.date));

    return allChanges;
  }, [fullTimeCareers]);

  // Statistics (only for full-time careers)
  const stats = useMemo(() => {
    const total = fullTimeCareers.length;
    const current = fullTimeCareers.filter((c) => c.status === "current").length;
    
    // Use a fixed date to avoid hydration mismatch
    const currentDate = new Date("2024-12-01");
    
    const totalYears = fullTimeCareers.reduce((acc, career) => {
      const start = new Date(career.startDate + "-01"); // Add day to make valid date
      const end = career.endDate ? new Date(career.endDate + "-01") : currentDate;
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return acc + months / 12;
    }, 0);
    
    // Calculate salary growth percentage
    let salaryGrowth = 0;
    if (salaryTrendData.length >= 2) {
      const firstSalary = salaryTrendData[0].totalSalary;
      const lastSalary = salaryTrendData[salaryTrendData.length - 1].totalSalary;
      salaryGrowth = Math.round(((lastSalary - firstSalary) / firstSalary) * 100);
    }

    // Calculate unique job types count
    const uniquePositions = new Set(fullTimeCareers.map(career => career.position));
    const jobTypeCount = uniquePositions.size;

    return { 
      total, 
      current, 
      totalYears: Math.round(totalYears * 10) / 10, 
      salaryGrowth,
      jobTypeCount 
    };
  }, [fullTimeCareers, salaryTrendData]);

  // Calculate smart Y-axis range
  const yAxisDomain = useMemo(() => {
    if (salaryTrendData.length === 0) return [0, 1000];
    
    const salaries = salaryTrendData.map(d => d.totalSalary);
    const minSalary = Math.min(...salaries);
    const maxSalary = Math.max(...salaries);
    
    // Convert to 万円 units and round to nearest 100万円
    const minInMan = Math.floor(minSalary / 100) * 100; // 下一個百萬單位
    const maxInMan = Math.ceil(maxSalary / 100) * 100;  // 上一個百萬單位
    
    // Ensure minimum range of 500万円
    const range = maxInMan - minInMan;
    if (range < 500) {
      const center = (minInMan + maxInMan) / 2;
      return [Math.max(0, center - 250), center + 250];
    }
    
    return [minInMan, maxInMan];
  }, [salaryTrendData]);

  // Chart data based on selection
  const chartConfig = useMemo(() => {
    const currentDate = new Date("2024-12-01");
    
    switch (selectedChart) {
      case 'companies':
        return {
          title: '職種別経験年数',
          description: '各職種での総経験年数を表示',
          type: 'bar' as const,
          data: (() => {
            // 統計各職種的工作時間
            const positionMap = new Map<string, number>();
            
            fullTimeCareers.forEach(career => {
              const start = new Date(career.startDate + "-01");
              const end = career.endDate ? new Date(career.endDate + "-01") : currentDate;
              const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
              
              const position = career.position;
              const currentMonths = positionMap.get(position) || 0;
              positionMap.set(position, currentMonths + months);
            });
            
            // 截斷過長的職種名稱
            const truncateName = (name: string, maxLength: number = 10) => {
              return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
            };
            
            return Array.from(positionMap.entries())
              .filter(([_, months]) => months > 0) // 過濾掉 0 或負數
              .map(([position, months]) => ({
                position,
                displayName: truncateName(position),
                months,
                years: Math.round(months / 12 * 10) / 10,
              }))
              .sort((a, b) => b.months - a.months); // 依時間長度排序
          })(),
          dataKey: 'months',
          xAxisKey: 'displayName',
          yAxisFormatter: (value: number) => `${Math.round(value / 12 * 10) / 10}年`,
          tooltipFormatter: (value: number) => `${Math.round(value / 12 * 10) / 10}年 (${value}ヶ月)`,
        };
      
      case 'years':
        return {
          title: '勤務先の分布',
          description: '各企業での在籍期間を表示',
          type: 'bar' as const,
          data: fullTimeCareers.map(career => {
            const start = new Date(career.startDate + "-01");
            const end = career.endDate ? new Date(career.endDate + "-01") : currentDate;
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            
            // 截斷過長的公司名稱
            const truncateName = (name: string, maxLength: number = 8) => {
              return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
            };
            
            return {
              name: career.companyName,
              displayName: truncateName(career.companyName),
              months: months,
              years: Math.round(months / 12 * 10) / 10,
            };
          }),
          dataKey: 'months',
          xAxisKey: 'displayName',
          yAxisFormatter: (value: number) => `${Math.round(value / 12 * 10) / 10}年`,
          tooltipFormatter: (value: number) => `${Math.round(value / 12 * 10) / 10}年 (${value}ヶ月)`,
        };
      
      case 'growth':
        return {
          title: '給与推移',
          description: '時系列での給与の変化を表示',
          type: 'line' as const,
          data: salaryTrendData,
          dataKey: 'totalSalary',
          xAxisKey: 'date',
          yAxisFormatter: (value: number) => formatSalaryCompact(value, 'JPY'),
          tooltipFormatter: (value: number) => formatSalaryCompact(value, 'JPY'),
        };
      
      default:
        return {
          title: '給与推移',
          description: '',
          type: 'line' as const,
          data: salaryTrendData,
          dataKey: 'totalSalary',
          xAxisKey: 'date',
          yAxisFormatter: (value: number) => formatSalaryCompact(value, 'JPY'),
          tooltipFormatter: (value: number) => formatSalaryCompact(value, 'JPY'),
        };
    }
  }, [selectedChart, salaryTrendData, fullTimeCareers]);

  // Sort careers by date (current jobs first, then by start date descending)
  const sortedCareers = useMemo(() => {
    return [...fullTimeCareers].sort((a, b) => {
      if (a.status === "current" && b.status !== "current") return -1;
      if (a.status !== "current" && b.status === "current") return 1;
      return new Date(b.startDate + "-01").getTime() - new Date(a.startDate + "-01").getTime();
    });
  }, [fullTimeCareers]);

  const handleAddNew = () => {
    setEditingCareer(null);
    setEditingCareerId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setEditingCareerId(career.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCareer(null);
    setEditingCareerId(null);
  };

  const handleCareerSave = (
    data: CareerFormData, 
    salaryHistory: SalaryChange[], 
    offerSalary?: OfferSalary
  ) => {
    try {
      if (editingCareerId) {
        // Update existing career
        const updatedCareers = careers.map(career => 
          career.id === editingCareerId 
            ? {
                ...career,
                ...data,
                tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags || [],
                salaryHistory,
                offerSalary,
                updatedAt: new Date().toISOString(),
              }
            : career
        );
        setCareers(updatedCareers);
        toast.success("職務経歴を更新しました");
      } else {
        // Add new career
        const newCareer: Career = {
          id: `career-${baseId}-${careers.length}`,
          ...data,
          tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags || [],
          salaryHistory,
          offerSalary,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCareers(prev => [...prev, newCareer]);
        toast.success("新しい職務経歴を追加しました");
      }
      
      handleModalClose();
    } catch (error) {
      console.error("保存エラー:", error);
      toast.error("保存に失敗しました");
    }
  };


  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8 md:px-8 max-w-5xl bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-4 dark:border-white/10">
          <div>
            <Heading>職務経歴</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              これまでのキャリアを記録・管理しましょう
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAddNew}>
            ＋ 職務経歴を追加
          </button>
        </div>

        {/* Timeline Issues Alert */}
        {timelineIssues.length > 0 && (
          <div className="mb-6 bg-warning/10 border border-warning/20 rounded-lg p-4">
            <h3 className="font-semibold text-warning mb-2">⚠️ 在籍期間のに重複があります</h3>
            <ul className="space-y-1 text-sm">
              {timelineIssues.map((issue, index) => (
                <li key={index} className="text-warning/80">• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      <div className="flex flex-col lg:flex-row gap-6 mb-4 lg:items-stretch">
        {/* Statistics */}
        <div className="flex flex-col lg:w-3/10 gap-4">
          {/* Salary Growth - First */}
          <button 
            onClick={() => setSelectedChart('growth')}
            className={`bg-base-100 border rounded-lg p-6 transition-all flex-1 flex items-center justify-between text-left ${
              selectedChart === 'growth' 
                ? 'border-primary shadow-md ring-2 ring-primary/20' 
                : 'border-base-300 hover:border-primary/40 hover:shadow-sm'
            }`}
          >
            <div className="text-sm text-base-content/60">給与変化比率</div>
            <div className={`text-3xl font-semibold ${stats.salaryGrowth >= 0 ? 'text-success' : 'text-error'}`}>
              {stats.salaryGrowth >= 0 ? '+' : ''}{stats.salaryGrowth}%
            </div>
          </button>

          {/* Total Years */}
          <button 
            onClick={() => setSelectedChart('years')}
            className={`bg-base-100 border rounded-lg p-6 transition-all flex-1 flex items-center justify-between text-left ${
              selectedChart === 'years' 
                ? 'border-primary shadow-md ring-2 ring-primary/20' 
                : 'border-base-300 hover:border-primary/40 hover:shadow-sm'
            }`}
          >
            <div className="text-sm text-base-content/60">総勤務年数</div>
            <div className="text-3xl font-semibold">{stats.totalYears}<span className="text-base-content/60 text-sm">年</span></div>
          </button>

          {/* Job Types */}
          <button 
            onClick={() => setSelectedChart('companies')}
            className={`bg-base-100 border rounded-lg p-6 transition-all flex-1 flex items-center justify-between text-left ${
              selectedChart === 'companies' 
                ? 'border-primary shadow-md ring-2 ring-primary/20' 
                : 'border-base-300 hover:border-primary/40 hover:shadow-sm'
            }`}
          >
            <div className="text-sm text-base-content/60">キャリア歴</div>
            <div className="text-3xl font-semibold">{stats.jobTypeCount}<span className="text-base-content/60 text-sm pl-1">種</span></div>
          </button>
        </div>

        {/* Dynamic Chart */}
        {mounted && (
          <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm lg:w-7/10 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-base-content">{chartConfig.title}</h3>
              {chartConfig.description && (
                <p className="text-sm text-base-content/60 mt-1">{chartConfig.description}</p>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full bg-white rounded-lg p-3 border border-base-200" style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartConfig.type === 'line' ? (
                    <LineChart
                      data={chartConfig.data}
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="2 4" 
                        stroke="oklch(var(--bc) / 0.12)" 
                        strokeWidth={1}
                        vertical={false}
                        horizontal={true}
                      />
                      <XAxis 
                        dataKey={chartConfig.xAxisKey}
                        tick={{ fill: 'oklch(var(--bc) / 0.7)', fontSize: 12, fontWeight: 500 }}
                        axisLine={{ stroke: 'oklch(var(--bc) / 0.25)', strokeWidth: 1 }}
                        tickMargin={15}
                        height={30}
                      />
                      <YAxis 
                        tick={{ fill: 'oklch(var(--bc) / 0.7)', fontSize: 12, fontWeight: 500 }}
                        stroke="oklch(var(--bc) / 0.25)"
                        tickFormatter={chartConfig.yAxisFormatter}
                        tickMargin={15}
                        width={60}
                        domain={selectedChart === 'growth' ? yAxisDomain : undefined}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                <div className="font-bold text-primary text-lg mb-1">
                                  {chartConfig.tooltipFormatter(payload[0].value as number)}
                                </div>
                                <div className="text-sm text-base-content/60 mb-1">
                                  {data[chartConfig.xAxisKey]}
                                </div>
                                {data.company && (
                                  <div className="text-sm text-base-content/80 mb-1 font-medium">
                                    {data.company}
                                  </div>
                                )}
                                {data.position && (
                                  <div className="text-xs text-base-content/70">
                                    {data.position}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={chartConfig.dataKey}
                        stroke="#5b8ff9"
                        strokeWidth={3}
                        dot={{ fill: '#5b8ff9', strokeWidth: 2, r: 5 }}
                        activeDot={{ 
                          r: 7, 
                          stroke: '#5b8ff9',
                          strokeWidth: 2, 
                          fill: '#fff'
                        }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart
                      data={chartConfig.data}
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="2 4" 
                        stroke="oklch(var(--bc) / 0.12)" 
                        strokeWidth={1}
                        vertical={false}
                        horizontal={true}
                      />
                      <XAxis 
                        dataKey={chartConfig.xAxisKey}
                        tick={{ fill: 'oklch(var(--bc) / 0.7)', fontSize: 12, fontWeight: 500 }}
                        axisLine={{ stroke: 'oklch(var(--bc) / 0.25)', strokeWidth: 1 }}
                        tickMargin={15}
                        height={30}
                        interval={0}
                      />
                      <YAxis 
                        tick={{ fill: 'oklch(var(--bc) / 0.7)', fontSize: 12, fontWeight: 500 }}
                        stroke="oklch(var(--bc) / 0.25)"
                        tickFormatter={chartConfig.yAxisFormatter}
                        tickMargin={15}
                        width={60}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                <div className="font-bold text-primary text-lg mb-1">
                                  {chartConfig.tooltipFormatter(payload[0].value as number)}
                                </div>
                                <div className="text-sm text-base-content/60 mb-1">
                                  {/* 顯示完整名稱,如果有的話 */}
                                  {data.name || data.position || data[chartConfig.xAxisKey]}
                                </div>
                                {data.companies && Array.isArray(data.companies) && (
                                  <div className="text-xs text-base-content/70 mt-1">
                                    {data.companies.join(', ')}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey={chartConfig.dataKey}
                        fill="#5b8ff9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>


        {/* Career Timeline */}
        {careers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-base-content/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              まだ職務経歴がありません
            </h3>
            <p className="text-base-content/60 mb-6">
              最初の職務経歴を追加して、キャリアを記録しましょう
            </p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              最初の職務経歴を追加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCareers.map((career) => (
              <CareerCard key={career.id} career={career} onEdit={handleEdit} />
            ))}
          </div>
        )}

      </div>
      
      {/* Career Modal */}
      <CareerModal
        isOpen={isModalOpen}
        career={editingCareer}
        onClose={handleModalClose}
        onSave={handleCareerSave}
      />
    </div>
  );
}

