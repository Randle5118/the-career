"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResume } from "@/libs/hooks/useResume";
import { Heading } from "@/components/catalyst/heading";
import { TabList } from "@/components/forms/TabComponents";
import { FileText, Edit, Share2 } from "lucide-react";
import ResumeBasicInfo from "@/components/resume/ResumeBasicInfo";
import ResumeEducation from "@/components/resume/ResumeEducation";
import ResumeWorkExperience from "@/components/resume/ResumeWorkExperience";
import ResumeSkills from "@/components/resume/ResumeSkills";
import ResumeLanguagesAwards from "@/components/resume/ResumeLanguagesAwards";
import ResumePreferences from "@/components/resume/ResumePreferences";

type TabId = "basic" | "education" | "work" | "skills" | "languages" | "preferences";

export default function ResumePage() {
  const router = useRouter();
  const { resume, completeness, isLoading, publishResume, isUpdating } = useResume();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  
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
  
  const handleCreate = () => {
    router.push("/dashboard/resume/create");
  };
  
  const handlePublish = async () => {
    try {
      await publishResume(false); // 預設不公開,只發布
      setShowPublishDialog(false);
    } catch (error) {
      // Error already handled in hook
    }
  };
  
  const handlePublishPublic = async () => {
    try {
      await publishResume(true); // 公開發布
      setShowPublishDialog(false);
    } catch (error) {
      // Error already handled in hook
    }
  };
  
  // Loading 狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  // 空狀態 - 尚未建立履歷
  if (!resume) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
            <div>
              <Heading>履歴書</Heading>
              <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
                あなたの履歴書を作成しましょう
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
            <FileText className="w-20 h-20 text-base-content/20 mb-6" />
            <h3 className="text-2xl font-semibold mb-3 text-base-content">
              まだ履歴書がありません
            </h3>
            <p className="text-base-content/60 mb-8 text-center max-w-md">
              履歴書を作成して、あなたのキャリアをアピールしましょう。<br />
              基本情報から始めて、後で詳細を追加できます。
            </p>
            <button 
              onClick={handleCreate}
              className="btn btn-primary btn-lg gap-2"
            >
              <FileText className="w-5 h-5" />
              履歴書を作成する
            </button>
          </div>
        </div>
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
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowPublishDialog(true)}
              className="btn btn-outline gap-2"
              disabled={isUpdating}
            >
              <Share2 className="w-5 h-5" />
              公開する
            </button>
            <button 
              onClick={handleEdit}
              className="btn btn-primary gap-2"
            >
              <Edit className="w-5 h-5" />
              編集する
            </button>
          </div>
        </div>
        
        {/* 公開ダイアログ */}
        {showPublishDialog && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">履歴書を公開</h3>
              <p className="text-base-content/70 mb-6">
                履歴書を公開しますか？公開設定を選択してください。
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold">非公開発行</p>
                    <p>自分だけが見れる発行版を作成します</p>
                  </div>
                </div>
                
                <div className="alert alert-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold">公開発行</p>
                    <p>URLを知っている人は誰でも見ることができます</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-action">
                <button
                  onClick={() => setShowPublishDialog(false)}
                  className="btn btn-ghost"
                  disabled={isUpdating}
                >
                  キャンセル
                </button>
                <button
                  onClick={handlePublish}
                  className="btn btn-outline"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "非公開で発行"
                  )}
                </button>
                <button
                  onClick={handlePublishPublic}
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "公開で発行"
                  )}
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setShowPublishDialog(false)}>close</button>
            </form>
          </dialog>
        )}
        
        {/* タブナビゲーション */}
        <div className="mb-6">
          <TabList
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
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

