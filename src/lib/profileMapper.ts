import type { UserProfile, PayFrequency, FilingStatus, LifestyleTier, HousingType } from '../types/index';
import type { Database } from '../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function toUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    age: row.age ?? 0,
    state: row.state ?? '',
    city: row.city ?? '',
    employerName: row.employer_name ?? undefined,
    employerState: row.employer_state ?? undefined,
    isRemote: row.is_remote ?? false,
    lifestyleTier: (row.lifestyle_tier as LifestyleTier) ?? 'comfortable',
    housingType: (row.housing_type as HousingType) ?? '1br',
    grossAnnualSalary: row.gross_annual_salary ?? 0,
    payFrequency: (row.pay_frequency as PayFrequency) ?? 'biweekly',
    filingStatus: (row.filing_status as FilingStatus) ?? 'single',
    contributionPct401k: row.contribution_pct_401k ?? 6,
    employerMatchPct: row.employer_match_pct ?? 100,
    employerMatchCapPct: row.employer_match_cap_pct ?? 6,
    monthlyRent: row.monthly_rent ?? 0,
    monthlyCar: row.monthly_car ?? 0,
    monthlyInsurance: row.monthly_insurance ?? 0,
    monthlyStudentLoans: row.monthly_student_loans ?? 0,
    monthlyFood: row.monthly_food ?? 0,
    monthlyUtilities: row.monthly_utilities ?? 0,
    monthlyFun: row.monthly_fun ?? 0,
    monthlyTravel: row.monthly_travel ?? 0,
    otherMonthlyExpenses: row.other_monthly_expenses ?? 0,
    emergencyFundMonths: row.emergency_fund_months ?? 6,
    currentInvestmentBalance: row.current_investment_balance ?? 0,
    expectedAnnualReturn: row.expected_annual_return ?? 7,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toProfileRow(profile: Partial<UserProfile> & { id: string }): ProfileUpdate & { id: string } {
  return {
    id: profile.id,
    age: profile.age,
    state: profile.state,
    city: profile.city,
    employer_name: profile.employerName ?? null,
    employer_state: profile.employerState ?? null,
    is_remote: profile.isRemote ?? null,
    lifestyle_tier: profile.lifestyleTier ?? null,
    housing_type: profile.housingType ?? null,
    gross_annual_salary: profile.grossAnnualSalary,
    pay_frequency: profile.payFrequency,
    filing_status: profile.filingStatus,
    contribution_pct_401k: profile.contributionPct401k,
    employer_match_pct: profile.employerMatchPct,
    employer_match_cap_pct: profile.employerMatchCapPct,
    monthly_rent: profile.monthlyRent,
    monthly_car: profile.monthlyCar,
    monthly_insurance: profile.monthlyInsurance,
    monthly_student_loans: profile.monthlyStudentLoans,
    monthly_food: profile.monthlyFood,
    monthly_utilities: profile.monthlyUtilities,
    monthly_fun: profile.monthlyFun,
    monthly_travel: profile.monthlyTravel,
    other_monthly_expenses: profile.otherMonthlyExpenses,
    emergency_fund_months: profile.emergencyFundMonths,
    current_investment_balance: profile.currentInvestmentBalance,
    expected_annual_return: profile.expectedAnnualReturn,
    updated_at: new Date().toISOString(),
  };
}
