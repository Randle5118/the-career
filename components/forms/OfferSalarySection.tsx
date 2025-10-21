import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { CurrencySelect, SalaryBreakdownInput } from "./";
import type { OfferSalary } from "@/types/career";

interface OfferSalarySectionProps {
  value: OfferSalary | null;
  onChange: (value: OfferSalary | null) => void;
  formData: any;
}

export const OfferSalarySection: React.FC<OfferSalarySectionProps> = ({
  value,
  onChange,
  formData,
}) => {
  const addOfferSalary = () => {
    const newOfferSalary: OfferSalary = {
      currency: "JPY",
      salaryBreakdown: [],
      notes: ""
    };
    onChange(newOfferSalary);
  };

  const removeOfferSalary = () => {
    onChange(null);
  };

  const updateOfferSalary = (field: keyof OfferSalary, fieldValue: any) => {
    if (!value) return;
    
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        
        {!value && (
          <button
            type="button"
            onClick={addOfferSalary}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            オファー給与を追加
          </button>
        )}

        {value && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">オファー給与詳細</span>
              <button
                type="button"
                onClick={removeOfferSalary}
                className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                削除
              </button>
            </div>

            <CurrencySelect
              value={value.currency}
              onChange={(currency) => updateOfferSalary("currency", currency)}
            />

            <SalaryBreakdownInput
              salaryBreakdown={value.salaryBreakdown}
              currency={value.currency}
              onChange={(breakdown) => updateOfferSalary("salaryBreakdown", breakdown)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                備考
              </label>
              <textarea
                value={value.notes || ""}
                onChange={(e) => updateOfferSalary("notes", e.target.value)}
                placeholder="残業代やその他の給与条件など"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
