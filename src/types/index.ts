export const PAY_FREQUENCIES = {
  monthly: 'monthly',
  semi_monthly: 'semi_monthly',
  biweekly: 'biweekly',
} as const;
export type PayFrequency = (typeof PAY_FREQUENCIES)[keyof typeof PAY_FREQUENCIES];

export const FILING_STATUSES = {
  single: 'single',
  married_filing_jointly: 'married_filing_jointly',
  married_filing_separately: 'married_filing_separately',
  head_of_household: 'head_of_household',
} as const;
export type FilingStatus = (typeof FILING_STATUSES)[keyof typeof FILING_STATUSES];

export const LIFESTYLE_TIERS = {
  modest: 'modest',
  comfortable: 'comfortable',
  premium: 'premium',
} as const;
export type LifestyleTier = (typeof LIFESTYLE_TIERS)[keyof typeof LIFESTYLE_TIERS];

export const HOUSING_TYPES = {
  studio: 'studio',
  '1br': '1br',
  '2br': '2br',
  house: 'house',
} as const;
export type HousingType = (typeof HOUSING_TYPES)[keyof typeof HOUSING_TYPES];

export interface UserProfile {
  id: string;
  age: number;
  state: string;             // residence state (legal address)
  city: string;
  employerName?: string;     // company name — used for company-specific benefit lookups
  employerState?: string;    // employer's state (for remote workers)
  isRemote?: boolean;
  lifestyleTier?: LifestyleTier;
  housingType?: HousingType;
  grossAnnualSalary: number;
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  contributionPct401k: number;
  employerMatchPct: number;
  employerMatchCapPct: number;
  monthlyRent: number;
  monthlyCar: number;
  monthlyInsurance: number;
  monthlyStudentLoans: number;
  monthlyFood: number;
  monthlyUtilities: number;
  monthlyFun: number;
  monthlyTravel: number;
  otherMonthlyExpenses: number;
  emergencyFundMonths: number;
  currentInvestmentBalance: number;
  expectedAnnualReturn: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProfileDraft {
  city: string;
  state: string;
  age: number;
  employerName: string;
  employerState: string | null;
  isRemote: boolean;
  grossAnnualSalary: number;
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  contributionPct401k: number;
  employerMatchPct: number;
  employerMatchCapPct: number;
  lifestyleTier: LifestyleTier;
  housingType: HousingType;
  monthlyRent: number;
  monthlyCar: number;
  monthlyInsurance: number;
  monthlyStudentLoans: number;
  monthlyFood: number;
  monthlyUtilities: number;
  monthlyFun: number;
  monthlyTravel: number;
  otherMonthlyExpenses: number;
  emergencyFundMonths: number;
  currentInvestmentBalance: number;
  expectedAnnualReturn: number;
  taxNote: string;
}

export interface PaycheckResult {
  grossPerPay: number;
  contribution401kPerPay: number;
  federalTaxPerPay: number;
  stateTaxPerPay: number;
  socialSecurityPerPay: number;
  medicarePerPay: number;
  additionalMedicarePerPay: number;
  netPerPay: number;
  grossAnnual: number;
  contribution401kAnnual: number;
  federalTaxAnnual: number;
  stateTaxAnnual: number;
  socialSecurityAnnual: number;
  medicareAnnual: number;
  additionalMedicareAnnual: number;
  netAnnual: number;
  payPeriods: number;
}

export interface RetirementResult {
  employeeAnnual: number;
  employerAnnual: number;
  totalAnnual: number;
  employeePerPay: number;
  employerPerMonth: number;
  isCapturingFullMatch: boolean;
  missedMatchAnnual: number;
  matchCapPct: number;
}

export interface InvestmentDataPoint {
  year: number;
  balance: number;
  contributions: number;
  growth: number;
}

export interface Recommendation {
  priority: number;
  title: string;
  description: string;
  actionable: boolean;
  type: 'match' | 'emergency' | 'debt' | 'roth' | '401k' | 'brokerage';
}
