import { describe, it, expect } from 'vitest';
import { calculateFederalTax, calculateStateTax, calculateFICA } from './taxes';

// Walmart/Bentonville sample: $90k salary, 6% 401k → taxable income = $84,600
const TAXABLE_INCOME = 84600;
const GROSS_SALARY = 90000;

describe('calculateFederalTax', () => {
  it('calculates single filer tax on $84,600 taxable income', () => {
    const tax = calculateFederalTax(TAXABLE_INCOME, 'single');
    // 10% on $11,600 = $1,160
    // 12% on $35,550 ($47,150 - $11,600) = $4,266
    // 22% on $37,450 ($84,600 - $47,150) = $8,239
    // Total ≈ $13,665
    expect(tax).toBeCloseTo(13665, -1);
  });

  it('returns 0 for zero income', () => {
    expect(calculateFederalTax(0, 'single')).toBe(0);
  });

  it('applies MFJ brackets (higher thresholds)', () => {
    const single = calculateFederalTax(TAXABLE_INCOME, 'single');
    const mfj = calculateFederalTax(TAXABLE_INCOME, 'married_filing_jointly');
    expect(mfj).toBeLessThan(single);
  });

  it('applies HOH brackets', () => {
    const hoh = calculateFederalTax(TAXABLE_INCOME, 'head_of_household');
    const single = calculateFederalTax(TAXABLE_INCOME, 'single');
    expect(hoh).toBeLessThan(single);
  });
});

describe('calculateStateTax', () => {
  it('calculates Arkansas tax at 4.4%', () => {
    const tax = calculateStateTax(GROSS_SALARY, 'AR');
    expect(tax).toBeCloseTo(3960, 0); // 90000 * 0.044
  });

  it('returns 0 for Texas (no income tax)', () => {
    expect(calculateStateTax(GROSS_SALARY, 'TX')).toBe(0);
  });

  it('handles lowercase state codes', () => {
    expect(calculateStateTax(GROSS_SALARY, 'ar')).toBeCloseTo(3960, 0);
  });

  it('returns 0 for unknown state', () => {
    expect(calculateStateTax(GROSS_SALARY, 'ZZ')).toBe(0);
  });
});

describe('calculateFICA', () => {
  it('calculates Social Security on $90k salary', () => {
    const fica = calculateFICA(GROSS_SALARY);
    expect(fica.socialSecurity).toBe(5580); // 90000 * 0.062
  });

  it('calculates Medicare on $90k salary', () => {
    const fica = calculateFICA(GROSS_SALARY);
    expect(fica.medicare).toBe(1305); // 90000 * 0.0145
  });

  it('has no additional Medicare below $200k', () => {
    const fica = calculateFICA(GROSS_SALARY);
    expect(fica.additionalMedicare).toBe(0);
  });

  it('caps Social Security at wage base', () => {
    const fica = calculateFICA(300000);
    expect(fica.socialSecurity).toBeCloseTo(168600 * 0.062, 0);
  });

  it('calculates additional Medicare above $200k', () => {
    const fica = calculateFICA(250000);
    expect(fica.additionalMedicare).toBeCloseTo(50000 * 0.009, 0);
  });
});
