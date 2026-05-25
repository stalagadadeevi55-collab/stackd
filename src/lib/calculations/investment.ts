import type { InvestmentDataPoint } from '../../types/index';

export interface GrowthParams {
  currentBalance: number;
  monthlyContribution: number;
  monthlyEmployerMatch: number;
  annualReturnRate: number;
  years: number;
}

export function calculateGrowth(params: GrowthParams): InvestmentDataPoint[] {
  const { currentBalance, monthlyContribution, monthlyEmployerMatch, annualReturnRate, years } =
    params;
  const monthlyRate = annualReturnRate / 100 / 12;
  const totalMonths = years * 12;
  const monthlyPMT = monthlyContribution + monthlyEmployerMatch;
  const points: InvestmentDataPoint[] = [];

  for (let month = 0; month <= totalMonths; month += 12) {
    let balance: number;
    const totalContributions = currentBalance + monthlyPMT * month;

    if (monthlyRate === 0) {
      balance = currentBalance + monthlyPMT * month;
    } else {
      const growthFactor = Math.pow(1 + monthlyRate, month);
      balance = currentBalance * growthFactor + monthlyPMT * ((growthFactor - 1) / monthlyRate);
    }

    const growth = Math.max(0, balance - totalContributions);

    points.push({
      year: month / 12,
      balance: Math.round(balance),
      contributions: Math.round(totalContributions),
      growth: Math.round(growth),
    });
  }

  return points;
}
