"use client";

import React, { useState, useEffect } from "react";
import type { 
  Application, 
  ApplicationFormData, 
  ApplicationStatus,
  EmploymentType,
  ApplicationMethod,
  InterviewMethod
} from "@/types/application";
import Modal from "./Modal";
import {
  FormField,
  FormSelect,
  FormTextarea,
  FormTags,
  ApplicationMethodInput,
  InterviewMethodInput
} from "@/components/forms";

interface ApplicationModalProps {
  isOpen: boolean;
  application?: Application | null;
  initialData?: Partial<ApplicationFormData>; // PDF解析データを受け取る
  onClose: () => void;
  onSave: (data: ApplicationFormData) => void;
}

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: "bookmarked", label: "ブックマーク" },
  { value: "applied", label: "応募済み" },
  { value: "interview", label: "面接" },
  { value: "offer", label: "内定" },
  { value: "rejected", label: "不採用・辞退" },
];

const employmentTypeOptions: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "正社員" },
  { value: "contract", label: "契約社員" },
  { value: "part_time", label: "パート・アルバイト" },
  { value: "dispatch", label: "派遣" },
];

const initialFormData: ApplicationFormData = {
  companyName: "",
  companyUrl: "",
  position: "",
  status: "bookmarked",
  employmentType: "full_time",
  applicationMethod: {
    type: "job_site",
    siteName: "",
    siteUrl: "",
    scoutType: "direct",
    recruiterName: "",
    recruiterCompany: "",
    scoutName: "",
    scoutCompany: "",
    scoutEmail: "",
    memo: "",
  },
  tags: [],
  notes: "",
  desiredSalary: "",
};

/**
 * 應募情報の追加・編集モーダル
 * 簡化版：直接使用基礎表單組件
 */
export default function ApplicationModal({
  isOpen,
  application,
  initialData,
  onClose,
  onSave,
}: ApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // 載入應募資料 or PDF解析データ
  useEffect(() => {
    if (application) {
      // 確保 applicationMethod 有完整的資料結構
      let applicationMethod = application.applicationMethod;
      
      // 如果 applicationMethod 存在但缺少必填欄位，補上預設值
      if (applicationMethod) {
        if (applicationMethod.type === "job_site") {
          applicationMethod = {
            type: "job_site",
            siteName: applicationMethod.siteName || "",
            siteUrl: applicationMethod.siteUrl || "",
            scoutType: applicationMethod.scoutType || "direct",
            recruiterName: applicationMethod.recruiterName || "",
            recruiterCompany: applicationMethod.recruiterCompany || "",
            scoutName: applicationMethod.scoutName || "",
            scoutCompany: applicationMethod.scoutCompany || "",
            scoutEmail: applicationMethod.scoutEmail || "",
            memo: applicationMethod.memo || "",
          };
        }
        // referral 和 direct 也使用完整的資料
      } else {
        // 如果完全沒有 applicationMethod，使用預設值
        applicationMethod = {
          type: "job_site",
          siteName: "",
          siteUrl: "",
          scoutType: "direct",
          recruiterName: "",
          recruiterCompany: "",
          scoutName: "",
          scoutCompany: "",
          scoutEmail: "",
          memo: "",
        };
      }
      
      setFormData({
        companyName: application.companyName,
        companyUrl: application.companyUrl || "",
        position: application.position,
        status: application.status,
        employmentType: application.employmentType,
        applicationMethod,
        postedSalary: application.postedSalary,
        desiredSalary: application.desiredSalary?.toString() || "",
        tags: application.tags || [],
        notes: application.notes || "",
        schedule: application.schedule,
      });
      
    } else if (initialData) {
      // PDF解析データから初期化
      setFormData({
        ...initialFormData,
        ...initialData,
        // applicationMethod を確実にマージ
        applicationMethod: initialData.applicationMethod || initialFormData.applicationMethod,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [application, initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof ApplicationFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleApplicationMethodChange = (method: ApplicationMethod) => {
    setFormData((prev) => ({
      ...prev,
      applicationMethod: method,
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
  };

  const handleInterviewMethodChange = (interviewMethod: InterviewMethod | null) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        interviewMethod,
      },
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "会社名は必須です";
    }
    if (!formData.position.trim()) {
      newErrors.position = "職種は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      onSave(formData);
      handleClose();
    } catch (error) {
      console.error("保存エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const tabs = [
    { id: 'basic', label: '基本情報' },
    { id: 'method', label: '応募方法' },
    { id: 'salary', label: '給与情報' },
    { id: 'schedule', label: '日程管理' },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={application ? "応募情報を編集" : "新しい応募を追加"}
    >
      <form onSubmit={handleSubmit}>
        {/* タブナビゲーション */}
        <div className="border-b border-base-300 mb-6">
          <div className="flex gap-4">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-primary text-primary'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="space-y-6 min-h-[400px]">
          {/* Tab 1: 基本情報 */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="会社名"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="例: 株式会社サンプル"
                  required
                  error={errors.companyName}
                />

                <FormField
                  label="職種"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="例: フロントエンドエンジニア"
                  required
                  error={errors.position}
                />
              </div>

              <FormField
                label="会社URL"
                name="companyUrl"
                type="url"
                value={formData.companyUrl || ""}
                onChange={handleChange}
                placeholder="https://www.example.com"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="ステータス"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                  required
                />

                <FormSelect
                  label="雇用形態"
                  name="employmentType"
                  value={formData.employmentType || "full_time"}
                  onChange={handleChange}
                  options={employmentTypeOptions}
                />
              </div>

              <div className="border-t border-base-300 pt-4 mt-6">
                <FormTags
                  label="タグ"
                  value={(formData.tags || []).join(", ")}
                  onChange={(value) => {
                    const tags = value ? value.split(",").map(tag => tag.trim()).filter(Boolean) : [];
                    handleTagsChange(tags);
                  }}
                  placeholder="例: リモート可, React"
                />

                <div className="mt-4">
                  <FormTextarea
                    label="メモ"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleChange}
                    placeholder="応募に関するメモを入力..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 応募方法 */}
          {activeTab === 1 && (
            <ApplicationMethodInput
              value={formData.applicationMethod}
              onChange={handleApplicationMethodChange}
            />
          )}

          {/* Tab 3: 給与情報 */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="掲載給与(下限)"
                  name="postedSalaryMin"
                  type="number"
                  value={formData.postedSalary?.minAnnualSalary?.toString() || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    postedSalary: {
                      ...prev.postedSalary,
                      minAnnualSalary: e.target.value ? Number(e.target.value) : undefined
                    }
                  }))}
                  placeholder="例: 600"
                  helpText="万円"
                />

                <FormField
                  label="掲載給与(上限)"
                  name="postedSalaryMax"
                  type="number"
                  value={formData.postedSalary?.maxAnnualSalary?.toString() || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    postedSalary: {
                      ...prev.postedSalary,
                      maxAnnualSalary: e.target.value ? Number(e.target.value) : undefined
                    }
                  }))}
                  placeholder="例: 800"
                  helpText="万円"
                />
              </div>

              <FormTextarea
                label="給与備考"
                name="postedSalaryNotes"
                value={formData.postedSalary?.notes || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  postedSalary: {
                    ...prev.postedSalary,
                    notes: e.target.value
                  }
                }))}
                placeholder="例: 経験・スキルに応じて優遇"
                rows={2}
              />

              <FormField
                label="希望年収"
                name="desiredSalary"
                type="number"
                value={formData.desiredSalary || ""}
                onChange={handleChange}
                placeholder="例: 750"
                helpText="万円"
              />
            </div>
          )}

          {/* Tab 4: 日程管理 */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <FormField
                label="次回イベント"
                name="nextEvent"
                value={formData.schedule?.nextEvent || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, nextEvent: e.target.value }
                }))}
                placeholder="例: 最終面接、書類提出"
              />

              <FormField
                label="期日(時間)"
                name="deadline"
                type="datetime-local"
                value={formData.schedule?.deadline || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, deadline: e.target.value }
                }))}
              />

              <InterviewMethodInput
                value={formData.schedule?.interviewMethod || null}
                onChange={handleInterviewMethodChange}
              />
            </div>
          )}
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3 pt-6 border-t border-base-300 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              application ? "更新" : "追加"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
