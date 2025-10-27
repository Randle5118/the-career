"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResume } from "@/libs/hooks/useResume";
import { Heading } from "@/components/catalyst/heading";
import { TabList } from "@/components/forms/TabComponents";
import { FileText, Edit } from "lucide-react";
import ResumeBasicInfo from "@/components/resume/ResumeBasicInfo";
import ResumeEducation from "@/components/resume/ResumeEducation";
import ResumeWorkExperience from "@/components/resume/ResumeWorkExperience";
import ResumeSkills from "@/components/resume/ResumeSkills";
import ResumeLanguagesAwards from "@/components/resume/ResumeLanguagesAwards";
import ResumePreferences from "@/components/resume/ResumePreferences";

type TabId = "basic" | "education" | "work" | "skills" | "languages" | "preferences";

export default function ResumePage() {
  const router = useRouter();
  const { resume, completeness, isLoading } = useResume();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  
  // Tab 配置
  const tabs = [
    { id: "basic" as TabId, label: "基本資料" },
    { id: "education" as TabId, label: "学歴" },
    { id: "work" as TabId, label: "職務経歴" },
    { id: "skills" as TabId, label: "スキル・資格" },
    { id: "languages" as TabId, label: "言語・受賞歴" },
    { id: "preferences" as TabId, label: "希望条件" },
  ];
  
  const handleEdit = () => {
    router.push("/dashboard/resume/edit");
  };
  
  if (isLoading || !resume) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <div>
            <Heading>履歴書</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              あなたの履歴書を確認・編集できます
            </p>
            
            {/* 完整度表示 */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-base-content/70">完成度:</span>
              <div className="flex-1 max-w-xs">
                <div className="flex items-center gap-2">
                  <progress 
                    className="progress progress-primary w-full" 
                    value={completeness} 
                    max="100"
                  ></progress>
                  <span className="text-sm font-medium text-primary">
                    {completeness}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleEdit}
            className="btn btn-primary"
          >
            <Edit className="w-5 h-5 mr-2" />
            編集する
          </button>
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
        
        {/* コンテンツエリア */}
        <div className="pb-8">
          {activeTab === "basic" && <ResumeBasicInfo resume={resume} />}
          {activeTab === "education" && <ResumeEducation resume={resume} />}
          {activeTab === "work" && <ResumeWorkExperience resume={resume} />}
          {activeTab === "skills" && <ResumeSkills resume={resume} />}
          {activeTab === "languages" && <ResumeLanguagesAwards resume={resume} />}
          {activeTab === "preferences" && <ResumePreferences resume={resume} />}
        </div>
      </div>
    </div>
  );
}

