"use client";

import React, { useState } from "react";
import { CareerEditModal } from "@/components/modals/CareerEditModal";
import type { Career, CareerFormData, SalaryChange, OfferSalary } from "@/types/career";

export default function ExpandedSalaryDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingCareerId, setEditingCareerId] = useState<string | null>(null);

  // 模擬的職歴數據，包含薪資信息
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

  const handleSave = (careerId: string | null, data: CareerFormData, salaryHistory: SalaryChange[], offerSalary?: OfferSalary) => {
    console.log("保存的職歴數據:", { careerId, data, salaryHistory, offerSalary });
    alert("職歴が保存されました！");
    setIsModalOpen(false);
    setEditingCareer(null);
    setEditingCareerId(null);
  };

  const openModal = () => {
    setEditingCareer(mockCareer);
    setEditingCareerId(mockCareer.id);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            展開後的給与情報分頁示例
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              現在給与情報分頁中的オファー給与和給与履歴區塊已經展開顯示，
              不需要再點擊「表示」按鈕來展開。
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                改進內容:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>移除折疊功能，直接展開顯示</li>
                <li>簡化用戶操作流程</li>
                <li>給与情報分頁內容一目了然</li>
                <li>減少不必要的點擊操作</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                功能特點:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li>オファー給与區塊直接顯示</li>
                <li>給与履歴區塊直接展開</li>
                <li>可以隨時添加新的薪資記錄</li>
                <li>支援完整的薪資明細輸入</li>
              </ul>
            </div>
            
            <button
              onClick={openModal}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              查看展開後的給与情報分頁
            </button>
          </div>
        </div>
        
        {/* Career Edit Modal */}
        <CareerEditModal
          isOpen={isModalOpen}
          careerId={editingCareerId}
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
