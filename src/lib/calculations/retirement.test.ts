import { describe, it, expect } from 'vitest';
import { calculateEmployerMatch } from './retirement';
import type { UserProfile } from '../../types/index';

const walmartProfile: UserProfile = {
  id: 'test-id',
  age: 22,
  state: 'AR',
  city: 'Bentonville',
  grossAnnualSalary: 90000,
  payFrequency: 'biweekly',
  filingStatus: 'single',
  contributionPct401k: 6,
  employerMatchPct: 100,
  employerMatchCapPct: 6,
  monthlyRent: 1200,
  monthlyCar: 300,
  monthlyInsurance: 150,
  monthlyStudentLoans: 200,
  monthlyFood: 550,
  monthlyUtilities: 150,
  monthlyFun: 300,
  monthlyTravel: 100,
  otherMonthlyExpenses: 0,
  emergencyFundMonths: 6,
  currentInvestmentBalance: 0,
  expectedAnnualReturn: 7,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('calculateEmployerMatch', () => {
  it('calculates $5,400 employee contribution at 6% on $90k', () => {
    const result = calculateEmployerMatch(walmartProfile);
    expect(result.employeeAnnual).toBe(5400);
  });

  it('calculates $5,400 employer match (100% up to 6%)', () => {
    const result = calculateEmployerMatch(walmartProfile);
    expect(result.employerAnnual).toBe(5400);
  });

  it('total annual contribution is $10,800', () => {
    const result = calculateEmployerMatch(walmartProfile);
    expect(result.totalAnnual).toBe(10800);
  });

  it('flags full match captured at 6%', () => {
    const result = calculateEmployerMatch(walmartProfile);
    expect(result.isCapturingFullMatch).toBe(true);
    expect(result.missedMatchAnnual).toBe(0);
  });

  it('flags partial match at 5% contribution', () => {
    const result = calculateEmployerMatch({ ...walmartProfile, contributionPct401k: 5 });
    expect(result.isCapturingFullMatch).toBe(false);
    // At 5%: employer matches $4,500. Max match = $5,400. Missed = $900.
    expect(result.missedMatchAnnual).toBeCloseTo(900, 0);
  });

  it('handles 50% match policy', () => {
    // 50% match up to 6%: employer contributes 3% of salary
    const result = calculateEmployerMatch({ ...walmartProfile, employerMatchPct: 50 });
    expect(result.employerAnnual).toBe(2700); // 90000 * 0.06 * 0.50
  });

  it('caps employer match at cap percentage', () => {
    // Employee at 10%, but cap is 6%
    const result = calculateEmployerMatch({ ...walmartProfile, contributionPct401k: 10 });
    expect(result.employerAnnual).toBe(5400); // still 6% of salary
    expect(result.isCapturingFullMatch).toBe(true);
  });
});
