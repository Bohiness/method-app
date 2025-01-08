// src/shared/constants/currency.ts

export type CurrencyCode = 'USD' | 'RUB';

export const CURRENCY_RATES = {
  USD_RUB: Number(process.env['NEXT_PUBLIC_CURRENCY_RATE_USD_RUB']) || 100,
  RUB_USD: Number(process.env['NEXT_PUBLIC_CURRENCY_RATE_RUB_USD']) || 85,
} as const;

export const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'RUB', label: 'RUB' },
] as const;

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';
