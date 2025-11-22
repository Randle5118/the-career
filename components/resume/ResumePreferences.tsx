/**
 * 履歴書希望条件表示コンポーネント
 */

import type { Resume } from "@/types/resume";
import { Target, MapPin, Briefcase, Calendar } from "lucide-react";

interface ResumePreferencesProps {
  resume: Resume;
}

export default function ResumePreferences({ resume }: ResumePreferencesProps) {
  if (!resume.preferences) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
        <Target className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
        <p className="text-base-content/50">希望条件がありません</p>
      </div>
    );
  }
  
  const { job_types, locations, employment_types, work_styles } = resume.preferences;
  
  return (
    <div className="space-y-6">
      {/* 希望職種 */}
      {job_types && job_types.length > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            希望職種
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {job_types.map((type, index) => (
              <span 
                key={index}
                className="badge badge-primary badge-lg"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* 希望勤務地 */}
      {locations && locations.length > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            希望勤務地
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {locations.map((location, index) => (
              <span 
                key={index}
                className="badge badge-outline badge-lg"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* 希望雇用形態 */}
      {employment_types && employment_types.length > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            希望雇用形態
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {employment_types.map((type, index) => (
              <span 
                key={index}
                className="badge badge-outline badge-lg"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* 希望勤務形態 */}
      {work_styles && work_styles.length > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            希望勤務形態
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {work_styles.map((style, index) => (
              <span 
                key={index}
                className="badge badge-outline badge-lg"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

