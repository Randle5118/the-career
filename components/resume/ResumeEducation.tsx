/**
 * 履歴書学歴表示コンポーネント
 */

import type { Resume } from "@/types/resume";
import { GraduationCap } from "lucide-react";

interface ResumeEducationProps {
  resume: Resume;
}

export default function ResumeEducation({ resume }: ResumeEducationProps) {
  if (!resume.education || resume.education.length === 0) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
        <GraduationCap className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
        <p className="text-base-content/50">学歴情報がありません</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {resume.education.map((edu, index) => (
        <div 
          key={index}
          className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-20 text-sm text-base-content/60 font-medium">
              {edu.date}
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-base-content mb-1">
                {edu.school_name}
              </h4>
              
              <div className="flex flex-wrap gap-3 text-sm text-base-content/70 mb-2">
                <span>{edu.major}</span>
                <span className="text-base-content/40">•</span>
                <span>{edu.degree}</span>
              </div>
              
              {/* 備考 */}
              {edu.comment?.trim() && (
                <div className="mt-3 pt-3 border-t border-base-300">
                  <p className="text-sm text-base-content/70 whitespace-pre-line">
                    {edu.comment}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

