"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResume } from "@/libs/hooks/useResume";
import { Heading } from "@/components/catalyst/heading";
import { TabList } from "@/components/forms/TabComponents";
import { Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import type { Resume } from "@/types/resume";
import ResumeBasicInfoForm from "@/components/resume/forms/ResumeBasicInfoForm";
import ResumeEducationForm from "@/components/resume/forms/ResumeEducationForm";
import ResumeWorkExperienceForm from "@/components/resume/forms/ResumeWorkExperienceForm";
import ResumeSkillsForm from "@/components/resume/forms/ResumeSkillsForm";
import ResumeLanguagesAwardsForm from "@/components/resume/forms/ResumeLanguagesAwardsForm";
import ResumePreferencesForm from "@/components/resume/forms/ResumePreferencesForm";

type TabId = "basic" | "education" | "work" | "skills" | "languages" | "preferences";

export default function ResumeEditPage() {
  const router = useRouter();
  const { resume: originalResume, updateResume, isLoading } = useResume();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [formData, setFormData] = useState<Resume | null>(originalResume);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tab 配置
  const tabs = [
    { id: "basic" as TabId, label: "基本資料" },
    { id: "education" as TabId, label: "学歴" },
    { id: "work" as TabId, label: "職務経歴" },
    { id: "skills" as TabId, label: "スキル・資格" },
    { id: "languages" as TabId, label: "言語・受賞歴" },
    { id: "preferences" as TabId, label: "希望条件" },
  ];
  
  const handleFieldChange = (field: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) {
      toast.error("データがありません");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await updateResume(formData);
      router.push("/dashboard/resume");
    } catch (error) {
      // Error is handled in useResume hook
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    router.push("/dashboard/resume");
  };
  
  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSave} className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <div>
            <Heading>履歴書編集</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              履歴書の内容を編集します
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost"
              disabled={isSaving}
            >
              <X className="w-5 h-5 mr-2" />
              キャンセル
            </button>
            
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  保存
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* タブナビゲーション */}
        <div className="mb-6">
          <TabList
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-4"
          />
        </div>
        
        {/* フォームエリア */}
        <div className="pb-8">
        {activeTab === "basic" && (
          <ResumeBasicInfoForm
            resume={formData}
            onChange={handleFieldChange}
          />
        )}
        
        {activeTab === "education" && (
          <ResumeEducationForm
            education={formData.education}
            onChange={(education) => handleFieldChange("education", education)}
          />
        )}
        
        {activeTab === "work" && (
          <ResumeWorkExperienceForm
            workExperience={formData.work_experience}
            onChange={(workExperience) => handleFieldChange("work_experience", workExperience)}
          />
        )}
        
        {activeTab === "skills" && (
          <ResumeSkillsForm
            skills={formData.skills}
            certifications={formData.certifications}
            onSkillsChange={(skills) => handleFieldChange("skills", skills)}
            onCertificationsChange={(certifications) => handleFieldChange("certifications", certifications)}
          />
        )}
        
        {activeTab === "languages" && (
          <ResumeLanguagesAwardsForm
            languages={formData.languages}
            awards={formData.awards}
            onLanguagesChange={(languages) => handleFieldChange("languages", languages)}
            onAwardsChange={(awards) => handleFieldChange("awards", awards)}
          />
        )}
        
        {activeTab === "preferences" && (
          <ResumePreferencesForm
            preferences={formData.preferences}
            onChange={(preferences) => handleFieldChange("preferences", preferences)}
          />
        )}
      </div>
        
        {/* 固定保存ボタン（モバイル用） */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <button 
            type="submit"
            className="btn btn-primary btn-lg shadow-lg"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Save className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

