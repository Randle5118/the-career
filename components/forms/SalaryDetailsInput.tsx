import React from "react";
import { FormField, FormSelect, FormTextarea, type SelectOption } from "./index";
import type { SalaryDetails } from "@/types/application";

interface SalaryDetailsInputProps {
  value: SalaryDetails | null;
  onChange: (salary: SalaryDetails | null) => void;
  className?: string;
  label?: string;
}

export const SalaryDetailsInput: React.FC<SalaryDetailsInputProps> = ({
  value,
  onChange,
  className = "",
  label = "給与情報",
}) => {
  const salaryTypeOptions: SelectOption[] = [
    { value: "none", label: "未設定" },
    { value: "monthly_with_bonus", label: "月給＋賞与" },
    { value: "annual", label: "年俸" },
  ];

  const handleTypeChange = (type: string) => {
    if (type === "none") {
      onChange(null);
    } else if (type === "monthly_with_bonus") {
      onChange({
        type: "monthly_with_bonus",
        monthlyMin: undefined,
        monthlyMax: undefined,
        bonusMonths: undefined,
      });
    } else if (type === "annual") {
      onChange({
        type: "annual",
        annualMin: undefined,
        annualMax: undefined,
      });
    }
  };

  const currentType = value?.type || "none";

  return (
    <div className={`space-y-4 ${className}`}>
      <FormSelect
        label={label}
        name="salaryType"
        value={currentType}
        onChange={(e) => handleTypeChange(e.target.value)}
        options={salaryTypeOptions}
      />

      {value?.type === "monthly_with_bonus" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="月給下限（万円）"
              name="monthlyMin"
              type="number"
              value={value.monthlyMin?.toString() ?? ""}
              onChange={(e) => onChange({
                ...value,
                monthlyMin: e.target.value ? Number(e.target.value) : undefined
              })}
              placeholder="25"
              min="0"
              step="0.1"
            />
            <FormField
              label="月給上限（万円）"
              name="monthlyMax"
              type="number"
              value={value.monthlyMax?.toString() ?? ""}
              onChange={(e) => onChange({
                ...value,
                monthlyMax: e.target.value ? Number(e.target.value) : undefined
              })}
              placeholder="35"
              min="0"
              step="0.1"
            />
          </div>

          <FormField
            label="賞与（ヶ月）"
            name="bonusMonths"
            type="number"
            value={value.bonusMonths?.toString() ?? ""}
            onChange={(e) => onChange({
              ...value,
              bonusMonths: e.target.value ? Number(e.target.value) : undefined
            })}
            placeholder="2.0"
            min="0"
            step="0.1"
          />
        </div>
      )}

      {value?.type === "annual" && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="年俸下限（万円）"
            name="annualMin"
            type="number"
            value={value.annualMin?.toString() ?? ""}
            onChange={(e) => onChange({
              ...value,
              annualMin: e.target.value ? Number(e.target.value) : undefined
            })}
            placeholder="300"
            min="0"
            step="1"
          />
          <FormField
            label="年俸上限（万円）"
            name="annualMax"
            type="number"
            value={value.annualMax?.toString() ?? ""}
            onChange={(e) => onChange({
              ...value,
              annualMax: e.target.value ? Number(e.target.value) : undefined
            })}
            placeholder="500"
            min="0"
            step="1"
          />
        </div>
      )}

      {value && (
        <FormTextarea
          label="備考"
          name="salaryNotes"
          value={value.notes ?? ""}
          onChange={(e) => onChange({
            ...value,
            notes: e.target.value
          })}
          placeholder="給与に関する追加情報や条件など"
          rows={2}
        />
      )}
    </div>
  );
};

