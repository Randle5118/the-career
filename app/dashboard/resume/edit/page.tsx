"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResume } from "@/libs/hooks/useResume";
import { useSingleResume } from "@/libs/hooks/useSingleResume";
import { Heading } from "@/components/catalyst/heading";
import { TabList } from "@/components/forms/TabComponents";
import { Save, X, FileUp } from "lucide-react";
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
import PdfImporterModal from "@/components/resume/PdfImporterModal";

type TabId =
  | "basic"
  | "education"
  | "work"
  | "skills"
  | "languages"
  | "preferences"
  | "settings";

// AI 解析回傳格式
interface ParserResponse {
  name_kanji: string | null;
  name_kana: string | null;
  name_romaji: string | null;
  birth_date: string | null; // YYYY-MM-DD
  age: number | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address_line: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  career_summary: string | null;
  self_pr: string | null;

  education: {
    school_name: string;
    major: string;
    date: string; // YYYY-MM
    comment?: string | null;
  }[];

  work_experience: {
    company_name: string;
    is_current: boolean;
    start_date: string; // YYYY-MM
    end_date: string | null;
    description: string | null;
    positions: {
      title: string;
      start_date: string;
      end_date: string | null;
      is_current: boolean;
      comment: string | null;
    }[];
  }[];

  skills: {
    category: string;
    items: string[];
  }[];

  languages: {
    name: string;
    level: string;
  }[];

  certifications: {
    name: string;
    date: string;
  }[];

  awards: {
    title: string;
    date: string;
    organization: string;
  }[];
}

export default function ResumeEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  // URLパラメータでIDが指定されている場合はuseSingleResume、そうでなければuseResume (主要履歴書)
  const primaryResumeHook = useResume();
  const singleResumeHook = useSingleResume(resumeId || undefined);

  // どちらのhookを使うか決定
  const useHook = resumeId ? singleResumeHook : primaryResumeHook;
  const { resume: originalResume, updateResume, isLoading } = useHook;

  // isSavingはhookによって異なる名前で提供される
  const hookIsSaving =
    "isSaving" in useHook
      ? useHook.isSaving
      : "isUpdating" in useHook
      ? useHook.isUpdating
      : false;

  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [formData, setFormData] = useState<Resume | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false);

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
    if (field === "photo_file") {
      setPhotoFile(value);
      return;
    }

    setFormData({
      ...formData,
      [field]: value,
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
          const errorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : "写真のアップロードに失敗しました";
          toast.error(errorMessage);
          throw uploadError; // エラーを再スローし、後続の履歴書更新を阻止
        }
      }

      // 2. 履歴書を更新（新しいphoto_urlを含む）
      // システムフィールドをクリーンアップし、更新が許可されたフィールドのみ送信
      // 注意: is_public, public_url_slug, internal_memo, public_expires_at は更新可能
      const {
        id,
        user_id,
        is_primary,
        completeness,
        created_at,
        updated_at,
        version,
        ...cleanFormData
      } = formData;

      // null値をクリーンアップし、undefinedまたは空文字列に変換
      const cleanedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(cleanFormData)) {
        if (value === null) {
          // URLフィールドの場合、nullを空文字列に変換
          if (key.includes("_url")) {
            cleanedData[key] = "";
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
        photo_url: photoUrl || "",
      } as typeof cleanFormData);

      // 4. 公開設定がONの場合、または公開スラッグが変更された場合、published_resumesも同期更新
      // これを行わないと、resumesテーブルだけ更新されて公開ページ(published_resumes)が更新されない
      if (formData.is_public) {
        try {
          // トーストを出さずにバックグラウンドで同期
          const publishResponse = await fetch(`/api/resumes/${id}/publish`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              is_public: true,
              public_url_slug: formData.public_url_slug,
              public_expires_at: formData.public_expires_at,
            }),
          });

          if (!publishResponse.ok) {
            console.warn("[ResumeEdit] Failed to sync published resume");
          } else {
            console.log("[ResumeEdit] Published resume synced successfully");
          }
        } catch (pubError) {
          console.error(
            "[ResumeEdit] Error syncing published resume:",
            pubError
          );
        }
      }

      // 3. 成功後に写真ファイルの状態をクリア
      setPhotoFile(null);

      // updateResume hookが既にtoastを表示するため、ここでは重複表示不要
      router.push("/dashboard/resume");
    } catch (error) {
      console.error("[ResumeEdit] Save error:", error);
      // エラーメッセージはアップロード段階で既に表示されているため、ここでは履歴書更新エラーのみ処理
      if (
        !photoFile ||
        !(error instanceof Error && error.message.includes("アップロード"))
      ) {
        toast.error(
          "保存に失敗しました: " +
            (error instanceof Error ? error.message : "不明なエラー")
        );
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPdfImportOpen(true)}
              className="btn btn-outline btn-sm"
            >
              <FileUp className="w-4 h-4" />
              PDFから取り込み
            </button>
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
              onChange={(education) =>
                handleFieldChange("education", education)
              }
            />
          )}

          {activeTab === "work" && (
            <ResumeWorkExperienceForm
              workExperience={formData.work_experience}
              onChange={(workExperience) =>
                handleFieldChange("work_experience", workExperience)
              }
            />
          )}

          {activeTab === "skills" && (
            <ResumeSkillsForm
              skills={formData.skills}
              certifications={formData.certifications}
              onSkillsChange={(skills) => handleFieldChange("skills", skills)}
              onCertificationsChange={(certifications) =>
                handleFieldChange("certifications", certifications)
              }
            />
          )}

          {activeTab === "languages" && (
            <ResumeLanguagesAwardsForm
              languages={formData.languages}
              awards={formData.awards}
              onLanguagesChange={(languages) =>
                handleFieldChange("languages", languages)
              }
              onAwardsChange={(awards) => handleFieldChange("awards", awards)}
            />
          )}

          {activeTab === "preferences" && (
            <ResumePreferencesForm
              preferences={formData.preferences}
              onChange={(preferences) =>
                handleFieldChange("preferences", preferences)
              }
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

      {/* PDF Import Modal */}
      <PdfImporterModal
        isOpen={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        onAnalysisComplete={(data: ParserResponse) => {
          console.log("[ResumeEdit] PDF Analysis completed:", data);

          if (!formData) return;

          // 深度合併資料
          const newFormData: Resume = {
            ...formData,
            // 基本資料 - 確保字串欄位不為 null
            name_kanji: data.name_kanji ?? formData.name_kanji ?? "",
            name_kana: data.name_kana ?? formData.name_kana ?? "",
            name_romaji: data.name_romaji ?? formData.name_romaji ?? "",
            birth_date: data.birth_date ?? formData.birth_date ?? "",
            age: data.age !== null ? data.age : formData.age, // age 允許 null (在 Form 中處理)
            gender: data.gender ?? formData.gender ?? "",
            phone: data.phone ?? formData.phone ?? "",
            email: data.email ?? formData.email ?? "",
            address_line: data.address_line ?? formData.address_line ?? "",

            // 連結
            linkedin_url: data.linkedin_url ?? formData.linkedin_url ?? "",
            github_url: data.github_url ?? formData.github_url ?? "",
            portfolio_url: data.portfolio_url ?? formData.portfolio_url ?? "",

            // 自我介紹
            career_summary:
              data.career_summary ?? formData.career_summary ?? "",
            self_pr: data.self_pr ?? formData.self_pr ?? "",

            // 複雜陣列資料...
            education:
              data.education && data.education.length > 0
                ? data.education.map((edu) => ({
                    id: crypto.randomUUID(),
                    school_name: edu.school_name,
                    major: edu.major,
                    date: edu.date,
                    comment: edu.comment || undefined,
                  }))
                : formData.education,

            work_experience:
              data.work_experience && data.work_experience.length > 0
                ? data.work_experience.map((work) => ({
                    id: crypto.randomUUID(),
                    company_name: work.company_name,
                    industry: work.industry || undefined,
                    start_date: work.start_date,
                    end_date: work.end_date,
                    is_current: work.is_current,
                    description: work.description || "",
                    positions:
                      work.positions && work.positions.length > 0
                        ? work.positions.map((pos) => ({
                            id: crypto.randomUUID(),
                            title: pos.title,
                            start_date: pos.start_date,
                            end_date: pos.end_date,
                            is_current: pos.is_current,
                            comment: pos.comment || "",
                          }))
                        : [], // 空陣列，不預設建立 position
                  }))
                : formData.work_experience,

            skills:
              data.skills && data.skills.length > 0
                ? data.skills.map((skill) => ({
                    category: skill.category,
                    items: skill.items,
                  }))
                : formData.skills,

            languages:
              data.languages && data.languages.length > 0
                ? data.languages.map((lang) => ({
                    name: lang.name,
                    level: lang.level,
                  }))
                : formData.languages,

            certifications:
              data.certifications && data.certifications.length > 0
                ? data.certifications.map((cert) => ({
                    name: cert.name,
                    date: cert.date,
                  }))
                : formData.certifications,

            awards:
              data.awards && data.awards.length > 0
                ? data.awards.map((award) => ({
                    title: award.title,
                    date: award.date,
                    organization: award.organization,
                  }))
                : formData.awards,
          };

          setFormData(newFormData);
          toast.success("AI解析データを反映しました。内容を確認してください。");
          setIsPdfImportOpen(false);
        }}
      />
    </form>
  );
}
