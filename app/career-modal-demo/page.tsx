"use client";

import React, { useState } from "react";
import CareerModal from "@/components/modals/CareerModal";
import type { Career, CareerFormData, SalaryChange, OfferSalary } from "@/types/career";

export default function CareerModalDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingCareerId, setEditingCareerId] = useState<string | null>(null);

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
    salaryHistory: [
      {
        yearMonth: "2023-04",
        currency: "JPY",
        salaryBreakdown: [
          { salary: 6000, salaryType: "基本給" },
          { salary: 1500, salaryType: "賞与" },
          { salary: 1000, salaryType: "手当" },
        ],
        position: "シニアフロントエンドエンジニア",
        notes: "入社時の給与",
      },
      {
        yearMonth: "2024-04",
        currency: "JPY",
        salaryBreakdown: [
          { salary: 6500, salaryType: "基本給" },
          { salary: 2000, salaryType: "賞与" },
          { salary: 1000, salaryType: "手当" },
        ],
        position: "シニアフロントエンドエンジニア",
        notes: "昇進による昇給",
      },
    ],
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salary: 8000, salaryType: "基本給" },
        { salary: 2000, salaryType: "賞与" },
        { salary: 1000, salaryType: "手当" },
      ],
      notes: "年2回のボーナス制度",
    },
    createdAt: "2023-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  };

  const handleSave = (data: CareerFormData, salaryHistory: SalaryChange[], offerSalary?: OfferSalary) => {
    console.log("保存的職歴數據:", { editingCareerId, data, salaryHistory, offerSalary });
    alert("職歴が保存されました！");
    setIsModalOpen(false);
    setEditingCareer(null);
    setEditingCareerId(null);
  };

  const openNewCareerModal = () => {
    setEditingCareer(null);
    setEditingCareerId(null);
    setIsModalOpen(true);
  };

  const openEditCareerModal = () => {
    setEditingCareer(mockCareer);
    setEditingCareerId(mockCareer.id);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Career Modal 系統示例
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              現在職歴の編集と新規追加は modal で処理されます。
              配置化表單系統を使用して、Stripe 風格的設計で統一されています。
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={openNewCareerModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                新しい職歴を追加
              </button>
              
              <button
                onClick={openEditCareerModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                既存職歴を編集
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Modal 系統の特徴:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>配置化表單系統を使用</li>
                <li>Stripe 風格的簡潔設計</li>
                <li>Tab 版結構（基本情報・給与情報）</li>
                <li>統一的間距和視覺效果</li>
                <li>專門的薪資組件（OfferSalarySection, SalaryHistorySection）</li>
                <li>更好的代碼組織和維護性</li>
                <li>單頁面編輯から modal 編輯への移行</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Career Modal */}
        <CareerModal
          isOpen={isModalOpen}
          career={editingCareer}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCareer(null);
            setEditingCareerId(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}