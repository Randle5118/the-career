"use client";

import React, { useState, useEffect } from "react";
import type { Application } from "@/types/application";
import { Calendar, Video, Building2, Clock } from "lucide-react";

interface ScheduleSectionProps {
  application: Application;
  onEditClick?: () => void;
}

export default function ScheduleSection({ application, onEditClick }: ScheduleSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!application.schedule || 
      (!application.schedule.nextEvent && 
       !application.schedule.deadline && 
       !application.schedule.interviewMethod)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/60">
        <Calendar className="w-16 h-16 mb-4 text-base-content/40" />
        <p className="text-sm mb-4">日程情報がありません</p>
        {onEditClick && (
          <button 
            onClick={onEditClick}
            className="btn btn-primary btn-sm"
          >
            日程管理を追加
          </button>
        )}
      </div>
    );
  }

  const { schedule } = application;
  const isOverdue =
    mounted &&
    schedule.deadline &&
    new Date(schedule.deadline) < new Date();

  return (
    <div className="space-y-8">
      {/* 次回イベント */}
      {schedule.nextEvent && (
        <section className="bg-base-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-base-content mb-2 pb-2 border-b border-base-300">
            次回イベント
          </h4>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              isOverdue 
                ? "bg-warning/10 border border-warning/20" 
                : "bg-info/10 border border-info/20"
            }`}>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-base-content/60" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-base-content/90">
                    {schedule.nextEvent}
                  </p>
                  {schedule.deadline && (
                    <p className={`text-xs mt-2 ${isOverdue ? "text-warning font-medium" : "text-base-content/60"}`}>
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      {mounted ? new Date(schedule.deadline).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "..."}
                      {isOverdue && " (期限切れ)"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 面接方法 */}
      {schedule.interviewMethod && (
        <section className="bg-base-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-base-content mb-2 pb-2 border-b border-base-300">
            面接方法
          </h4>
          
          <div className="space-y-4">
            {schedule.interviewMethod.type === "online" ? (
              <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border border-base-300">
                <Video className="w-4 h-4 text-base-content/60 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-base-content/60 mb-1">オンライン面接</p>
                  {schedule.interviewMethod.url && (
                    <a
                      href={schedule.interviewMethod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-base-content/90 hover:text-primary transition-colors truncate block"
                    >
                      {schedule.interviewMethod.url}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border border-base-300">
                <Building2 className="w-4 h-4 text-base-content/60 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-base-content/60 mb-1">対面面接</p>
                  <p className="text-sm font-medium text-base-content/90">
                    {schedule.interviewMethod.address}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 期日のみの場合 */}
      {!schedule.nextEvent && schedule.deadline && (
        <section className="bg-base-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-base-content mb-2 pb-2 border-b border-base-300">
            期日
          </h4>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              isOverdue 
                ? "bg-warning/10 border border-warning/20" 
                : "bg-base-100 border border-base-300"
            }`}>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-base-content/60" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isOverdue ? "text-warning" : "text-base-content/90"}`}>
                    {mounted ? new Date(schedule.deadline).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "..."}
                    {isOverdue && " (期限切れ)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

