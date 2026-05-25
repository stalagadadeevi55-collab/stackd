import { describe, it, expect } from 'vitest';
import { calculatePaycheck } from './paycheck';
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

describe('calculatePaycheck', () => {
  it('uses 26 pay periods for biweekly', () => {
    const result = calculatePaycheck(walmartProfile);
    expect(result.payPeriods).toBe(26);
  });

  it('calculates gross per paycheck correctly', () => {
    const result = calculatePaycheck(walmartProfile);
    expect(result.grossPerPay).toBeCloseTo(90000 / 26, 2);
  });

  it('calculates 401k contribution per paycheck', () => {
    const result = calculatePaycheck(walmartProfile);
    expect(result.contribution401kPerPay).toBeCloseTo((90000 * 0.06) / 26, 2);
  });

  it('annual 401k is $5,400 for 6% on $90k', () => {
    const result = calculatePaycheck(walmartProfile);
    expect(result.contribution401kAnnual).toBe(5400);
  });

  it('calculates net pay per paycheck approximately', () => {
    const result = calculatePaycheck(walmartProfile);
    // ~$3,461.54 gross - deductions ≈ ~$2,300-$2,400 range
    expect(result.netPerPay).toBeGreaterThan(2000);
    expect(result.netPerPay).toBeLessThan(3000);
  });

  it('net annual = net per pay × pay periods', () => {
    const result = calculatePaycheck(walmartProfile);
    expect(result.netAnnual).toBeCloseTo(result.netPerPay * 26, 0);
  });

  it('net < gross per paycheck', () => {
    const result = calculatePaycheck(walmartProfile);
    expect(result.netPerPay).toBeLessThan(result.grossPerPay);
  });

  it('uses 12 periods for monthly frequency', () => {
    const result = calculatePaycheck({ ...walmartProfile, payFrequency: 'monthly' });
    expect(result.payPeriods).toBe(12);
    expect(result.grossPerPay).toBeCloseTo(7500, 0);
  });

  it('federal taxable income = salary minus 401k', () => {
    // With 6% 401k on $90k: taxable = $84,600
    // Verify that federal tax is calculated on reduced income
    const result0 = calculatePaycheck({ ...walmartProfile, contributionPct401k: 0 });
    const result6 = calculatePaycheck({ ...walmartProfile, contributionPct401k: 6 });
    expect(result6.federalTaxAnnual).toBeLessThan(result0.federalTaxAnnual);
  });
});
