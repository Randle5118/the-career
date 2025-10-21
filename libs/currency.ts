import type { Currency, CurrencyConfig } from "@/types/career";

// Currency configuration map (JPY only for Japan market)
export const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
  JPY: {
    symbol: '¥',
    code: 'JPY',
    displayUnit: '万円',
    conversionRate: 10, // 1k = 0.1万 (需除以10顯示為万)
  },
};

// Format salary amount based on currency
export const formatSalaryAmount = (
  amount: number,
  currency: Currency,
  options?: {
    showSymbol?: boolean;
    showUnit?: boolean;
    showCode?: boolean;
    decimals?: number;
  }
): string => {
  if (!currency || !CURRENCY_CONFIG[currency]) {
    return "0万円"; // Default to JPY if currency is invalid
  }
  
  const config = CURRENCY_CONFIG[currency];
  const {
    showSymbol = false,
    showUnit = true,
    showCode = true,
    decimals = 1,
  } = options || {};

  // Convert k to display unit
  const displayValue = amount / config.conversionRate;
  
  // Format number with decimals
  const formattedNumber = displayValue.toFixed(decimals).replace(/\.0+$/, '');
  
  // Build display string
  let result = formattedNumber;
  
  if (showUnit) {
    result += config.displayUnit;
  }
  
  if (showSymbol) {
    result = config.symbol + result;
  }
  
  if (showCode && !showSymbol) {
    result += ` ${config.code}`;
  }
  
  return result;
};

// Format full salary with symbol and code
export const formatSalaryFull = (amount: number, currency: Currency): string => {
  if (!currency || !CURRENCY_CONFIG[currency]) {
    return "0万円"; // Default to JPY if currency is invalid
  }
  
  const config = CURRENCY_CONFIG[currency];
  const displayValue = amount / config.conversionRate;
  const formattedNumber = displayValue.toFixed(1).replace(/\.0+$/, '');
  
  // JPY only - simplified for Japan market
  return `${formattedNumber}${config.displayUnit}`;
};

// Format for compact display (e.g., in charts)
export const formatSalaryCompact = (amount: number, currency: Currency): string => {
  return formatSalaryAmount(amount, currency, {
    showSymbol: false,
    showUnit: true,
    showCode: false,
    decimals: 0,
  });
};

// Format for detailed display with symbol
export const formatSalaryWithSymbol = (amount: number, currency: Currency): string => {
  if (!currency || !CURRENCY_CONFIG[currency]) {
    return "0万円"; // Default to JPY if currency is invalid
  }
  
  const config = CURRENCY_CONFIG[currency];
  const displayValue = amount / config.conversionRate;
  const formattedNumber = displayValue.toFixed(1).replace(/\.0+$/, '');
  
  if (currency === 'JPY') {
    return `${formattedNumber}${config.displayUnit}`;
  } else if (currency === 'KRW') {
    return `${formattedNumber}${config.displayUnit}`;
  } else {
    return `${config.symbol}${formattedNumber}${config.displayUnit}`;
  }
};

// Get currency display name
export const getCurrencyDisplayName = (currency: Currency): string => {
  const names: Record<Currency, string> = {
    JPY: '日本円',
  };
  return names[currency];
};

// Convert input value to k based on currency
// For JPY: User inputs in 万円, we convert to k (multiply by 10)
// For others: User inputs in k
export const convertInputToK = (input: number, currency: Currency): number => {
  const config = CURRENCY_CONFIG[currency];
  return input * config.conversionRate;
};

// Convert k to input value based on currency
// For JPY: Convert k to 万円 (divide by 10)
// For others: Keep as k
export const convertKToInput = (k: number, currency: Currency): number => {
  const config = CURRENCY_CONFIG[currency];
  return k / config.conversionRate;
};

// Get input unit label for forms
export const getInputUnitLabel = (currency: Currency): string => {
  const config = CURRENCY_CONFIG[currency];
  if (currency === 'JPY') {
    return '万円';
  } else if (currency === 'KRW') {
    return '만원';
  }
  return `k ${config.code}`;
};

