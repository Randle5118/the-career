/**
 * 履歷書語言・獎項展示組件
 */

import type { Resume } from "@/types/resume";
import { Languages, Trophy } from "lucide-react";

interface ResumeLanguagesAwardsProps {
  resume: Resume;
}

export default function ResumeLanguagesAwards({ resume }: ResumeLanguagesAwardsProps) {
  const hasLanguages = resume.languages && resume.languages.length > 0;
  const hasAwards = resume.awards && resume.awards.length > 0;
  
  if (!hasLanguages && !hasAwards) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
        <Languages className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
        <p className="text-base-content/50">言語・受賞歴情報がありません</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 言語 */}
      {hasLanguages && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <Languages className="w-5 h-5" />
            言語
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resume.languages.map((lang, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-base-200/30 hover:bg-base-200/50 transition-colors"
              >
                <span className="font-medium text-base-content">
                  {lang.name}
                </span>
                <span className="badge badge-primary">
                  {lang.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 受賞歴 */}
      {hasAwards && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            受賞歴
          </h4>
          
          <div className="space-y-4">
            {resume.awards.map((award, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border border-base-300 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-warning" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="font-semibold text-base-content">
                        {award.title}
                      </h5>
                      <span className="text-sm text-base-content/60 whitespace-nowrap">
                        {award.date}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/70">
                      {award.organization}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

