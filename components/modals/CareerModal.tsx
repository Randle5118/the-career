"use client";

import React, { useState, useEffect } from "react";
import type { Career, CareerFormData, SalaryChange, SalaryComponent, Currency, OfferSalary } from "@/types/career";
import Modal from "./Modal";
import { Trash2, Plus } from "lucide-react";
import {
  FormField,
  FormSelect,
  FormTextarea,
  FormTags,
  SalaryBreakdownInput,
  CareerDateRangeInput,
  type SelectOption
} from "@/components/forms";

interface CareerModalProps {
  isOpen: boolean;
  career: Career | null;
  onClose: () => void;
  onSave: (data: CareerFormData, salaryHistory: SalaryChange[], offerSalary?: OfferSalary) => void;
}

const employmentTypeOptions: SelectOption[] = [
  { value: "full_time", label: "正社員" },
  { value: "contract", label: "契約社員" },
  { value: "temporary", label: "派遣社員" },
  { value: "part_time", label: "パート・アルバイト" },
  { value: "freelance", label: "フリーランス" },
  { value: "side_job", label: "副業" },
];

const statusOptions: SelectOption[] = [
  { value: "current", label: "現職" },
  { value: "left", label: "退職" },
];

/**
 * 職務経歴の追加・編集モーダル
 * 簡化版：直接使用基礎表單組件
 */
const CareerModal: React.FC<CareerModalProps> = ({ isOpen, career, onClose, onSave }) => {
  const [formData, setFormData] = useState<CareerFormData>({
    companyName: "",
    position: "",
    status: "current",
    startDate: "",
    endDate: "",
    employmentType: "full_time",
    tags: "",
    notes: "",
  });

  const [salaryHistory, setSalaryHistory] = useState<SalaryChange[]>([]);
  const [offerSalary, setOfferSalary] = useState<OfferSalary | null>(null);

  useEffect(() => {
    if (career) {
      setFormData({
        companyName: career.companyName,
        position: career.position,
        status: career.status,
        startDate: career.startDate,
        endDate: career.endDate || "",
        employmentType: career.employmentType,
        tags: career.tags?.join(", ") || "",
        notes: career.notes || "",
      });
      
      setSalaryHistory(career.salaryHistory || []);
      setOfferSalary(career.offerSalary || null);
    } else {
      setFormData({
        companyName: "",
        position: "",
        status: "current",
        startDate: "",
        endDate: "",
        employmentType: "full_time",
        tags: "",
        notes: "",
      });
      
      setSalaryHistory([]);
      setOfferSalary(null);
    }
  }, [career, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, salaryHistory, offerSalary || undefined);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (value: string) => {
    setFormData(prev => ({ ...prev, tags: value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrentJobToggle = (isCurrent: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      status: isCurrent ? "current" : "left",
      endDate: isCurrent ? "" : prev.endDate
    }));
  };

  // Salary history handlers
  const addSalaryHistory = () => {
    setSalaryHistory(prev => [...prev, {
      yearMonth: "",
      currency: "JPY",
      salaryBreakdown: [{ salary: 0, salaryType: "" }],
      position: "",
      notes: ""
    }]);
  };

  const updateSalaryHistory = (index: number, field: keyof SalaryChange, value: any) => {
    setSalaryHistory(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeSalaryHistory = (index: number) => {
    setSalaryHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={career ? "職務経歴を編集" : "職務経歴を追加"}
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
              placeholder="例: 株式会社メルカリ"
              required
            />
            <FormField
              label="職種・ポジション"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="例: フロントエンドエンジニア"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="雇用形態"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              options={employmentTypeOptions}
              required
            />
            <FormSelect
              label="ステータス"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              required
            />
          </div>

          <CareerDateRangeInput
            startDate={formData.startDate}
            endDate={formData.endDate}
            onStartDateChange={(date) => handleDateChange('startDate', date)}
            onEndDateChange={(date) => handleDateChange('endDate', date)}
            onEndDateToggle={handleCurrentJobToggle}
            isCurrent={formData.status === "current"}
          />

          <FormTags
            label="タグ"
            value={formData.tags}
            onChange={handleTagsChange}
            placeholder="例: React, TypeScript, フルリモート"
            helpText="カンマ区切りで複数のタグを入力"
          />

            <FormTextarea
              label="メモ"
              value={formData.notes}
              onChange={handleChange}
              name="notes"
              placeholder="職務内容や成果など"
              rows={3}
            />
          </div>
        </section>

        {/* Offer Salary Section */}
        <section className="bg-base-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-base-300">
            <h3 className="text-lg font-semibold text-base-content">オファー給与情報</h3>
            {offerSalary ? (
              <button
                type="button"
                onClick={() => setOfferSalary(null)}
                className="btn btn-sm btn-ghost text-error"
              >
                削除
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOfferSalary({
                  currency: "JPY",
                  salaryBreakdown: [{ salary: 0, salaryType: "" }],
                  notes: ""
                })}
                className="btn btn-sm btn-ghost text-primary"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            )}
          </div>

          {offerSalary && (
            <div className="space-y-4">
              <SalaryBreakdownInput
                salaryBreakdown={offerSalary.salaryBreakdown}
                currency={offerSalary.currency}
                onChange={(breakdown) => setOfferSalary({
                  ...offerSalary,
                  salaryBreakdown: breakdown
                })}
              />

              <FormTextarea
                label="オファー備考"
                name="offerSalaryNotes"
                value={offerSalary.notes || ""}
                onChange={(e) => setOfferSalary({
                  ...offerSalary,
                  notes: e.target.value
                })}
                placeholder="残業代やその他の給与条件など"
                rows={2}
              />
            </div>
          )}
        </section>

        {/* Salary History Section */}
        <section className="bg-base-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-base-300">
            <h3 className="text-lg font-semibold text-base-content">給与履歴</h3>
            <button
              type="button"
              onClick={addSalaryHistory}
              className="btn btn-sm btn-ghost text-primary"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          <div className="space-y-4">
            {salaryHistory.map((change, index) => (
            <div key={index} className="rounded-lg space-y-4 pb-4 border-b border-base-300">
              <div className="flex items-center justify-between">
                <span className="font-medium">給与履歴 #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeSalaryHistory(index)}
                  className="btn btn-sm btn-ghost text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="年月"
                  name={`salaryHistory-${index}-yearMonth`}
                  type="text"
                  value={change.yearMonth}
                  onChange={(e) => updateSalaryHistory(index, "yearMonth", e.target.value)}
                  placeholder="YYYY-MM"
                />
                <FormField
                  label="役職"
                  name={`salaryHistory-${index}-position`}
                  value={change.position || ""}
                  onChange={(e) => updateSalaryHistory(index, "position", e.target.value)}
                  placeholder="役職・ポジション"
                />
              </div>

              <SalaryBreakdownInput
                salaryBreakdown={change.salaryBreakdown}
                currency={change.currency}
                onChange={(breakdown) => updateSalaryHistory(index, "salaryBreakdown", breakdown)}
              />

              <FormTextarea
                label="備考"
                name={`salaryHistory-${index}-notes`}
                value={change.notes || ""}
                onChange={(e) => updateSalaryHistory(index, "notes", e.target.value)}
                placeholder="昇給理由やその他の備考"
                rows={2}
              />
            </div>
            ))}
          </div>
        </section>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-base-300">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {career ? "更新" : "追加"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CareerModal;
