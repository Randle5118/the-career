import React from "react";
import { Field, Label, Textarea, ErrorMessage, Description } from "./catalyst";

export interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  resizable?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  resizable = true,
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
      <Textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        invalid={!!error}
        rows={rows}
        resizable={resizable}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
};
