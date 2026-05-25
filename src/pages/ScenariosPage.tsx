import { useMemo } from 'react';
import { useProfileStore } from '../store/profileStore';
import { calculatePaycheck } from '../lib/calculations/paycheck';
import { calculateEmployerMatch } from '../lib/calculations/retirement';
import { calculateGrowth } from '../lib/calculations/investment';
import { PageHeader } from '../components/layout/PageHeader';
import { Disclaimer } from '../components/ui/Disclaimer';

const SCENARIOS = [5, 6, 10, 15];
const PROJECTION_YEARS = 30;

function fmt(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'k';
  return '$' + Math.round(n).toLocaleString();
}

const SCENARIO_COLORS = ['#22c55e', '#0d9488', '#0ea5e9', '#a78bfa'];

export function ScenariosPage() {
  const profile = useProfileStore((s) => s.profile);

  const scenarios = useMemo(() => {
    if (!profile) return [];
    return SCENARIOS.map((pct) => {
      const p = { ...profile, contributionPct401k: pct };
      const pay = calculatePaycheck(p);
      const match = calculateEmployerMatch(p);
      const growth = calculateGrowth({
        currentBalance: profile.currentInvestmentBalance,
        monthlyContribution: (p.grossAnnualSalary * (pct / 100)) / 12,
        monthlyEmployerMatch: match.employerAnnual / 12,
        annualReturnRate: profile.expectedAnnualReturn,
        years: PROJECTION_YEARS,
      });
      return {
        pct,
        netPerPay: pay.netPerPay,
        employeeAnnual: match.employeeAnnual,
        employerAnnual: match.employerAnnual,
        totalAnnual: match.totalAnnual,
        isCapturing: match.isCapturingFullMatch,
        projectedBalance: growth[growth.length - 1]?.balance ?? 0,
        isCurrent: pct === profile.contributionPct401k,
      };
    });
  }, [profile]);

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-sm">Complete your profile to compare scenarios.</p>
      </div>
    );
  }

  const baseline = scenarios.find((s) => s.isCurrent) ?? scenarios[0];

  return (
    <div>
      <PageHeader title="Scenario comparison 🔀" subtitle="What if you changed your 401(k) contribution?" />

      <div className="flex flex-col gap-3 mb-4">
        {scenarios.map((s, idx) => {
          const netDiff = s.netPerPay - (baseline?.netPerPay ?? s.netPerPay);
          const projDiff = s.projectedBalance - (baseline?.projectedBalance ?? s.projectedBalance);
          const color = SCENARIO_COLORS[idx % SCENARIO_COLORS.length];
          const animClass = ['animate-fade-up', 'animate-fade-up-1', 'animate-fade-up-2', 'animate-fade-up-3'][idx] ?? 'animate-fade-up';

          return (
            <div key={s.pct} className={`rounded-2xl p-5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.06] ${animClass}`}
              style={{
                borderTop: s.isCurrent ? `4px solid ${color}` : `3px solid ${color}`,
                boxShadow: s.isCurrent ? `0 4px 16px ${color}22` : undefined,
              }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="num text-2xl font-bold text-gray-900">{s.pct}%</span>
                  <span className="text-xs text-gray-400 font-normal">of salary</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {s.isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg bg-green-50 text-green-700 border border-green-200">
                      Current
                    </span>
                  )}
                  {!s.isCapturing && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                      Missing match
                    </span>
                  )}
                  {s.isCapturing && !s.isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                      Full match ✓
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Take-home / paycheck</p>
                  <p className="num text-sm font-bold text-gray-900">{fmt(s.netPerPay)}</p>
                  {!s.isCurrent && (
                    <p className={`num text-[10px] font-semibold mt-0.5 ${netDiff > 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {netDiff > 0 ? '+' : ''}{fmt(netDiff)}/pay
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Annual retirement</p>
                  <p className="num text-sm font-bold text-gray-900">{fmt(s.totalAnnual)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">You + employer</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Employer match</p>
                  <p className={`num text-sm font-bold ${s.isCapturing ? 'text-green-700' : 'text-amber-600'}`}>
                    {fmt(s.employerAnnual)}/yr
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{PROJECTION_YEARS}-yr projection</p>
                  <p className="num text-sm font-bold text-gray-900">{fmt(s.projectedBalance)}</p>
                  {!s.isCurrent && (
                    <p className={`num text-[10px] font-semibold mt-0.5 ${projDiff > 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {projDiff > 0 ? '+' : ''}{fmt(projDiff)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}
