/**
 * 履歷書工作經歷表單組件
 * 
 * 簡化版：僅支援基本的公司和職位資訊編輯
 * 複雜的職位陣列編輯可以在未來版本中擴充
 */

import type { WorkExperience } from "@/types/resume";
import { FormField } from "@/components/forms";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ResumeWorkExperienceFormProps {
  workExperience: WorkExperience[];
  onChange: (workExperience: WorkExperience[]) => void;
}

export default function ResumeWorkExperienceForm({ workExperience, onChange }: ResumeWorkExperienceFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const handleAdd = () => {
    onChange([
      ...workExperience,
      {
        company_name: "",
        industry: "",
        start_date: "",
        end_date: null,
        is_current: false,
        positions: [{
          start_date: "",
          end_date: null,
          is_current: false,
          department: "",
          title: "",
          employment_type: "正社員",
          description: "",
          responsibilities: [],
          achievements: []
        }]
      }
    ]);
    setExpandedIndex(workExperience.length);
  };
  
  const handleRemove = (index: number) => {
    onChange(workExperience.filter((_, i) => i !== index));
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };
  
  const handleChange = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = workExperience.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };
  
  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-base-content">職務経歴</h4>
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-sm btn-primary"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>
      
      {workExperience.length === 0 ? (
        <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
          <p className="text-base-content/50 mb-4">職務経歴がありません</p>
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            職務経歴を追加
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workExperience.map((exp, index) => (
            <div 
              key={index}
              className="bg-base-100 border border-base-300 rounded-lg overflow-hidden"
            >
              {/* ヘッダー */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-base-200/50"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex-1">
                  <h5 className="font-medium text-base-content">
                    {exp.company_name || `職務経歴 ${index + 1}`}
                  </h5>
                  <p className="text-sm text-base-content/60">
                    {exp.start_date} 〜 {exp.end_date || '現在'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="btn btn-sm btn-ghost btn-circle text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-base-content/50" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-base-content/50" />
                  )}
                </div>
              </div>
              
              {/* 展開內容 */}
              {expandedIndex === index && (
                <div className="p-6 border-t border-base-300 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="会社名"
                      name={`work-${index}-company_name`}
                      value={exp.company_name}
                      onChange={(e) => handleChange(index, "company_name", e.target.value)}
                      required
                    />
                    
                    <FormField
                      label="業種"
                      name={`work-${index}-industry`}
                      value={exp.industry}
                      onChange={(e) => handleChange(index, "industry", e.target.value)}
                      required
                    />
                    
                    <FormField
                      label="入社年月"
                      name={`work-${index}-start_date`}
                      value={exp.start_date}
                      onChange={(e) => handleChange(index, "start_date", e.target.value)}
                      placeholder="2023-02"
                      required
                    />
                    
                    <FormField
                      label="退社年月"
                      name={`work-${index}-end_date`}
                      value={exp.end_date || ""}
                      onChange={(e) => handleChange(index, "end_date", e.target.value || null)}
                      placeholder="現在の場合は空欄"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`work-${index}-is_current`}
                      checked={exp.is_current}
                      onChange={(e) => handleChange(index, "is_current", e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <label htmlFor={`work-${index}-is_current`} className="text-sm text-base-content">
                      現在勤務中
                    </label>
                  </div>
                  
                  <div className="alert alert-info">
                    <p className="text-sm">
                      ℹ️ 詳細な職位情報（部署、役職、職務内容など）の編集機能は今後追加予定です。
                      現在は基本情報のみ編集可能です。
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

