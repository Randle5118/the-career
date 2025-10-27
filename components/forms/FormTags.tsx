import React, { useState } from "react";
import { Field, Label, Description, Input } from "./catalyst";
import { Plus, X } from "lucide-react";

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
  placeholder = "例: リモート可, React",
  className = "",
  helpText,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const tags = value ? value.split(",").map((tag) => tag.trim()).filter(Boolean) : [];

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      onChange(newTags.join(", "));
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME入力中は処理しない
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      addTag();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags.join(", "));
  };

  return (
    <Field className={className}>
      <Label>{label}</Label>
      {helpText && <Description>{helpText}</Description>}
      
      {/* Input + Add Button */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addTag}
          className="btn btn-outline btn-square"
          disabled={!inputValue.trim()}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {/* Display tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="badge badge-sm bg-base-200 text-base-content/80 border-base-300 gap-1.5 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:text-error transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
};
