import React from "react";
import { Field, Label, Select, ErrorMessage, Description } from "./catalyst";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "選択してください",
  required = false,
  disabled = false,
  className = "",
  error,
  helpText,
}) => {
  return (
    <Field className={className} disabled={disabled}>
      <Label>
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </Label>
      {helpText && !error && <Description>{helpText}</Description>}
      <Select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
};
