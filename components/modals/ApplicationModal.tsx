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
  onClose,
  onSave,
}: ApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  
  // 載入應募資料
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
      
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [application, isOpen]);

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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={application ? "応募情報を編集" : "新しい応募を追加"}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報 */}
        <section className="bg-base-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-base-content mb-2 pb-2 border-b border-base-300">
            基本情報
          </h3>
          
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
          </div>
        </section>

        {/* 應募方法 */}
        <section className="bg-base-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-base-content mb-2 pb-2 border-b border-base-300">
            応募方法
          </h3>
          <ApplicationMethodInput
            value={formData.applicationMethod}
            onChange={handleApplicationMethodChange}
          />
        </section>

        {/* 日程管理 */}
        <section className="bg-base-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-base-content mb-2 pb-2 border-b border-base-300">
            日程管理
          </h3>
          
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
        </section>

        {/* タグとメモ */}
        <section className="bg-base-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-base-content mb-2 pb-2 border-b border-base-300">
            タグとメモ
          </h3>
          
          <div className="space-y-4">
            <FormTags
              label="タグ"
              value={(formData.tags || []).join(", ")}
              onChange={(value) => {
                const tags = value ? value.split(",").map(tag => tag.trim()).filter(Boolean) : [];
                handleTagsChange(tags);
              }}
              placeholder="例: リモート可, React"
            />

            <FormTextarea
              label="メモ"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="応募に関するメモを入力..."
              rows={4}
            />
          </div>
        </section>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3 pt-6 border-t border-base-300">
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
