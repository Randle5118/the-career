/**
 * 履歷書技能・資格表單組件
 */

import type { Skill, Certification } from "@/types/resume";
import { FormField } from "@/components/forms";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ResumeSkillsFormProps {
  skills: Skill[];
  certifications: Certification[];
  onSkillsChange: (skills: Skill[]) => void;
  onCertificationsChange: (certifications: Certification[]) => void;
}

export default function ResumeSkillsForm({ 
  skills, 
  certifications, 
  onSkillsChange, 
  onCertificationsChange 
}: ResumeSkillsFormProps) {
  const [newSkillItem, setNewSkillItem] = useState<Record<number, string>>({});
  
  // Skills handlers
  const handleAddSkillCategory = () => {
    onSkillsChange([
      ...skills,
      {
        category: "",
        items: []
      }
    ]);
  };
  
  const handleRemoveSkillCategory = (index: number) => {
    onSkillsChange(skills.filter((_, i) => i !== index));
  };
  
  const handleSkillCategoryChange = (index: number, category: string) => {
    const updated = skills.map((item, i) => 
      i === index ? { ...item, category } : item
    );
    onSkillsChange(updated);
  };
  
  const handleAddSkillItem = (categoryIndex: number) => {
    const item = newSkillItem[categoryIndex]?.trim();
    if (!item) return;
    
    const updated = skills.map((skill, i) => 
      i === categoryIndex ? { ...skill, items: [...skill.items, item] } : skill
    );
    onSkillsChange(updated);
    setNewSkillItem({ ...newSkillItem, [categoryIndex]: "" });
  };
  
  const handleRemoveSkillItem = (categoryIndex: number, itemIndex: number) => {
    const updated = skills.map((skill, i) => 
      i === categoryIndex 
        ? { ...skill, items: skill.items.filter((_, j) => j !== itemIndex) } 
        : skill
    );
    onSkillsChange(updated);
  };
  
  // Certifications handlers
  const handleAddCertification = () => {
    onCertificationsChange([
      ...certifications,
      {
        date: "",
        name: ""
      }
    ]);
  };
  
  const handleRemoveCertification = (index: number) => {
    onCertificationsChange(certifications.filter((_, i) => i !== index));
  };
  
  const handleCertificationChange = (index: number, field: keyof Certification, value: string) => {
    const updated = certifications.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onCertificationsChange(updated);
  };
  
  return (
    <div className="space-y-6">
      {/* スキル */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-base-content">スキル</h4>
          <button
            type="button"
            onClick={handleAddSkillCategory}
            className="btn btn-sm btn-primary"
          >
            <Plus className="w-4 h-4" />
            カテゴリ追加
          </button>
        </div>
        
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div 
              key={index}
              className="bg-base-100 border border-base-300 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FormField
                  label="カテゴリ名"
                  name={`skill-category-${index}`}
                  value={skill.category}
                  onChange={(e) => handleSkillCategoryChange(index, e.target.value)}
                  placeholder="例: マネジメント、開発・技術"
                  required
                  className="flex-1 mr-4"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSkillCategory(index)}
                  className="btn btn-sm btn-ghost btn-circle text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-base-content">
                  スキル項目
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {skill.items.map((item, itemIndex) => (
                    <span 
                      key={itemIndex}
                      className="badge badge-lg badge-outline gap-2"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillItem(index, itemIndex)}
                        className="hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillItem[index] || ""}
                    onChange={(e) => setNewSkillItem({ ...newSkillItem, [index]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkillItem(index);
                      }
                    }}
                    placeholder="スキルを入力してEnter"
                    className="input input-bordered flex-1 input-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillItem(index)}
                    className="btn btn-sm btn-primary"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 資格・免許 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-base-content">資格・免許</h4>
          <button
            type="button"
            onClick={handleAddCertification}
            className="btn btn-sm btn-primary"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>
        
        <div className="space-y-3">
          {certifications.map((cert, index) => (
            <div 
              key={index}
              className="bg-base-100 border border-base-300 rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    label="取得年月"
                    name={`cert-${index}-date`}
                    value={cert.date}
                    onChange={(e) => handleCertificationChange(index, "date", e.target.value)}
                    placeholder="2010-12"
                    required
                  />
                  
                  <div className="md:col-span-2">
                    <FormField
                      label="資格名"
                      name={`cert-${index}-name`}
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(index, "name", e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className="btn btn-sm btn-ghost btn-circle text-error mt-6"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

