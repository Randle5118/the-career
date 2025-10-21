import React from "react";
import type { Currency } from "@/types/career";
import { getCurrencyDisplayName } from "@/libs/currency";
import { Field, Label, Select, ErrorMessage, Description } from "./catalyst";

export interface CurrencySelectProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
  label?: string;
  error?: string;
  helpText?: string;
}

const CURRENCY_OPTIONS = ["JPY"] as const satisfies readonly Currency[];

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value,
  onChange,
  className = "",
  label = "通貨",
  error,
  helpText,
}) => {
  return (
    <Field className={className}>
      <Label>{label}</Label>
      {helpText && !error && <Description>{helpText}</Description>}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
      >
        {CURRENCY_OPTIONS.map((currency) => (
          <option key={currency} value={currency}>
            {getCurrencyDisplayName(currency)}
          </option>
        ))}
      </Select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
};
