/**
 * Career Importer Modal
 * 
 * 功能：從 MyCareer 匯入職歷到履歷書
 * - 顯示所有公司（按公司分組）
 * - 預覽職能變化軌跡
 * - 確認後轉換為 WorkExperience
 */

"use client";

import React, { useState, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Building2, Briefcase, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import type { Career } from "@/types/career";
import type { WorkExperience } from "@/types/resume";
import {
  groupCareersByCompany,
  convertCareersToWorkExperience,
  calculateTenure,
} from "@/libs/resume/career-converter";

interface CareerImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  careers: Career[];
  onImport: (workExperience: WorkExperience) => void;
}

export default function CareerImporterModal({
  isOpen,
  onClose,
  careers,
  onImport,
}: CareerImporterModalProps) {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // 按公司分組
  const companiesMap = useMemo(() => {
    return groupCareersByCompany(careers);
  }, [careers]);

  const companies = useMemo(() => {
    return Array.from(companiesMap.entries()).map(([name, careers]) => ({
      name,
      careers,
      tenure: calculateTenure(careers),
      positionCount: careers.length,
      isCurrent: careers.some(c => c.status === "current"),
    }));
  }, [companiesMap]);

  const handleImport = () => {
    if (!selectedCompany) return;

    const selectedCareers = companiesMap.get(selectedCompany);
    if (!selectedCareers) return;

    const workExperience = convertCareersToWorkExperience(
      selectedCareers,
      selectedCompany
    );

    onImport(workExperience);
    handleClose();
  };

  const handleClose = () => {
    setSelectedCompany(null);
    onClose();
  };

  const selectedCareerDetails = selectedCompany 
    ? companiesMap.get(selectedCompany) 
    : null;

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium leading-6 text-base-content">
                    💼 マイキャリアから職歴をインポート
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="btn btn-sm btn-circle btn-ghost"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Info Banner */}
                <div className="alert alert-info mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <div className="text-sm">
                    <p className="font-medium">会社名・期間・職種を自動入力します</p>
                    <p className="text-base-content/70 mt-1">
                      ※ 給与情報は含まれません / 職務内容・実績は後で追加してください
                    </p>
                  </div>
                </div>

                {/* Content */}
                {companies.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                    <p className="text-base-content/50 mb-2">
                      マイキャリアに職歴がありません
                    </p>
                    <p className="text-sm text-base-content/40">
                      先にマイキャリアで職歴を追加してください
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左側：公司列表 */}
                    <div>
                      <h3 className="text-sm font-semibold text-base-content/70 mb-3">
                        会社を選択
                      </h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {companies.map((company) => (
                          <button
                            key={company.name}
                            type="button"
                            onClick={() => setSelectedCompany(company.name)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              selectedCompany === company.name
                                ? "border-primary bg-primary/5"
                                : "border-base-300 hover:border-base-400 hover:bg-base-200/50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium text-base-content">
                                    {company.name}
                                  </h4>
                                  {company.isCurrent && (
                                    <span className="badge badge-success badge-xs">
                                      現職
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-base-content/60">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {company.tenure.displayText}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {company.positionCount}件の職歴
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 右側：職位詳細預覽 */}
                    <div>
                      <h3 className="text-sm font-semibold text-base-content/70 mb-3">
                        職能の変化
                      </h3>
                      {selectedCareerDetails ? (
                        <div className="bg-base-200/50 rounded-lg p-4 border border-base-300">
                          <div className="space-y-3">
                            {selectedCareerDetails
                              .sort((a, b) => 
                                new Date(a.startDate + "-01").getTime() - 
                                new Date(b.startDate + "-01").getTime()
                              )
                              .map((career, index) => (
                                <div
                                  key={career.id}
                                  className="flex items-start gap-3 p-3 bg-base-100 rounded-lg"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="w-4 h-4 text-base-content/50" />
                                      <h5 className="font-medium text-base-content text-sm">
                                        {career.position}
                                      </h5>
                                      {career.status === "current" && (
                                        <span className="badge badge-success badge-xs">
                                          現在
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-base-content/60 mt-1">
                                      {career.startDate} 〜 {career.endDate || "現在"}
                                    </p>
                                    {career.notes && (
                                      <p className="text-xs text-base-content/50 mt-2 line-clamp-2">
                                        💡 {career.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>

                          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                            <p className="text-xs text-base-content/70">
                              <strong>インポート後に追加が必要：</strong>
                              <br />
                              業種、部署、職務内容、担当業務、実績・成果
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-base-200/30 rounded-lg p-8 border border-dashed border-base-300 text-center">
                          <p className="text-sm text-base-content/50">
                            左側から会社を選択してください
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                {companies.length > 0 && (
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-base-300">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn btn-ghost"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={!selectedCompany}
                      className="btn btn-primary"
                    >
                      この会社の職歴をインポート
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}




