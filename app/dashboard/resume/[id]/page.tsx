"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, GraduationCap, Briefcase, Code, Languages as LanguagesIcon,
  Edit, Share2, Eye, EyeOff, ArrowLeft
} from "lucide-react";
import { Heading } from "@/components/catalyst/heading";
import ResumeBasicInfo from "@/components/resume/ResumeBasicInfo";
import ResumeEducation from "@/components/resume/ResumeEducation";
import ResumeWorkExperience from "@/components/resume/ResumeWorkExperience";
import ResumeSkills from "@/components/resume/ResumeSkills";
import ResumeLanguagesAwards from "@/components/resume/ResumeLanguagesAwards";
import type { Resume } from "@/types/resume";

type TabId = "basic" | "education" | "work" | "skills" | "languages";

export default function ResumeViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [resumeId, setResumeId] = useState<string>("");
  
  useEffect(() => {
    params.then((p) => setResumeId(p.id));
  }, [params]);
  
  useEffect(() => {
    if (!resumeId) return;
    
    fetch(`/api/resumes/${resumeId}`)
      .then(res => res.ok ? res.json() : null)
      .then(json => setResume(json?.data || null))
      .catch(() => setResume(null))
      .finally(() => setIsLoading(false));
  }, [resumeId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-semibold text-base-content mb-4">履歴書が見つかりません</h2>
        <button onClick={() => router.push('/dashboard/resume')} className="btn btn-primary">
          履歴書一覧に戻る
        </button>
      </div>
    );
  }
  
  const tabs = [
    { id: "basic" as TabId, label: "基本情報", icon: User },
    { id: "education" as TabId, label: "学歴", icon: GraduationCap },
    { id: "work" as TabId, label: "職務経歴", icon: Briefcase },
    { id: "skills" as TabId, label: "スキル・資格", icon: Code },
    { id: "languages" as TabId, label: "言語・受賞歴", icon: LanguagesIcon },
  ];
  
  const publicUrl = resume.is_public && resume.public_url_slug 
    ? `${window.location.origin}/r/${resume.public_url_slug}`
    : null;
  const isExpired = resume.public_expires_at && new Date(resume.public_expires_at) < new Date();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push('/dashboard/resume')}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Heading>{resume.resume_name || "履歴書"}</Heading>
            </div>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6 ml-12">
              {resume.name_kanji}の履歴書
              {resume.internal_memo && (
                <span className="ml-2 text-xs">• {resume.internal_memo.split('\n')[0]}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 公開状態 */}
            {resume.is_public && !isExpired ? (
              <div className="flex items-center gap-2 text-success">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">公開中</span>
              </div>
            ) : isExpired ? (
              <div className="flex items-center gap-2 text-error">
                <EyeOff className="w-5 h-5" />
                <span className="text-sm font-medium">期限切れ</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-base-content/40">
                <EyeOff className="w-5 h-5" />
                <span className="text-sm font-medium">非公開</span>
              </div>
            )}
            
            {/* 公開ページへ */}
            {publicUrl && !isExpired && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost gap-2"
              >
                <Share2 className="w-4 h-4" />
                公開ページ
              </a>
            )}
            
            {/* 編集ボタン */}
            <button
              onClick={() => router.push(`/dashboard/resume/edit?id=${resume.id}`)}
              className="btn btn-primary gap-2"
            >
              <Edit className="w-5 h-5" />
              編集
            </button>
          </div>
        </div>
        
        {/* 内部メモ（完全版） */}
        {resume.internal_memo && (
          <div className="alert alert-info mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-sm whitespace-pre-line">
              <strong>内部メモ:</strong>
              <p className="mt-1">{resume.internal_memo}</p>
            </div>
          </div>
        )}
        
        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="tabs tabs-boxed bg-base-200 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* コンテンツエリア */}
        <div className="pb-12">
          {activeTab === "basic" && <ResumeBasicInfo resume={resume} />}
          {activeTab === "education" && <ResumeEducation education={resume.education} />}
          {activeTab === "work" && <ResumeWorkExperience workExperience={resume.work_experience} />}
          {activeTab === "skills" && <ResumeSkills skills={resume.skills} certifications={resume.certifications} />}
          {activeTab === "languages" && <ResumeLanguagesAwards languages={resume.languages} awards={resume.awards} />}
        </div>
        
        {/* フッター */}
        <div className="border-t border-zinc-950/10 pt-8 mt-12 text-center">
          <p className="text-sm text-base-content/50">
            最終更新: {new Date(resume.updated_at).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

