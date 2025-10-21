import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { CurrencySelect, SalaryBreakdownInput } from "./";
import type { SalaryChange } from "@/types/career";

interface SalaryHistorySectionProps {
  value: SalaryChange[];
  onChange: (value: SalaryChange[]) => void;
  formData: any;
}

export const SalaryHistorySection: React.FC<SalaryHistorySectionProps> = ({
  value = [],
  onChange,
  formData,
}) => {
  const addSalaryHistory = () => {
    const newHistory: SalaryChange = {
      yearMonth: "",
      currency: "JPY",
      salaryBreakdown: [],
      position: "",
      notes: ""
    };
    onChange([...value, newHistory]);
  };

  const removeSalaryHistory = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateSalaryHistory = (index: number, field: keyof SalaryChange, fieldValue: any) => {
    const updatedHistory = value.map((item, i) => 
      i === index ? { ...item, [field]: fieldValue } : item
    );
    onChange(updatedHistory);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">

        <button
          type="button"
          onClick={addSalaryHistory}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          追加
        </button>

        {value.map((change, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">給与履歴 #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeSalaryHistory(index)}
                className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                削除
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  年月
                </label>
                <input
                  type="text"
                  value={change.yearMonth}
                  onChange={(e) => updateSalaryHistory(index, "yearMonth", e.target.value)}
                  placeholder="YYYY-MM"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  役職
                </label>
                <input
                  type="text"
                  value={change.position || ""}
                  onChange={(e) => updateSalaryHistory(index, "position", e.target.value)}
                  placeholder="役職・ポジション"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            <CurrencySelect
              value={change.currency}
              onChange={(currency) => updateSalaryHistory(index, "currency", currency)}
            />

            <SalaryBreakdownInput
              salaryBreakdown={change.salaryBreakdown}
              currency={change.currency}
              onChange={(breakdown) => updateSalaryHistory(index, "salaryBreakdown", breakdown)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                備考
              </label>
              <textarea
                value={change.notes || ""}
                onChange={(e) => updateSalaryHistory(index, "notes", e.target.value)}
                placeholder="昇給理由やその他の備考"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
