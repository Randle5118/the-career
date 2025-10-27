/**
 * 履歷書語言・獎項表單組件
 */

import type { Language, Award } from "@/types/resume";
import { FormField } from "@/components/forms";
import { Plus, Trash2 } from "lucide-react";

interface ResumeLanguagesAwardsFormProps {
  languages: Language[];
  awards: Award[];
  onLanguagesChange: (languages: Language[]) => void;
  onAwardsChange: (awards: Award[]) => void;
}

export default function ResumeLanguagesAwardsForm({ 
  languages, 
  awards, 
  onLanguagesChange, 
  onAwardsChange 
}: ResumeLanguagesAwardsFormProps) {
  // Languages handlers
  const handleAddLanguage = () => {
    onLanguagesChange([
      ...languages,
      {
        name: "",
        level: ""
      }
    ]);
  };
  
  const handleRemoveLanguage = (index: number) => {
    onLanguagesChange(languages.filter((_, i) => i !== index));
  };
  
  const handleLanguageChange = (index: number, field: keyof Language, value: string) => {
    const updated = languages.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onLanguagesChange(updated);
  };
  
  // Awards handlers
  const handleAddAward = () => {
    onAwardsChange([
      ...awards,
      {
        date: "",
        title: "",
        organization: ""
      }
    ]);
  };
  
  const handleRemoveAward = (index: number) => {
    onAwardsChange(awards.filter((_, i) => i !== index));
  };
  
  const handleAwardChange = (index: number, field: keyof Award, value: string) => {
    const updated = awards.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onAwardsChange(updated);
  };
  
  const languageLevelOptions = [
    "ネイティブ",
    "ビジネスレベル",
    "日常会話",
    "初級"
  ];
  
  return (
    <div className="space-y-6">
      {/* 言語 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-base-content">言語</h4>
          <button
            type="button"
            onClick={handleAddLanguage}
            className="btn btn-sm btn-primary"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>
        
        <div className="space-y-3">
          {languages.map((lang, index) => (
            <div 
              key={index}
              className="bg-base-100 border border-base-300 rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    label="言語名"
                    name={`lang-${index}-name`}
                    value={lang.name}
                    onChange={(e) => handleLanguageChange(index, "name", e.target.value)}
                    placeholder="日本語、英語など"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-2">
                      レベル <span className="text-error">*</span>
                    </label>
                    <select
                      name={`lang-${index}-level`}
                      value={lang.level}
                      onChange={(e) => handleLanguageChange(index, "level", e.target.value)}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">選択してください</option>
                      {languageLevelOptions.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(index)}
                  className="btn btn-sm btn-ghost btn-circle text-error mt-6"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 受賞歴 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-base-content">受賞歴</h4>
          <button
            type="button"
            onClick={handleAddAward}
            className="btn btn-sm btn-primary"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>
        
        <div className="space-y-3">
          {awards.map((award, index) => (
            <div 
              key={index}
              className="bg-base-100 border border-base-300 rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    label="受賞年"
                    name={`award-${index}-date`}
                    value={award.date}
                    onChange={(e) => handleAwardChange(index, "date", e.target.value)}
                    placeholder="2022"
                    required
                  />
                  
                  <FormField
                    label="賞の名称"
                    name={`award-${index}-title`}
                    value={award.title}
                    onChange={(e) => handleAwardChange(index, "title", e.target.value)}
                    required
                  />
                  
                  <FormField
                    label="授与組織"
                    name={`award-${index}-organization`}
                    value={award.organization}
                    onChange={(e) => handleAwardChange(index, "organization", e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveAward(index)}
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

