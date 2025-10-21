"use client";

import type { Application } from "@/types/application";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarViewProps {
  applications: Application[];
  onViewDetail?: (application: Application) => void;
  onEdit: (application: Application) => void;
}

// 獲取週的開始日期（週一）
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 調整為週一開始
  return new Date(d.setDate(diff));
};

// 格式化日期為 YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// 獲取週的所有日期
const getWeekDays = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

export default function CalendarView({ applications, onViewDetail, onEdit }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const weekStart = getWeekStart(currentDate);
  const weekDays = getWeekDays(weekStart);

  useEffect(() => {
    setMounted(true);
  }, []);

  const weekDayNames = ["月", "火", "水", "木", "金", "土", "日"];

  // 按日期分組應募資料
  const applicationsByDate = new Map<string, Application[]>();
  
  applications.forEach((app) => {
    // 檢查 schedule.deadline
    if (app.schedule?.deadline) {
      const dateStr = formatDate(new Date(app.schedule.deadline));
      const existing = applicationsByDate.get(dateStr) || [];
      if (!existing.find(a => a.id === app.id)) {
        applicationsByDate.set(dateStr, [...existing, app]);
      }
    }
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  // 狀態配置
  const statusConfig = {
    bookmarked: { label: "ブックマーク", color: "bg-gray-100 text-gray-800" },
    applied: { label: "応募済み", color: "bg-blue-100 text-blue-800" },
    casual_interview: { label: "面談", color: "bg-purple-100 text-purple-800" },
    interview: { label: "面接", color: "bg-yellow-100 text-yellow-800" },
    first_interview: { label: "一次面接", color: "bg-yellow-100 text-yellow-800" },
    final_interview: { label: "最終面接", color: "bg-orange-100 text-orange-800" },
    offer: { label: "内定", color: "bg-green-100 text-green-800" },
    offer_received: { label: "オファー受領", color: "bg-green-100 text-green-800" },
    rejected: { label: "不採用", color: "bg-red-100 text-red-800" },
    withdrawn: { label: "辞退", color: "bg-gray-100 text-gray-800" },
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {weekStart.getFullYear()}年 {weekStart.getMonth() + 1}月
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="btn btn-sm btn-ghost btn-square"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="btn btn-sm btn-ghost normal-case px-4"
          >
            今日
          </button>
          <button
            onClick={goToNextWeek}
            className="btn btn-sm btn-ghost btn-square"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-base-300">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center border-r last:border-r-0 border-base-300 ${
                isToday(day) ? "bg-primary/5" : ""
              }`}
            >
              <div className="text-xs text-base-content/60">
                {weekDayNames[index]}
              </div>
              <div
                className={`text-lg font-semibold mt-1 ${
                  isToday(day)
                    ? "text-primary"
                    : index >= 5
                    ? "text-base-content/40"
                    : "text-base-content"
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Content */}
        <div className="grid grid-cols-7 min-h-[500px]">
          {weekDays.map((day, index) => {
            const dateStr = formatDate(day);
            const dayApplications = applicationsByDate.get(dateStr) || [];

            return (
              <div
                key={index}
                className={`p-2 border-r last:border-r-0 border-base-300 ${
                  isToday(day) ? "bg-primary/5" : index >= 5 ? "bg-base-200/30" : ""
                }`}
              >
                <div className="space-y-2">
                  {dayApplications.map((app) => {
                    const config = statusConfig[app.status];
                    const hasSchedule = app.schedule?.deadline && formatDate(new Date(app.schedule.deadline)) === dateStr;
                    
                    return (
                      <div
                        key={app.id}
                        onClick={() => onViewDetail?.(app)}
                        className="p-2 bg-base-100 border border-base-300 rounded cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-2">
                          <CalendarIcon className="w-3 h-3 text-base-content/40 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {app.companyName}
                            </p>
                            <p className="text-xs text-base-content/60 truncate mt-0.5">
                              {app.position}
                            </p>
                            {app.schedule?.deadline && (
                              <p className="text-xs font-semibold text-primary mt-1">
                                {mounted ? new Date(app.schedule.deadline).toLocaleTimeString('ja-JP', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                }) : "..."}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${config.color}`}
                              >
                                {config.label}
                              </span>
                            </div>
                            {hasSchedule && app.schedule?.nextEvent && (
                              <p className="text-xs text-base-content/70 mt-1 truncate">
                                📋 {app.schedule.nextEvent}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-4">
        <div className="flex items-center gap-4 text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>日程管理の期日を表示</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/10 rounded"></div>
            <span>今日</span>
          </div>
        </div>
      </div>
    </div>
  );
}

