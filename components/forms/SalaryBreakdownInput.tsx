import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SalaryComponent, Currency } from "@/types/career";
import { getInputUnitLabel, convertInputToK, convertKToInput, formatSalaryFull } from "@/libs/currency";
import { FormField } from "./FormField";
import { Input } from "./catalyst";

export interface SalaryBreakdownInputProps {
  salaryBreakdown: SalaryComponent[];
  currency: Currency;
  onChange: (breakdown: SalaryComponent[]) => void;
  className?: string;
  label?: string;
}

export const SalaryBreakdownInput: React.FC<SalaryBreakdownInputProps> = ({
  salaryBreakdown,
  currency,
  onChange,
  className = "",
  label = "給与内訳",
}) => {
  const addSalaryComponent = () => {
    onChange([
      ...salaryBreakdown,
      { salary: 0, salaryType: "" }
    ]);
  };

  const updateSalaryComponent = (index: number, field: keyof SalaryComponent, value: string | number) => {
    const newBreakdown = [...salaryBreakdown];
    if (field === "salary") {
      newBreakdown[index].salary = convertInputToK(value as number, currency);
    } else {
      newBreakdown[index].salaryType = value as string;
    }
    onChange(newBreakdown);
  };

  const removeSalaryComponent = (index: number) => {
    onChange(salaryBreakdown.filter((_, i) => i !== index));
  };

  const total = salaryBreakdown.reduce((sum, item) => sum + item.salary, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-base-content">{label}</span>
        <button
          type="button"
          onClick={addSalaryComponent}
          className="btn btn-sm btn-ghost text-primary"
        >
          <Plus className="w-4 h-4" />
          項目追加
        </button>
      </div>

      {salaryBreakdown.map((item, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm text-base-content mb-1.5">種類</label>
            <Input
              type="text"
              value={item.salaryType ?? ""}
              onChange={(e) => updateSalaryComponent(index, "salaryType", e.target.value)}
              placeholder="例: 基本給、賞与、手当"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-base-content mb-1.5">
              金額 ({getInputUnitLabel(currency)})
            </label>
            <Input
              type="number"
              value={convertKToInput(item.salary, currency)}
              onChange={(e) => updateSalaryComponent(index, "salary", parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <button
            type="button"
            onClick={() => removeSalaryComponent(index)}
            className="btn btn-sm btn-ghost text-error mb-0.5"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Total */}
      {salaryBreakdown.length > 0 && (
        <div className="p-1 bg-base-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">合計:</span>
            <span className="font-bold text-lg">
              {formatSalaryFull(total, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
