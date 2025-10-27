/**
 * 履歷書學歷表單組件
 */

import type { Education } from "@/types/resume";
import { FormField } from "@/components/forms";
import { Plus, Trash2 } from "lucide-react";

interface ResumeEducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export default function ResumeEducationForm({ education, onChange }: ResumeEducationFormProps) {
  const handleAdd = () => {
    onChange([
      ...education,
      {
        date: "",
        school_name: "",
        major: "",
        degree: ""
      }
    ]);
  };
  
  const handleRemove = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };
  
  const handleChange = (index: number, field: keyof Education, value: string) => {
    const updated = education.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-base-content">学歴</h4>
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-sm btn-primary"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>
      
      {education.length === 0 ? (
        <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
          <p className="text-base-content/50 mb-4">学歴がありません</p>
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            学歴を追加
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div 
              key={index}
              className="bg-base-100 border border-base-300 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-base-content">学歴 {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="btn btn-sm btn-ghost btn-circle text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="卒業年月"
                  name={`education-${index}-date`}
                  value={edu.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                  placeholder="2011-06"
                  required
                />
                
                <FormField
                  label="学校名"
                  name={`education-${index}-school_name`}
                  value={edu.school_name}
                  onChange={(e) => handleChange(index, "school_name", e.target.value)}
                  required
                />
                
                <FormField
                  label="学科・専攻"
                  name={`education-${index}-major`}
                  value={edu.major}
                  onChange={(e) => handleChange(index, "major", e.target.value)}
                  required
                />
                
                <FormField
                  label="卒業区分"
                  name={`education-${index}-degree`}
                  value={edu.degree}
                  onChange={(e) => handleChange(index, "degree", e.target.value)}
                  placeholder="卒業 / 在学中 / 中退"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

