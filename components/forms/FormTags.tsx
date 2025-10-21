import React from "react";
import { Field, Label, Input, Description } from "./catalyst";

export interface FormTagsProps {
  label: string;
  value: string; // Comma-separated string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  helpText?: string;
}

export const FormTags: React.FC<FormTagsProps> = ({
  label,
  value,
  onChange,
  placeholder = "例: React, TypeScript, フルリモート",
  className = "",
  helpText,
}) => {
  const tags = value ? value.split(",").map((tag) => tag.trim()).filter(Boolean) : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags.join(", "));
  };

  return (
    <Field className={className}>
      <Label>{label}</Label>
      {helpText && <Description>{helpText}</Description>}
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      
      {/* Display tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="badge badge-outline badge-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 text-base-content/60 hover:text-error"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </Field>
  );
};
