import React from "react";
import { Field, Label, Input, ErrorMessage, Description } from "./catalyst";

export interface FormFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "month" | "time" | "week";
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  className?: string;
  error?: string;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  step,
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
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        invalid={!!error}
        min={min}
        max={max}
        step={step}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
};
