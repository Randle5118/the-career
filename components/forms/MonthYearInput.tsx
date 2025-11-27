import React from "react";
import { Field, Label, Input, ErrorMessage, Description } from "./catalyst";

export interface MonthYearInputProps {
  value: string; // Format: YYYYMM or YYYY-MM
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
}

export const MonthYearInput: React.FC<MonthYearInputProps> = ({
  value,
  onChange,
  label = "開始日",
  placeholder = "202404",
  required = false,
  disabled = false,
  className = "",
  error,
  helpText,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 允許輸入數字和連字符，但限制長度
    if (inputValue.match(/^[\d-]*$/) && inputValue.length <= 7) {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    // 當失去焦點時，自動格式化為 YYYY-MM 格式
    if (value && value.match(/^\d{6}$/)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      onChange(`${year}-${month}`);
    }
  };

  return (
    <Field className={className} disabled={disabled}>
      <Label>
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </Label>
      {helpText && !error && <Description>{helpText}</Description>}
      <Input
        type="text"
        name="monthYear"
        value={value ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        invalid={!!error}
        maxLength={7}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
};
