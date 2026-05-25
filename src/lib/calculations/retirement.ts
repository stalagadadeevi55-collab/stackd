import type { UserProfile, RetirementResult } from '../../types/index';
import { PAY_PERIODS } from '../constants';

export function calculateEmployerMatch(profile: UserProfile): RetirementResult {
  const { grossAnnualSalary, contributionPct401k, employerMatchPct, employerMatchCapPct } = profile;
  const payPeriods = PAY_PERIODS[profile.payFrequency];

  const employeeAnnual = grossAnnualSalary * (contributionPct401k / 100);

  // Employer matches employerMatchPct% of employee contribution, up to matchCapPct% of salary
  const effectiveContributionForMatch = Math.min(contributionPct401k, employerMatchCapPct);
  const employerAnnual =
    grossAnnualSalary * (effectiveContributionForMatch / 100) * (employerMatchPct / 100);

  // What employer would contribute if employee hit the cap
  const maxEmployerAnnual =
    grossAnnualSalary * (employerMatchCapPct / 100) * (employerMatchPct / 100);

  const isCapturingFullMatch = contributionPct401k >= employerMatchCapPct;
  const missedMatchAnnual = isCapturingFullMatch ? 0 : maxEmployerAnnual - employerAnnual;

  return {
    employeeAnnual,
    employerAnnual,
    totalAnnual: employeeAnnual + employerAnnual,
    employeePerPay: employeeAnnual / payPeriods,
    employerPerMonth: employerAnnual / 12,
    isCapturingFullMatch,
    missedMatchAnnual,
    matchCapPct: employerMatchCapPct,
  };
}
