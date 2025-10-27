/**
 * 履歷書求職偏好表單組件
 */

import type { Preferences } from "@/types/resume";
import { X } from "lucide-react";
import { useState } from "react";

interface ResumePreferencesFormProps {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
}

export default function ResumePreferencesForm({ preferences, onChange }: ResumePreferencesFormProps) {
  const [newValues, setNewValues] = useState({
    job_type: "",
    location: "",
    employment_type: "",
    work_style: ""
  });
  
  const handleAdd = (field: keyof Preferences, value: string) => {
    if (!value.trim()) return;
    
    onChange({
      ...preferences,
      [field]: [...(preferences[field] || []), value.trim()]
    });
    
    setNewValues({ ...newValues, [field]: "" });
  };
  
  const handleRemove = (field: keyof Preferences, index: number) => {
    onChange({
      ...preferences,
      [field]: preferences[field].filter((_, i) => i !== index)
    });
  };
  
  const handleKeyPress = (field: keyof Preferences, value: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(field, value);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 希望職種 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">希望職種</h4>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {preferences.job_types?.map((type, index) => (
              <span 
                key={index}
                className="badge badge-lg badge-primary gap-2"
              >
                {type}
                <button
                  type="button"
                  onClick={() => handleRemove("job_types", index)}
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
              value={newValues.job_type}
              onChange={(e) => setNewValues({ ...newValues, job_type: e.target.value })}
              onKeyPress={(e) => handleKeyPress("job_types", newValues.job_type, e)}
              placeholder="希望職種を入力してEnter（例: プロダクトマネージャー）"
              className="input input-bordered flex-1"
            />
            <button
              type="button"
              onClick={() => handleAdd("job_types", newValues.job_type)}
              className="btn btn-primary"
            >
              追加
            </button>
          </div>
        </div>
      </div>
      
      {/* 希望勤務地 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">希望勤務地</h4>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {preferences.locations?.map((location, index) => (
              <span 
                key={index}
                className="badge badge-lg badge-outline gap-2"
              >
                {location}
                <button
                  type="button"
                  onClick={() => handleRemove("locations", index)}
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
              value={newValues.location}
              onChange={(e) => setNewValues({ ...newValues, location: e.target.value })}
              onKeyPress={(e) => handleKeyPress("locations", newValues.location, e)}
              placeholder="希望勤務地を入力してEnter（例: 東京、リモート）"
              className="input input-bordered flex-1"
            />
            <button
              type="button"
              onClick={() => handleAdd("locations", newValues.location)}
              className="btn btn-primary"
            >
              追加
            </button>
          </div>
        </div>
      </div>
      
      {/* 希望雇用形態 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">希望雇用形態</h4>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {preferences.employment_types?.map((type, index) => (
              <span 
                key={index}
                className="badge badge-lg badge-outline gap-2"
              >
                {type}
                <button
                  type="button"
                  onClick={() => handleRemove("employment_types", index)}
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
              value={newValues.employment_type}
              onChange={(e) => setNewValues({ ...newValues, employment_type: e.target.value })}
              onKeyPress={(e) => handleKeyPress("employment_types", newValues.employment_type, e)}
              placeholder="希望雇用形態を入力してEnter（例: 正社員、契約社員）"
              className="input input-bordered flex-1"
            />
            <button
              type="button"
              onClick={() => handleAdd("employment_types", newValues.employment_type)}
              className="btn btn-primary"
            >
              追加
            </button>
          </div>
        </div>
      </div>
      
      {/* 希望勤務形態 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">希望勤務形態</h4>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {preferences.work_styles?.map((style, index) => (
              <span 
                key={index}
                className="badge badge-lg badge-outline gap-2"
              >
                {style}
                <button
                  type="button"
                  onClick={() => handleRemove("work_styles", index)}
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
              value={newValues.work_style}
              onChange={(e) => setNewValues({ ...newValues, work_style: e.target.value })}
              onKeyPress={(e) => handleKeyPress("work_styles", newValues.work_style, e)}
              placeholder="希望勤務形態を入力してEnter（例: リモート、ハイブリッド）"
              className="input input-bordered flex-1"
            />
            <button
              type="button"
              onClick={() => handleAdd("work_styles", newValues.work_style)}
              className="btn btn-primary"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

