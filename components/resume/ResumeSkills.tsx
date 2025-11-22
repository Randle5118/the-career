/**
 * 履歴書スキル・資格表示コンポーネント
 */

import type { Resume } from "@/types/resume";
import { Award, Code2 } from "lucide-react";

interface ResumeSkillsProps {
  resume: Resume;
}

export default function ResumeSkills({ resume }: ResumeSkillsProps) {
  const hasSkills = resume.skills && resume.skills.length > 0;
  const hasCertifications = resume.certifications && resume.certifications.length > 0;
  
  if (!hasSkills && !hasCertifications) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
        <Code2 className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
        <p className="text-base-content/50">スキル・資格情報がありません</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* スキル */}
      {hasSkills && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            スキル
          </h4>
          
          <div className="space-y-4">
            {resume.skills.map((skillGroup, index) => (
              <div key={index}>
                <h5 className="text-sm font-medium text-base-content/70 mb-2">
                  {skillGroup.category}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((item, itemIndex) => (
                    <span 
                      key={itemIndex}
                      className="badge badge-outline badge-lg"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                
                {index < resume.skills.length - 1 && (
                  <div className="mt-4 border-b border-base-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 資格・免許 */}
      {hasCertifications && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            資格・免許
          </h4>
          
          <div className="space-y-3">
            {resume.certifications.map((cert, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200/50 transition-colors"
              >
                <div className="flex-shrink-0 w-20 text-sm text-base-content/60 font-medium">
                  {cert.date}
                </div>
                <div className="flex-1 text-base-content/80">
                  {cert.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

