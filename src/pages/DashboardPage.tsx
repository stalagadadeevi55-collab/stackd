import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { usePaycheck } from '../hooks/usePaycheck';
import { useProfileStore } from '../store/profileStore';
import { calculateEmployerMatch } from '../lib/calculations/retirement';
import { generateRecommendations } from '../lib/calculations/recommendations';
import { calculateGrowth } from '../lib/calculations/investment';

function fmt(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + Math.round(n).toLocaleString();
  return '$' + Math.round(n);
}

function pct(n: number) {
  return n.toFixed(1) + '%';
}

export function DashboardPage() {
  const { loading } = useProfile();
  const profile = useProfileStore((s) => s.profile);
  const paycheck = usePaycheck();

  const matchResult = useMemo(() => {
    if (!profile) return null;
    return calculateEmployerMatch(profile);
  }, [profile]);

  const projectedBalance = useMemo(() => {
    if (!profile || !matchResult) return null;
    const points = calculateGrowth({
      currentBalance: profile.currentInvestmentBalance,
      monthlyContribution: (profile.grossAnnualSalary * (profile.contributionPct401k / 100)) / 12,
      monthlyEmployerMatch: matchResult.employerAnnual / 12,
      annualReturnRate: profile.expectedAnnualReturn,
      years: 30,
    });
    return points[points.length - 1]?.balance ?? 0;
  }, [profile, matchResult]);

  const recommendations = useMemo(() => {
    if (!profile || !matchResult) return [];
    return generateRecommendations(profile, matchResult);
  }, [profile, matchResult]);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-400 mb-4 text-sm">Profile not set up yet.</p>
        <Link to="/onboarding" className="text-green-600 font-semibold text-sm hover:underline">
          Complete onboarding
        </Link>
      </div>
    );
  }

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
  const monthlyTakeHome = paycheck ? (paycheck.netPerPay * paycheck.payPeriods) / 12 : 0;
  const monthlySurplus = monthlyTakeHome - monthlyExpenses;
  const savingsRate = monthlyTakeHome > 0 ? Math.max(0, monthlySurplus / monthlyTakeHome) * 100 : 0;
  const emergencyTarget = monthlyExpenses * profile.emergencyFundMonths;
  const emergencyProgress = emergencyTarget > 0
    ? Math.min(100, (profile.currentInvestmentBalance / emergencyTarget) * 100)
    : 100;
  const topRec = recommendations[0];
  const isHealthy = monthlySurplus >= 0 && (matchResult?.isCapturingFullMatch ?? true);
  const actionPath = topRec?.type === 'match' || topRec?.type === '401k'
    ? '/retirement'
    : topRec?.type === 'emergency'
      ? '/budget'
      : '/investments';
  const actionLabel = topRec?.type === 'match' || topRec?.type === '401k'
    ? `Increase 401(k) to ${profile.employerMatchCapPct}%`
    : topRec?.type === 'emergency'
      ? 'Build emergency fund'
      : 'Review growth plan';

  return (
    <div className="space-y-4">
      <div className="animate-fade-up pt-2 pb-1">
        <p className="text-[11px] text-gray-400 font-semibold mb-1">
          {profile.city}, {profile.state}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Money cockpit</h1>
      </div>

      <section className="animate-fade-up-1 rounded-2xl p-6 bg-gray-950 text-white shadow-[0_8px_30px_rgba(17,24,39,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-white/55 font-semibold mb-2">Status</p>
            <h2 className="text-3xl font-bold tracking-tight">
              {isHealthy ? 'You are building momentum.' : 'One move would clean this up.'}
            </h2>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${isHealthy ? 'bg-green-400 text-gray-950' : 'bg-amber-300 text-gray-950'}`}>
            {isHealthy ? 'On track' : 'Action needed'}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/45">Monthly take-home</p>
            <p className="num text-3xl font-bold mt-1">{fmt(monthlyTakeHome)}</p>
          </div>
          <div>
            <p className="text-xs text-white/45">After expenses</p>
            <p className={`num text-3xl font-bold mt-1 ${monthlySurplus >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {monthlySurplus >= 0 ? '+' : ''}{fmt(monthlySurplus)}
            </p>
          </div>
        </div>

        {topRec && (
          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <p className="text-xs text-white/50 font-semibold mb-1">Best next action</p>
            <p className="text-base font-bold">{topRec.title}</p>
            <p className="text-sm text-white/65 mt-1 leading-relaxed">{topRec.description}</p>
            {topRec.actionable && (
              <Link
                to={actionPath}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-950 transition-transform active:scale-[0.98]"
              >
                {actionLabel}
              </Link>
            )}
          </div>
        )}
      </section>

      <div className="animate-fade-up-2 grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">401(k) this year</p>
          <p className="num text-xl font-bold text-gray-900">{fmt(matchResult?.totalAnnual ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">You + employer</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">30-year projection</p>
          <p className="num text-xl font-bold text-gray-900">{projectedBalance ? fmt(projectedBalance) : '-'}</p>
          <p className="text-xs text-gray-400 mt-1">At {profile.expectedAnnualReturn}% return</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Savings rate</p>
          <p className="num text-xl font-bold text-gray-900">{pct(savingsRate)}</p>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, savingsRate * 4)}%` }} />
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Emergency target</p>
          <p className="num text-xl font-bold text-gray-900">{pct(emergencyProgress)}</p>
          <p className="text-xs text-gray-400 mt-1">of {fmt(emergencyTarget)}</p>
        </div>
      </div>

      <div className="animate-fade-up-3 grid grid-cols-2 gap-3">
        {[
          { to: '/paycheck', label: 'Paycheck', desc: 'See where each dollar goes', color: 'bg-green-500' },
          {
            to: '/retirement',
            label: '401(k)',
            desc: matchResult?.isCapturingFullMatch ? 'Full match captured' : `Get ${fmt(matchResult?.missedMatchAnnual ?? 0)} more`,
            color: 'bg-teal-500',
          },
          { to: '/investments', label: 'Growth', desc: 'Model your long-term balance', color: 'bg-sky-500' },
          { to: '/scenarios', label: 'Scenarios', desc: 'Compare contribution changes', color: 'bg-amber-500' },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <div className="rounded-xl p-4 bg-white border border-black/[0.06] h-full transition-all duration-150 hover:border-black/15 active:scale-[0.98]">
              <span className={`block h-1.5 w-8 rounded-full ${item.color} mb-3`} />
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1 font-normal leading-snug">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
