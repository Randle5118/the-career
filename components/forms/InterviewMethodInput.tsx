import React from "react";
import { FormField, FormSelect, type SelectOption } from "./index";
import type { InterviewMethod } from "@/types/application";

interface InterviewMethodInputProps {
  value: InterviewMethod | null;
  onChange: (method: InterviewMethod | null) => void;
  className?: string;
}

export const InterviewMethodInput: React.FC<InterviewMethodInputProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const methodTypeOptions: SelectOption[] = [
    { value: "none", label: "未設定" },
    { value: "in_person", label: "対面" },
    { value: "online", label: "オンライン" },
  ];

  const handleTypeChange = (type: string) => {
    if (type === "none") {
      onChange(null);
    } else if (type === "in_person") {
      onChange({
        type: "in_person",
        address: "",
      });
    } else if (type === "online") {
      onChange({
        type: "online",
        url: "",
      });
    }
  };

  const currentType = value?.type || "none";

  return (
    <div className={`space-y-4 ${className}`}>
      <FormSelect
        label="面接方法"
        name="interviewMethodType"
        value={currentType}
        onChange={(e) => handleTypeChange(e.target.value)}
        options={methodTypeOptions}
      />

      {value?.type === "in_person" && (
        <FormField
          label="面接場所"
          name="address"
          value={value.address || ""}
          onChange={(e) => onChange({
            ...value,
            address: e.target.value
          })}
          placeholder="例: 東京都渋谷区..."
          required
        />
      )}

      {value?.type === "online" && (
        <FormField
          label="オンラインURL"
          name="url"
          type="url"
          value={value.url || ""}
          onChange={(e) => onChange({
            ...value,
            url: e.target.value
          })}
          placeholder="https://..."
          required
        />
      )}
    </div>
  );
};

