"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { 
  User, GraduationCap, Briefcase, Code, Languages as LanguagesIcon,
  FileText
} from "lucide-react";
import { Heading } from "@/components/catalyst/heading";
import ResumeBasicInfo from "@/components/resume/ResumeBasicInfo";
import ResumeEducation from "@/components/resume/ResumeEducation";
import ResumeWorkExperience from "@/components/resume/ResumeWorkExperience";
import ResumeSkills from "@/components/resume/ResumeSkills";
import ResumeLanguagesAwards from "@/components/resume/ResumeLanguagesAwards";
import type { Resume } from "@/types/resume";

type TabId = "basic" | "education" | "work" | "skills" | "languages";

interface PublishedResume extends Resume {
  published_at: string;
  version: number;
}

export default function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [resume, setResume] = useState<PublishedResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [slug, setSlug] = useState<string>("");
  
  useEffect(() => {
    // Unwrap params Promise
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);
  
  useEffect(() => {
    if (!slug) return;
    
    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/published-resumes/${slug}`);
        
        if (!response.ok) {
          setResume(null);
          setIsLoading(false);
          return;
        }
        
        const { data } = await response.json();
        setResume(data);
      } catch (error) {
        console.error('[Published Resume] Fetch error:', error);
        setResume(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResume();
  }, [slug]);
  
  // Loading状態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  // 履歴書が見つからない
  if (!resume) {
    notFound();
  }
  
  // Tab設定
  const tabs = [
    { id: "basic" as TabId, label: "基本情報", icon: User },
    { id: "education" as TabId, label: "学歴", icon: GraduationCap },
    { id: "work" as TabId, label: "職務経歴", icon: Briefcase },
    { id: "skills" as TabId, label: "スキル・資格", icon: Code },
    { id: "languages" as TabId, label: "言語・受賞歴", icon: LanguagesIcon },
  ];
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10 mb-8">
          <div>
            <Heading>{resume.name_kanji}の履歴書</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              公開履歴書 • {new Date(resume.published_at).toLocaleDateString('ja-JP')} • Version {resume.version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm text-base-content/60">公開中</span>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-base-300 -mx-4 sm:mx-0">
            <div className="flex gap-2 sm:gap-4 overflow-x-auto px-4 sm:px-0 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base
                      ${activeTab === tab.id
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split('・')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* コンテンツエリア */}
        <div className="pb-12">
          {activeTab === "basic" && <ResumeBasicInfo resume={resume} />}
          {activeTab === "education" && <ResumeEducation resume={resume} />}
          {activeTab === "work" && <ResumeWorkExperience resume={resume} />}
          {activeTab === "skills" && <ResumeSkills resume={resume} />}
          {activeTab === "languages" && <ResumeLanguagesAwards resume={resume} />}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-zinc-950/10 dark:border-white/10 text-base-content/40 text-xs sm:text-sm">
          <p>Powered by Cafka</p>
        </div>
      </div>
      
      {/* Hide scrollbar for tab navigation */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
