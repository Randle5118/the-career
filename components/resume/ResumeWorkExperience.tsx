/**
 * 履歴書職務経歴表示コンポーネント
 */

import type { Resume } from "@/types/resume";
import { Briefcase, Calendar } from "lucide-react";

interface ResumeWorkExperienceProps {
  resume: Resume;
}

/**
 * 計算期間長度（年月）
 * @param startDate - 開始日期 (格式: YYYY-MM)
 * @param endDate - 結束日期 (格式: YYYY-MM 或 null)
 */
function calculateDuration(startDate: string, endDate: string | null): string {
  // 將 YYYY-MM 轉換為 Date 物件（使用該月第一天）
  const start = new Date(startDate + "-01");
  const end = endDate ? new Date(endDate + "-01") : new Date();
  
  // 計算總月數
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 
    + (end.getMonth() - start.getMonth());
  
  // 如果結束日期是當月，需要考慮是否已經過完這個月
  // 但由於我們只有年月資訊，假設是該月的最後一天
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years}年`);
  }
  if (months > 0) {
    parts.push(`${months}ヶ月`);
  }
  
  return parts.length > 0 ? parts.join('') : '1ヶ月未満';
}

export default function ResumeWorkExperience({ resume }: ResumeWorkExperienceProps) {
  if (!resume.work_experience || resume.work_experience.length === 0) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
        <Briefcase className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
        <p className="text-base-content/50">職務経歴がありません</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {resume.work_experience.map((exp, expIndex) => (
        <div 
          key={expIndex}
          className="bg-base-100 border border-base-300 rounded-lg p-6"
        >
          {/* 会社基本情報 */}
          <div className="mb-4 pb-4 border-b border-base-300">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-xl font-bold text-base-content">
                {exp.company_name}
              </h3>
              <span className={`badge ${exp.is_current ? 'badge-primary' : 'badge-ghost'}`}>
                {exp.is_current ? '現職' : '退職'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm text-base-content/70">
              <span className="font-medium">{exp.industry}</span>
              <span className="text-base-content/40">•</span>
              {exp.department && (
                <>
                  <span>{exp.department}</span>
                  <span className="text-base-content/40">•</span>
                </>
              )}
              {exp.employment_type && (
                <>
                  <span>{exp.employment_type}</span>
                  <span className="text-base-content/40">•</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {exp.start_date} 〜 {exp.end_date || '現在'} · {calculateDuration(exp.start_date, exp.end_date)}
                </span>
              </div>
            </div>
          </div>
          
          
          {/* 職位リスト（昇進・職種変更）- Timeline形式（参考CareerCard設計） */}
          {exp.positions && exp.positions.length > 0 && (
            <div className={`${exp.positions.length > 1 ? 'mt-6 pt-4 border-t border-base-300' : 'mt-4'}`}>
          <div className="space-y-6">
                {exp.positions.map((pos, posIndex) => {
                  const isLatest = posIndex === exp.positions.length - 1;
                  const shouldShowCurrent = isLatest && pos.is_current;
                  const showTimeline = exp.positions.length > 1;
                  
                  return (
                    <div key={posIndex} className="relative">
                      {showTimeline && (
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center pt-1.5">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${shouldShowCurrent ? 'bg-success' : 'bg-base-content/30'}`} />
                            {posIndex < exp.positions.length - 1 && (
                              <div className="w-px flex-1 bg-base-content/20 mt-2" />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-2">
                            {/* 職位ヘッダー */}
                <div className="mb-3">
                              <div className="mb-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h6 className="text-sm font-semibold text-base-content">
                    {pos.title}
                                  </h6>
                                  {shouldShowCurrent && (
                                    <span className="badge badge-success badge-xs flex-shrink-0">現職</span>
                                  )}
                                </div>
                                <div className="text-xs text-base-content/60">
                                  {pos.start_date} 〜 {pos.is_current || !pos.end_date ? '現在' : pos.end_date} · {calculateDuration(pos.start_date, pos.end_date)}
                  </div>
                </div>
                              {/* 備考（昇進・職種変更の説明） */}
                              {pos.comment?.trim() && (
                                <div className="mt-1">
                                  <p className="text-xs text-base-content/60 italic">
                                    {pos.comment}
                    </p>
                  </div>
                )}
                            </div>
                          </div>
                  </div>
                )}
                
                      {/* 如果只有一個職位，不顯示 timeline */}
                      {!showTimeline && (
                  <div>
                          {/* 職位ヘッダー */}
                          <div className="mb-3">
                            <div className="mb-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h6 className="text-sm font-semibold text-base-content">
                                  {pos.title}
                                </h6>
                                {shouldShowCurrent && (
                                  <span className="badge badge-success badge-xs flex-shrink-0">現職</span>
                                )}
                              </div>
                              <div className="text-xs text-base-content/60">
                                {pos.start_date} 〜 {pos.is_current || !pos.end_date ? '現在' : pos.end_date} · {calculateDuration(pos.start_date, pos.end_date)}
                              </div>
                            </div>
                            {/* 備考（昇進・職種変更の説明） */}
                            {pos.comment?.trim() && (
                              <div className="mt-1">
                                <p className="text-xs text-base-content/60 italic">
                                  {pos.comment}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
                  </div>
                )}
                
          {/* 概要 */}
          {exp.description?.trim() && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-base-content/80 mb-2">
                概要
              </div>
              <div className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line break-words">
                {exp.description}
              </div>
          </div>
          )}
        </div>
      ))}
    </div>
  );
}

