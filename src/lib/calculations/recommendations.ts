import type { UserProfile, Recommendation, RetirementResult } from '../../types/index';
import { ROTH_IRA_LIMIT } from '../constants';
import { calculatePaycheck } from './paycheck';

export function generateRecommendations(
  profile: UserProfile,
  matchResult: RetirementResult,
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const paycheck = calculatePaycheck(profile);

  // 1. Capture full employer match (highest priority)
  if (!matchResult.isCapturingFullMatch) {
    const needed = matchResult.matchCapPct - profile.contributionPct401k;
    recommendations.push({
      priority: 1,
      title: 'Capture your full employer match',
      description: `You're contributing ${profile.contributionPct401k}% but your employer matches up to ${matchResult.matchCapPct}%. Increase to ${matchResult.matchCapPct}% to get $${Math.round(matchResult.missedMatchAnnual).toLocaleString()} more per year in free money. That's an instant ${Math.round((matchResult.missedMatchAnnual / (profile.grossAnnualSalary * (needed / 100))) * 100)}% return on those dollars.`,
      actionable: true,
      type: 'match',
    });
  }

  // 2. Emergency fund
  const monthlyExpenses =
    profile.monthlyRent +
    profile.monthlyCar +
    profile.monthlyInsurance +
    profile.monthlyStudentLoans +
    profile.monthlyFood +
    profile.monthlyUtilities +
    profile.monthlyFun +
    profile.monthlyTravel +
    profile.otherMonthlyExpenses;
  const emergencyFundTarget = monthlyExpenses * profile.emergencyFundMonths;
  if (profile.currentInvestmentBalance < emergencyFundTarget) {
    const shortfall = emergencyFundTarget - profile.currentInvestmentBalance;
    recommendations.push({
      priority: 2,
      title: 'Build your emergency fund',
      description: `You need ${profile.emergencyFundMonths} months of expenses ($${Math.round(emergencyFundTarget).toLocaleString()}) in a high-yield savings account before investing further. You're $${Math.round(shortfall).toLocaleString()} short. Aim to save $${Math.round(shortfall / 12).toLocaleString()}/month until you hit this goal.`,
      actionable: true,
      type: 'emergency',
    });
  }

  // 3. High-interest debt reminder
  recommendations.push({
    priority: 3,
    title: 'Pay down high-interest debt',
    description:
      'If you have credit card or personal loan debt above 7% interest, paying it off gives a guaranteed return equal to that rate — often better than investing. Check your debt before increasing investments.',
    actionable: false,
    type: 'debt',
  });

  // 4. Roth IRA
  const monthlySurplus = paycheck.netPerPay * (paycheck.payPeriods / 12) - monthlyExpenses;
  if (monthlySurplus > 0) {
    const annualRothCapacity = Math.min(monthlySurplus * 12, ROTH_IRA_LIMIT);
    recommendations.push({
      priority: 4,
      title: 'Contribute to a Roth IRA',
      description: `You could contribute up to $${Math.round(annualRothCapacity).toLocaleString()}/year to a Roth IRA (2025 limit: $${ROTH_IRA_LIMIT.toLocaleString()}). Roth contributions grow tax-free and withdrawals in retirement are tax-free — ideal for young professionals in a lower tax bracket now.`,
      actionable: true,
      type: 'roth',
    });
  }

  // 5. Increase 401k beyond match
  if (profile.contributionPct401k < 15 && matchResult.isCapturingFullMatch) {
    recommendations.push({
      priority: 5,
      title: 'Increase your 401(k) beyond the match',
      description: `You're at ${profile.contributionPct401k}% — financial experts recommend saving 15% of income for retirement. Consider increasing to ${Math.min(15, profile.contributionPct401k + 2)}% next. Each 1% increase reduces your paycheck by about $${Math.round(profile.grossAnnualSalary * 0.01 / paycheck.payPeriods).toLocaleString()}/paycheck.`,
      actionable: true,
      type: '401k',
    });
  }

  // 6. Taxable brokerage
  if (matchResult.isCapturingFullMatch && monthlySurplus > ROTH_IRA_LIMIT / 12) {
    recommendations.push({
      priority: 6,
      title: 'Open a taxable brokerage account',
      description:
        "You've got room to invest beyond tax-advantaged accounts. A low-cost index fund in a taxable brokerage (Fidelity, Schwab, or Vanguard) is a flexible next step for additional wealth building.",
      actionable: true,
      type: 'brokerage',
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}
