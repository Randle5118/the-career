import React from "react";
import { FormFieldComponentProps } from "./types";
import { Field, Label, Input, Select, Textarea, ErrorMessage } from "./catalyst";

export const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  field,
  value,
  error,
  onChange,
  formData,
}) => {
  // 條件顯示檢查
  if (field.showWhen && !field.showWhen(formData)) {
    return null;
  }

  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "date":
      case "datetime-local":
      case "url":
        return (
          <Input
            type={field.type}
            name={field.name}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            invalid={!!error}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      case "textarea":
        return (
          <Textarea
            name={field.name}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            invalid={!!error}
            rows={field.rows || 3}
          />
        );

      case "select":
        return (
          <Select
            name={field.name}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={field.disabled}
          >
            <option value="">{field.placeholder || "選択してください"}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case "tags": {
        const tags = value 
          ? (Array.isArray(value) ? value : value.split(",").map((tag: string) => tag.trim()).filter(Boolean)) 
          : [];
        
        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={field.placeholder || "タグを入力して Enter キーを押す"}
              invalid={!!error}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const newTag = input.value.trim();
                  if (newTag && !tags.includes(newTag)) {
                    onChange([...tags, newTag]);
                    input.value = "";
                  }
                }
              }}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="badge badge-outline badge-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => onChange(tags.filter((_: any, i: number) => i !== index))}
                      className="ml-1 text-base-content/60 hover:text-error text-base leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "custom":
        if (field.customComponent) {
          const CustomComponent = field.customComponent;
          
          // 特殊處理 CareerDateRangeInput 組件
          if (field.name === "dateRange") {
            return (
              <CustomComponent
                startDate={formData.startDate || ""}
                endDate={formData.endDate || ""}
                onStartDateChange={(date: string) => onChange({ ...value, startDate: date })}
                onEndDateChange={(date: string) => onChange({ ...value, endDate: date })}
                onEndDateToggle={(isCurrent: boolean) => onChange({ ...value, isCurrent })}
                isCurrent={formData.status === "current"}
                formData={formData}
                {...field}
              />
            );
          }
          
          return (
            <CustomComponent
              value={value}
              onChange={onChange}
              formData={formData}
              {...field}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <Field className={field.className}>
      <Label>
        {field.label}
        {field.required && <span className="text-error ml-1">*</span>}
      </Label>
      
      {field.helpText && !error && (
        <p className="text-xs text-base-content/60 mt-1">{field.helpText}</p>
      )}
      
      {renderField()}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
};
