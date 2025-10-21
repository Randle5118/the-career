"use client";

import { useState, useMemo, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import type { Career, CareerFormData, OfferSalary, SalaryChange } from "@/types/career";
import SideJobCard from "@/components/cards/SideJobCard";
import CareerModal from "@/components/modals/CareerModal";
import { toast } from "react-hot-toast";
import { Briefcase, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { formatSalaryCompact } from "@/libs/currency";
import { MOCK_SIDE_JOBS } from "@/libs/mock-data/side-jobs";
import { Heading } from "@/components/catalyst/heading";

// 使用統一的 mock 數據
const mockSideJobs = MOCK_SIDE_JOBS;

export default function SideJobsPage() {
  const router = useRouter();
  const [sideJobs, setSideJobs] = useState<Career[]>(mockSideJobs);
  const [mounted, setMounted] = useState(false);
  const baseId = useId();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingCareerId, setEditingCareerId] = useState<string | null>(null);

  // Ensure chart only renders on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter only side jobs (freelance, contract, part-time)
  const sideJobCareers = useMemo(() => {
    return sideJobs.filter(career => 
      career.employmentType === "freelance" || 
      career.employmentType === "contract" || 
      career.employmentType === "part_time"
    );
  }, [sideJobs]);

  // Statistics for side jobs
  const stats = useMemo(() => {
    const total = sideJobCareers.length;
    const current = sideJobCareers.filter((c) => c.status === "current").length;
    
    // Use a fixed date to avoid hydration mismatch
    const currentDate = new Date("2024-12-01");
    
    const totalYears = sideJobCareers.reduce((acc, career) => {
      const start = new Date(career.startDate + "-01");
      const end = career.endDate ? new Date(career.endDate + "-01") : currentDate;
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return acc + months / 12;
    }, 0);

    // Calculate total earnings from current side jobs
    const totalEarnings = sideJobCareers
      .filter(c => c.status === "current")
      .reduce((acc, career) => {
        if (career.salaryHistory && career.salaryHistory.length > 0) {
          const latestSalary = career.salaryHistory[career.salaryHistory.length - 1];
          const careerTotal = latestSalary.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0);
          return acc + careerTotal;
        }
        return acc;
      }, 0);

    const averageMonthly = Math.round(totalEarnings / 12);

    return { 
      total, 
      current, 
      totalYears: Math.round(totalYears * 10) / 10, 
      totalEarnings,
      averageMonthly 
    };
  }, [sideJobCareers]);

  // Side job earnings trend data
  const earningsTrendData = useMemo(() => {
    const allChanges: Array<{
      date: string;
      totalEarnings: number;
      company: string;
      position: string;
      currency: string;
    }> = [];

    sideJobCareers.forEach((career) => {
      if (career.salaryHistory && career.salaryHistory.length > 0) {
        career.salaryHistory.forEach((change) => {
          const [year, month] = change.yearMonth.split("-");
          const totalEarnings = change.salaryBreakdown.reduce((sum, item) => sum + item.salary, 0);

          allChanges.push({
            date: `${year}/${month}`,
            totalEarnings,
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
  }, [sideJobCareers]);

  // Employment type distribution for pie chart
  const employmentTypeData = useMemo(() => {
    const typeCount = sideJobCareers.reduce((acc, career) => {
      const type = career.employmentType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      freelance: "#5b8ff9",
      contract: "#5ad8a6", 
      part_time: "#f6bd16"
    };

    const labels = {
      freelance: "フリーランス",
      contract: "契約社員",
      part_time: "パートタイム"
    };

    return Object.entries(typeCount).map(([type, count]) => ({
      name: labels[type as keyof typeof labels] || type,
      value: count,
      color: colors[type as keyof typeof colors] || "#999"
    }));
  }, [sideJobCareers]);

  // Calculate smart Y-axis range for earnings
  const yAxisDomain = useMemo(() => {
    if (earningsTrendData.length === 0) return [0, 1000];
    
    const earnings = earningsTrendData.map(d => d.totalEarnings);
    const minEarnings = Math.min(...earnings);
    const maxEarnings = Math.max(...earnings);
    
    // Convert to 万円 units and round to nearest 100万円
    const minInMan = Math.floor(minEarnings / 100) * 100;
    const maxInMan = Math.ceil(maxEarnings / 100) * 100;
    
    // Ensure minimum range of 500万円
    const range = maxInMan - minInMan;
    if (range < 500) {
      const center = (minInMan + maxInMan) / 2;
      return [Math.max(0, center - 250), center + 250];
    }
    
    return [minInMan, maxInMan];
  }, [earningsTrendData]);

  // Sort careers by date (current jobs first, then by start date descending)
  const sortedCareers = useMemo(() => {
    return [...sideJobCareers].sort((a, b) => {
      if (a.status === "current" && b.status !== "current") return -1;
      if (a.status !== "current" && b.status === "current") return 1;
      return new Date(b.startDate + "-01").getTime() - new Date(a.startDate + "-01").getTime();
    });
  }, [sideJobCareers]);

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

  const handleCareerSave = async (
    careerId: string | null, 
    data: CareerFormData, 
    salaryHistory: SalaryChange[], 
    offerSalary?: OfferSalary
  ) => {
    try {
      if (careerId) {
        // Update existing career
        const updatedCareers = sideJobs.map(career => 
          career.id === careerId 
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
        setSideJobs(updatedCareers);
        toast.success("副業を更新しました");
      } else {
        // Add new career
        const newCareer: Career = {
          id: `sidejob-${baseId}-${sideJobs.length}`,
          ...data,
          tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags || [],
          salaryHistory,
          offerSalary,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSideJobs(prev => [...prev, newCareer]);
        toast.success("新しい副業を追加しました");
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
            <Heading>副業・兼職</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              主業以外の副業や兼職の経験を記録・管理しましょう
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            副業を追加
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-4 lg:items-stretch">
          {/* Statistics */}
          <div className="flex flex-col lg:w-3/10 gap-4">
            {/* Total Side Jobs */}
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm flex-1 flex items-center justify-between">
              <div className="text-sm text-base-content/60">総副業数</div>
              <div className="text-3xl font-semibold">{stats.total}</div>
            </div>

            {/* Current Side Jobs */}
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm flex-1 flex items-center justify-between">
              <div className="text-sm text-base-content/60">進行中</div>
              <div className="text-3xl font-semibold">{stats.current}</div>
            </div>

            {/* Total Years */}
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm flex-1 flex items-center justify-between">
              <div className="text-sm text-base-content/60">総副業年数</div>
              <div className="text-3xl font-semibold">{stats.totalYears}年</div>
            </div>

            {/* Total Earnings */}
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm flex-1 flex items-center justify-between">
              <div className="text-sm text-base-content/60">年収入</div>
              <div className="text-3xl font-semibold">{formatSalaryCompact(stats.totalEarnings, 'JPY')}</div>
            </div>

            {/* Average Monthly */}
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm flex-1 flex items-center justify-between">
              <div className="text-sm text-base-content/60">月平均</div>
              <div className="text-3xl font-semibold">{formatSalaryCompact(stats.averageMonthly, 'JPY')}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="lg:w-7/10 space-y-6">
            {/* Earnings Trend Chart */}
            {mounted && earningsTrendData.length > 0 && (
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-base-content">副業収入推移</h3>
                  <p className="text-sm text-base-content/60">副業を通じた収入の推移</p>
                </div>
                <div className="w-full bg-white rounded-lg p-3 border border-base-200" style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={earningsTrendData}
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
                        dataKey="date" 
                        tick={{ fill: 'oklch(var(--bc) / 0.7)', fontSize: 12, fontWeight: 500 }}
                        axisLine={{ stroke: 'oklch(var(--bc) / 0.25)', strokeWidth: 1 }}
                        tickMargin={15}
                        height={30}
                      />
                      <YAxis 
                        tick={{ fill: 'oklch(var(--bc) / 0.7)', fontSize: 12, fontWeight: 500 }}
                        stroke="oklch(var(--bc) / 0.25)"
                        tickFormatter={(value) => formatSalaryCompact(value, 'JPY')}
                        tickMargin={15}
                        width={60}
                        domain={yAxisDomain}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                <div className="font-bold text-primary text-lg mb-1">
                                  {formatSalaryCompact(payload[0].value, 'JPY')}
                                </div>
                                <div className="text-sm text-base-content/60 mb-1">
                                  {data.date}
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
                        dataKey="totalEarnings" 
                        stroke="#5b8ff9" 
                        strokeWidth={3}
                        dot={{ fill: '#5b8ff9', strokeWidth: 2, r: 5 }}
                        activeDot={{ 
                          r: 7, 
                          stroke: '#5b8ff9', 
                          strokeWidth: 2, 
                          fill: '#fff'
                        }}
                        name="副業収入"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Employment Type Distribution */}
            {mounted && employmentTypeData.length > 0 && (
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-base-content">雇用形態分布</h3>
                  <p className="text-sm text-base-content/60">副業の雇用形態別分布</p>
                </div>
                <div className="w-full bg-white rounded-lg p-3 border border-base-200" style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={employmentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {employmentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Side Jobs List */}
        {sideJobCareers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-base-content/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              まだ副業がありません
            </h3>
            <p className="text-base-content/60 mb-6">
              最初の副業を追加して、収入源を記録しましょう
            </p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              最初の副業を追加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCareers.map((career) => (
              <SideJobCard key={career.id} career={career} onEdit={handleEdit} />
            ))}
          </div>
        )}

      </div>
      
      {/* Career Edit Modal */}
      <CareerModal
        isOpen={isModalOpen}
        career={editingCareer}
        onClose={handleModalClose}
        onSave={handleCareerSave}
      />
    </div>
  );
}
