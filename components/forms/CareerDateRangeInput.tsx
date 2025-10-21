import React from "react";
import { MonthYearInput } from "./MonthYearInput";

export interface CareerDateRangeInputProps {
  startDate: string; // Format: YYYY-MM
  endDate?: string; // Format: YYYY-MM
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEndDateToggle: (isCurrent: boolean) => void;
  className?: string;
  startLabel?: string;
  endLabel?: string;
  isCurrent?: boolean;
}

export const CareerDateRangeInput: React.FC<CareerDateRangeInputProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onEndDateToggle,
  className = "",
  startLabel = "開始日",
  endLabel = "終了日",
  isCurrent = false,
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Start Date */}
      <MonthYearInput
        label={startLabel}
        value={startDate}
        onChange={onStartDateChange}
        placeholder="202404"
        required
      />

      {/* Current Job Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => onEndDateToggle(e.target.checked)}
          className="checkbox checkbox-primary"
        />
        <span className="text-sm text-base-content">現在も在職中</span>
      </label>

      {/* End Date */}
      {!isCurrent && (
        <MonthYearInput
          label={endLabel}
          value={endDate || ""}
          onChange={onEndDateChange}
          placeholder="202404"
        />
      )}
    </div>
  );
};
