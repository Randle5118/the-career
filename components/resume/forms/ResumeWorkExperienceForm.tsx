/**
 * 履歷書工作經歷表單組件
 * 
 * 完整版：支援公司資訊和職位詳細資訊的編輯
 */

import type { WorkExperience, Position } from "@/types/resume";
import { FormField, FormTextarea } from "@/components/forms";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { useState } from "react";

interface ResumeWorkExperienceFormProps {
  workExperience: WorkExperience[];
  onChange: (workExperience: WorkExperience[]) => void;
}

export default function ResumeWorkExperienceForm({ workExperience, onChange }: ResumeWorkExperienceFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>({});
  
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
  
  // Position handlers
  const handleAddPosition = (expIndex: number) => {
    const exp = workExperience[expIndex];
    const updated = workExperience.map((item, i) => 
      i === expIndex ? {
        ...item,
        positions: [
          ...item.positions,
          {
            start_date: "",
            end_date: null,
            is_current: false,
            department: "",
            title: "",
            employment_type: "正社員",
            description: "",
            responsibilities: [],
            achievements: []
          }
        ]
      } : item
    );
    onChange(updated);
  };
  
  const handleRemovePosition = (expIndex: number, posIndex: number) => {
    const updated = workExperience.map((item, i) => 
      i === expIndex ? {
        ...item,
        positions: item.positions.filter((_, pi) => pi !== posIndex)
      } : item
    );
    onChange(updated);
  };
  
  const handlePositionChange = (expIndex: number, posIndex: number, field: keyof Position, value: any) => {
    const updated = workExperience.map((item, i) => 
      i === expIndex ? {
        ...item,
        positions: item.positions.map((pos, pi) => 
          pi === posIndex ? { ...pos, [field]: value } : pos
        )
      } : item
    );
    onChange(updated);
  };
  
  const togglePositionExpand = (expIndex: number, posIndex: number) => {
    const key = `${expIndex}-${posIndex}`;
    setExpandedPositions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Array field handlers
  const handleArrayFieldChange = (expIndex: number, posIndex: number, field: 'responsibilities' | 'achievements', value: string) => {
    const items = value.split('\n').filter(item => item.trim() !== '');
    handlePositionChange(expIndex, posIndex, field, items);
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
                <div className="p-6 border-t border-base-300 space-y-6">
                  {/* 公司基本資訊 */}
                  <div className="space-y-4">
                    <h6 className="text-sm font-semibold text-base-content/70">会社情報</h6>
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
                  </div>
                  
                  {/* 職位列表 */}
                  <div className="border-t border-base-300 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h6 className="text-sm font-semibold text-base-content/70 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        職位・役職
                      </h6>
                      <button
                        type="button"
                        onClick={() => handleAddPosition(index)}
                        className="btn btn-xs btn-outline btn-primary"
                      >
                        <Plus className="w-3 h-3" />
                        職位を追加
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {exp.positions.map((pos, posIndex) => {
                        const posKey = `${index}-${posIndex}`;
                        const isPosExpanded = expandedPositions[posKey];
                        
                        return (
                          <div 
                            key={posIndex}
                            className="border border-base-300 rounded-lg overflow-hidden"
                          >
                            {/* 職位ヘッダー */}
                            <div 
                              className="p-3 bg-base-200/30 flex items-center justify-between cursor-pointer hover:bg-base-200/50"
                              onClick={() => togglePositionExpand(index, posIndex)}
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-base-content">
                                  {pos.title || `職位 ${posIndex + 1}`}
                                </p>
                                <p className="text-xs text-base-content/60">
                                  {pos.department && `${pos.department} · `}
                                  {pos.start_date} 〜 {pos.end_date || '現在'}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePosition(index, posIndex);
                                  }}
                                  className="btn btn-xs btn-ghost btn-circle text-error"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                
                                {isPosExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-base-content/50" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-base-content/50" />
                                )}
                              </div>
                            </div>
                            
                            {/* 職位詳細 */}
                            {isPosExpanded && (
                              <div className="p-4 space-y-4 bg-base-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    label="役職"
                                    name={`pos-${index}-${posIndex}-title`}
                                    value={pos.title}
                                    onChange={(e) => handlePositionChange(index, posIndex, "title", e.target.value)}
                                    placeholder="例: シニアエンジニア"
                                    required
                                  />
                                  
                                  <FormField
                                    label="部署"
                                    name={`pos-${index}-${posIndex}-department`}
                                    value={pos.department}
                                    onChange={(e) => handlePositionChange(index, posIndex, "department", e.target.value)}
                                    placeholder="例: 開発部"
                                  />
                                  
                                  <FormField
                                    label="雇用形態"
                                    name={`pos-${index}-${posIndex}-employment_type`}
                                    value={pos.employment_type}
                                    onChange={(e) => handlePositionChange(index, posIndex, "employment_type", e.target.value)}
                                    placeholder="例: 正社員"
                                  />
                                  
                                  <div className="flex items-center gap-2 pt-6">
                                    <input
                                      type="checkbox"
                                      id={`pos-${index}-${posIndex}-is_current`}
                                      checked={pos.is_current}
                                      onChange={(e) => handlePositionChange(index, posIndex, "is_current", e.target.checked)}
                                      className="checkbox checkbox-primary checkbox-sm"
                                    />
                                    <label htmlFor={`pos-${index}-${posIndex}-is_current`} className="text-xs text-base-content">
                                      現在の職位
                                    </label>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    label="開始年月"
                                    name={`pos-${index}-${posIndex}-start_date`}
                                    value={pos.start_date}
                                    onChange={(e) => handlePositionChange(index, posIndex, "start_date", e.target.value)}
                                    placeholder="2023-02"
                                  />
                                  
                                  <FormField
                                    label="終了年月"
                                    name={`pos-${index}-${posIndex}-end_date`}
                                    value={pos.end_date || ""}
                                    onChange={(e) => handlePositionChange(index, posIndex, "end_date", e.target.value || null)}
                                    placeholder="現在の場合は空欄"
                                  />
                                </div>
                                
                                <FormTextarea
                                  label="職務内容"
                                  name={`pos-${index}-${posIndex}-description`}
                                  value={pos.description}
                                  onChange={(e) => handlePositionChange(index, posIndex, "description", e.target.value)}
                                  placeholder="この職位での主な業務内容を記入してください"
                                  rows={3}
                                />
                                
                                <div>
                                  <label className="block text-sm font-medium text-base-content mb-2">
                                    担当業務
                                    <span className="ml-2 text-xs text-base-content/50">(1行1項目で入力)</span>
                                  </label>
                                  <textarea
                                    value={pos.responsibilities.join('\n')}
                                    onChange={(e) => handleArrayFieldChange(index, posIndex, 'responsibilities', e.target.value)}
                                    className="textarea textarea-bordered w-full"
                                    rows={4}
                                    placeholder="例:&#10;チームリーダーとしてメンバー5名を統括&#10;新機能の設計・実装&#10;コードレビューの実施"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-base-content mb-2">
                                    実績・成果
                                    <span className="ml-2 text-xs text-base-content/50">(1行1項目で入力)</span>
                                  </label>
                                  <textarea
                                    value={pos.achievements.join('\n')}
                                    onChange={(e) => handleArrayFieldChange(index, posIndex, 'achievements', e.target.value)}
                                    className="textarea textarea-bordered w-full"
                                    rows={4}
                                    placeholder="例:&#10;処理速度を50%改善&#10;新規サービスを3ヶ月でリリース&#10;チーム生産性を30%向上"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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

