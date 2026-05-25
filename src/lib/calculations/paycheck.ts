import type { UserProfile, PaycheckResult } from '../../types/index';
import { PAY_PERIODS } from '../constants';
import { calculateFederalTax, calculateStateTax, calculateFICA } from './taxes';

export function calculatePaycheck(profile: UserProfile): PaycheckResult {
  const payPeriods = PAY_PERIODS[profile.payFrequency];
  const grossAnnual = profile.grossAnnualSalary;
  const grossPerPay = grossAnnual / payPeriods;

  const contribution401kAnnual = grossAnnual * (profile.contributionPct401k / 100);
  const contribution401kPerPay = contribution401kAnnual / payPeriods;

  // 401k pre-tax contributions reduce federal taxable income
  const federalTaxableIncome = Math.max(0, grossAnnual - contribution401kAnnual);
  const federalTaxAnnual = calculateFederalTax(federalTaxableIncome, profile.filingStatus);
  const federalTaxPerPay = federalTaxAnnual / payPeriods;

  const stateTaxAnnual = calculateStateTax(grossAnnual, profile.state);
  const stateTaxPerPay = stateTaxAnnual / payPeriods;

  const fica = calculateFICA(grossAnnual);
  const socialSecurityAnnual = fica.socialSecurity;
  const medicareAnnual = fica.medicare;
  const additionalMedicareAnnual = fica.additionalMedicare;

  const socialSecurityPerPay = socialSecurityAnnual / payPeriods;
  const medicarePerPay = medicareAnnual / payPeriods;
  const additionalMedicarePerPay = additionalMedicareAnnual / payPeriods;

  const netPerPay =
    grossPerPay -
    contribution401kPerPay -
    federalTaxPerPay -
    stateTaxPerPay -
    socialSecurityPerPay -
    medicarePerPay -
    additionalMedicarePerPay;

  const netAnnual = netPerPay * payPeriods;

  return {
    grossPerPay,
    contribution401kPerPay,
    federalTaxPerPay,
    stateTaxPerPay,
    socialSecurityPerPay,
    medicarePerPay,
    additionalMedicarePerPay,
    netPerPay,
    grossAnnual,
    contribution401kAnnual,
    federalTaxAnnual,
    stateTaxAnnual,
    socialSecurityAnnual,
    medicareAnnual,
    additionalMedicareAnnual,
    netAnnual,
    payPeriods,
  };
}
