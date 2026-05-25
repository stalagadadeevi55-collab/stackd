import type { FilingStatus } from '../../types/index';
import {
  FEDERAL_BRACKETS,
  STATE_TAX_RATES,
  SOCIAL_SECURITY_WAGE_BASE,
  SOCIAL_SECURITY_RATE,
  MEDICARE_RATE,
  ADDITIONAL_MEDICARE_RATE,
  ADDITIONAL_MEDICARE_THRESHOLD,
} from '../constants';

export function calculateFederalTax(taxableIncome: number, filingStatus: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = FEDERAL_BRACKETS[filingStatus];
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

export function calculateStateTax(grossSalary: number, state: string): number {
  const rate = STATE_TAX_RATES[state.toUpperCase()] ?? 0;
  return grossSalary * rate;
}

export interface FICAResult {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
}

export function calculateFICA(grossSalary: number): FICAResult {
  const socialSecurity = Math.min(grossSalary, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;
  const medicare = grossSalary * MEDICARE_RATE;
  const additionalMedicare =
    grossSalary > ADDITIONAL_MEDICARE_THRESHOLD
      ? (grossSalary - ADDITIONAL_MEDICARE_THRESHOLD) * ADDITIONAL_MEDICARE_RATE
      : 0;
  return {
    socialSecurity,
    medicare,
    additionalMedicare,
    total: socialSecurity + medicare + additionalMedicare,
  };
}
