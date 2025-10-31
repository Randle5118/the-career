/**
 * 履歷書工作經歷展示組件
 */

import type { Resume } from "@/types/resume";
import { Briefcase, Calendar } from "lucide-react";

interface ResumeWorkExperienceProps {
  resume: Resume;
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
          {/* 公司基本資訊 */}
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
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {exp.start_date} 〜 {exp.end_date || '現在'}
                </span>
              </div>
            </div>
          </div>
          
          {/* 職位列表 */}
          <div className="space-y-6">
            {exp.positions.map((pos, posIndex) => (
              <div key={posIndex}>
                <div className="mb-3">
                  <h4 className="text-lg font-semibold text-base-content mb-1">
                    {pos.title}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                    <span>{pos.department}</span>
                    <span className="text-base-content/40">•</span>
                    <span>{pos.employment_type}</span>
                    <span className="text-base-content/40">•</span>
                    <span>
                      {pos.start_date} 〜 {pos.end_date || '現在'}
                    </span>
                  </div>
                </div>
                
                {/* 職務内容 */}
                {pos.description?.trim() && (
                  <div className="mb-3">
                    <p className="text-sm text-base-content/80 leading-relaxed">
                      {pos.description}
                    </p>
                  </div>
                )}
                
                {/* 担当業務 */}
                {pos.responsibilities && pos.responsibilities.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-base-content/70 mb-2">
                      担当業務
                    </h5>
                    <ul className="space-y-1">
                      {pos.responsibilities.map((resp, respIndex) => (
                        <li 
                          key={respIndex}
                          className="text-sm text-base-content/80 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary"
                        >
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 実績 */}
                {pos.achievements && pos.achievements.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-base-content/70 mb-2">
                      実績・成果
                    </h5>
                    <ul className="space-y-1">
                      {pos.achievements.map((ach, achIndex) => (
                        <li 
                          key={achIndex}
                          className="text-sm text-base-content/80 pl-4 relative before:content-['✓'] before:absolute before:left-0 before:text-success"
                        >
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {posIndex < exp.positions.length - 1 && (
                  <div className="mt-4 border-b border-base-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

