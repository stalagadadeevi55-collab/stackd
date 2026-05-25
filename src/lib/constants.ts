import type { FilingStatus, PayFrequency } from '../types/index';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2025 IRS federal income tax brackets (IRS Rev. Proc. 2024-40)
export const FEDERAL_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0,       max: 11925,  rate: 0.10 },
    { min: 11925,   max: 48475,  rate: 0.12 },
    { min: 48475,   max: 103350, rate: 0.22 },
    { min: 103350,  max: 197300, rate: 0.24 },
    { min: 197300,  max: 250525, rate: 0.32 },
    { min: 250525,  max: 626350, rate: 0.35 },
    { min: 626350,  max: Infinity, rate: 0.37 },
  ],
  married_filing_jointly: [
    { min: 0,       max: 23850,  rate: 0.10 },
    { min: 23850,   max: 96950,  rate: 0.12 },
    { min: 96950,   max: 206700, rate: 0.22 },
    { min: 206700,  max: 394600, rate: 0.24 },
    { min: 394600,  max: 501050, rate: 0.32 },
    { min: 501050,  max: 751600, rate: 0.35 },
    { min: 751600,  max: Infinity, rate: 0.37 },
  ],
  married_filing_separately: [
    { min: 0,       max: 11925,  rate: 0.10 },
    { min: 11925,   max: 48475,  rate: 0.12 },
    { min: 48475,   max: 103350, rate: 0.22 },
    { min: 103350,  max: 197300, rate: 0.24 },
    { min: 197300,  max: 250525, rate: 0.32 },
    { min: 250525,  max: 375800, rate: 0.35 },
    { min: 375800,  max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0,       max: 17000,  rate: 0.10 },
    { min: 17000,   max: 64850,  rate: 0.12 },
    { min: 64850,   max: 103350, rate: 0.22 },
    { min: 103350,  max: 197300, rate: 0.24 },
    { min: 197300,  max: 250500, rate: 0.32 },
    { min: 250500,  max: 626350, rate: 0.35 },
    { min: 626350,  max: Infinity, rate: 0.37 },
  ],
};

export const SOCIAL_SECURITY_WAGE_BASE = 176100; // 2025
export const SOCIAL_SECURITY_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLD = 200000;

export const ROTH_IRA_LIMIT = 7000;         // 2025 (unchanged from 2024)
export const ROTH_IRA_LIMIT_CATCHUP = 8000; // age 50+

export const MAX_401K_CONTRIBUTION = 23500; // 2025

export const PAY_PERIODS: Record<PayFrequency, number> = {
  monthly: 12,
  semi_monthly: 24,
  biweekly: 26,
};

// Approximate state income tax rates (flat/effective) for 2024
// States with no income tax = 0
export const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05,
  AK: 0,
  AZ: 0.025,
  AR: 0.044,
  CA: 0.093,
  CO: 0.044,
  CT: 0.065,
  DE: 0.066,
  FL: 0,
  GA: 0.055,
  HI: 0.11,
  ID: 0.058,
  IL: 0.0495,
  IN: 0.0305,
  IA: 0.06,
  KS: 0.057,
  KY: 0.045,
  LA: 0.0425,
  ME: 0.075,
  MD: 0.0575,
  MA: 0.05,
  MI: 0.0425,
  MN: 0.0985,
  MS: 0.05,
  MO: 0.048,
  MT: 0.069,
  NE: 0.0664,
  NV: 0,
  NH: 0,
  NJ: 0.0637,
  NM: 0.059,
  NY: 0.0685,
  NC: 0.0475,
  ND: 0.025,
  OH: 0.04,
  OK: 0.0475,
  OR: 0.099,
  PA: 0.0307,
  RI: 0.0599,
  SC: 0.07,
  SD: 0,
  TN: 0,
  TX: 0,
  UT: 0.0485,
  VT: 0.0875,
  VA: 0.0575,
  WA: 0,
  WV: 0.065,
  WI: 0.0765,
  WY: 0,
  DC: 0.085,
};

export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
];
