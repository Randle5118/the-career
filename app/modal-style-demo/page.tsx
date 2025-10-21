"use client";

import React, { useState } from "react";
import { CareerEditModal } from "@/components/modals/CareerEditModal";
import ApplicationModal from "@/components/modals/ApplicationModal";
import type { Career, CareerFormData, SalaryChange, OfferSalary } from "@/types/career";
import type { Application, ApplicationFormData } from "@/types/application";

export default function ModalStyleDemo() {
  const [careerModalOpen, setCareerModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  // 模擬的職歴數據
  const mockCareer: Career = {
    id: "1",
    companyName: "株式会社メルカリ",
    position: "シニアフロントエンドエンジニア",
    status: "current",
    startDate: "2023-04",
    endDate: undefined,
    employmentType: "full_time",
    tags: ["React", "TypeScript", "フルリモート"],
    notes: "マイクロサービスアーキテクチャの経験を積める環境",
    salaryHistory: [],
    createdAt: "2023-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  };

  // 模擬的応募數據
  const mockApplication: Application = {
    id: "1",
    userId: "demo-user",
    companyName: "株式会社サンプル",
    position: "フロントエンドエンジニア",
    status: "bookmarked",
    employmentType: "full_time",
    applicationMethod: {
      type: "job_site",
      siteName: "Wantedly",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const handleCareerSave = (careerId: string | null, data: CareerFormData, salaryHistory: SalaryChange[], offerSalary?: OfferSalary) => {
    console.log("Career saved:", { careerId, data, salaryHistory, offerSalary });
    alert("職歴が保存されました！");
    setCareerModalOpen(false);
  };

  const handleApplicationSave = (data: ApplicationFormData) => {
    console.log("Application saved:", data);
    alert("応募情報が保存されました！");
    setApplicationModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Modal 樣式統一示例
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              現在 Career Modal 和 Application Modal 使用相同的樣式系統：
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Career Modal
                </h3>
                <p className="text-blue-700 mb-4">
                  職歴の編集と新規追加
                </p>
                <button
                  onClick={() => setCareerModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  職歴 Modal を開く
                </button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Application Modal
                </h3>
                <p className="text-green-700 mb-4">
                  応募情報の編集と新規追加
                </p>
                <button
                  onClick={() => setApplicationModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  応募 Modal を開く
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                統一樣式的特徵:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>使用 DaisyUI 的 modal 系統</li>
                <li>背景可見，不會完全遮蓋</li>
                <li>統一的標題欄和關閉按鈕樣式</li>
                <li>相同的 modal-backdrop 效果</li>
                <li>一致的間距和佈局</li>
                <li>響應式設計，適配不同螢幕尺寸</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Career Modal */}
        <CareerEditModal
          isOpen={careerModalOpen}
          careerId={mockCareer.id}
          career={mockCareer}
          onClose={() => setCareerModalOpen(false)}
          onSave={handleCareerSave}
        />
        
        {/* Application Modal */}
        <ApplicationModal
          isOpen={applicationModalOpen}
          application={mockApplication}
          onClose={() => setApplicationModalOpen(false)}
          onSave={handleApplicationSave}
        />
      </div>
    </div>
  );
}
