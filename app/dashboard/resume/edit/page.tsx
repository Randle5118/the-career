"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResume } from "@/libs/hooks/useResume";
import { useSingleResume } from "@/libs/hooks/useSingleResume";
import { Heading } from "@/components/catalyst/heading";
import { TabList } from "@/components/forms/TabComponents";
import { Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import type { Resume } from "@/types/resume";
import { uploadResumePhoto } from "@/libs/storage/resume-image";
import ResumeBasicInfoForm from "@/components/resume/forms/ResumeBasicInfoForm";
import ResumeEducationForm from "@/components/resume/forms/ResumeEducationForm";
import ResumeWorkExperienceForm from "@/components/resume/forms/ResumeWorkExperienceForm";
import ResumeSkillsForm from "@/components/resume/forms/ResumeSkillsForm";
import ResumeLanguagesAwardsForm from "@/components/resume/forms/ResumeLanguagesAwardsForm";
import ResumePreferencesForm from "@/components/resume/forms/ResumePreferencesForm";
import ResumeSettingsForm from "@/components/resume/forms/ResumeSettingsForm";

type TabId = "basic" | "education" | "work" | "skills" | "languages" | "preferences" | "settings";

export default function ResumeEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  
  // URLパラメータでIDが指定されている場合はuseSingleResume、そうでなければuseResume (主要履歴書)
  const primaryResumeHook = useResume();
  const singleResumeHook = useSingleResume(resumeId || undefined);
  
  // どちらのhookを使うか決定
  const useHook = resumeId ? singleResumeHook : primaryResumeHook;
  const {
    resume: originalResume,
    updateResume,
    isLoading,
  } = useHook;
  
  // isSavingはhookによって異なる名前で提供される
  const hookIsSaving = 'isSaving' in useHook ? useHook.isSaving : ('isUpdating' in useHook ? useHook.isUpdating : false);
  
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [formData, setFormData] = useState<Resume | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // originalResumeの読み込み完了時にformDataに同期
  useEffect(() => {
    if (originalResume) {
      setFormData(originalResume);
    }
  }, [originalResume]);
  
  // Tab設定
  const tabs = [
    { id: "basic" as TabId, label: "基本情報" },
    { id: "education" as TabId, label: "学歴" },
    { id: "work" as TabId, label: "職務経歴" },
    { id: "skills" as TabId, label: "スキル・資格" },
    { id: "languages" as TabId, label: "言語・受賞歴" },
    { id: "preferences" as TabId, label: "希望条件" },
    { id: "settings" as TabId, label: "設定" },
  ];
  
  const handleFieldChange = (field: string, value: any) => {
    if (!formData) return;
    
    // 写真ファイルの場合、特別な処理
    if (field === 'photo_file') {
      setPhotoFile(value);
      return;
    }
    
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
    
    try {
      // 1. 新しい写真がある場合、先にアップロード
      let photoUrl = formData.photo_url;
      if (photoFile) {
        toast.loading("写真をアップロード中...");
        try {
          photoUrl = await uploadResumePhoto(photoFile);
          toast.dismiss();
          toast.success("写真をアップロードしました");
        } catch (uploadError) {
          toast.dismiss();
          // アップロードエラーはuploadResumePhoto内で処理され、ユーザーフレンドリーなエラーメッセージが投げられる
          const errorMessage = uploadError instanceof Error 
            ? uploadError.message 
            : "写真のアップロードに失敗しました";
          toast.error(errorMessage);
          throw uploadError; // エラーを再スローし、後続の履歴書更新を阻止
        }
      }
      
      // 2. 履歴書を更新（新しいphoto_urlを含む）
      // システムフィールドをクリーンアップし、更新が許可されたフィールドのみ送信
      // 注意: is_public, public_url_slug, internal_memo, public_expires_at は更新可能
      const { id, user_id, is_primary, completeness, created_at, updated_at, version, ...cleanFormData } = formData;
      
      // null値をクリーンアップし、undefinedまたは空文字列に変換
      const cleanedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(cleanFormData)) {
        if (value === null) {
          // URLフィールドの場合、nullを空文字列に変換
          if (key.includes('_url')) {
            cleanedData[key] = '';
          } else {
            // その他のフィールドはスキップ
            continue;
          }
        } else {
          cleanedData[key] = value;
        }
      }
      
      await updateResume({
        ...cleanedData,
        photo_url: photoUrl || ''
      } as typeof cleanFormData);
      
      // 3. 成功後に写真ファイルの状態をクリア
      setPhotoFile(null);
      
      // updateResume hookが既にtoastを表示するため、ここでは重複表示不要
      router.push("/dashboard/resume");
    } catch (error) {
      console.error("[ResumeEdit] Save error:", error);
      // エラーメッセージはアップロード段階で既に表示されているため、ここでは履歴書更新エラーのみ処理
      if (!photoFile || !(error instanceof Error && error.message.includes('アップロード'))) {
        toast.error("保存に失敗しました: " + (error instanceof Error ? error.message : '不明なエラー'));
      }
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
              disabled={hookIsSaving}
            >
              <X className="w-5 h-5 mr-2" />
              キャンセル
            </button>
            
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={hookIsSaving}
            >
              {hookIsSaving ? (
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
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
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
        
        {activeTab === "settings" && (
          <ResumeSettingsForm
            resume={formData}
            onChange={handleFieldChange}
          />
        )}
      </div>
        
        {/* 固定保存ボタン（モバイル用） */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <button 
            type="submit"
            className="btn btn-primary btn-lg shadow-lg"
            disabled={hookIsSaving}
          >
            {hookIsSaving ? (
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

