import { useMemo, useState } from 'react';
import { useProfileStore } from '../store/profileStore';
import { calculateGrowth } from '../lib/calculations/investment';
import { calculateEmployerMatch } from '../lib/calculations/retirement';
import { PageHeader } from '../components/layout/PageHeader';
import { Disclaimer } from '../components/ui/Disclaimer';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

function fmt(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'k';
  return '$' + Math.round(n).toLocaleString();
}

const YEAR_OPTIONS = [10, 20, 30, 40];

export function InvestmentsPage() {
  const profile = useProfileStore((s) => s.profile);
  const [years, setYears] = useState(30);

  const match = useMemo(() => {
    if (!profile) return null;
    return calculateEmployerMatch(profile);
  }, [profile]);

  const growthData = useMemo(() => {
    if (!profile || !match) return [];
    return calculateGrowth({
      currentBalance: profile.currentInvestmentBalance,
      monthlyContribution: (profile.grossAnnualSalary * (profile.contributionPct401k / 100)) / 12,
      monthlyEmployerMatch: match.employerAnnual / 12,
      annualReturnRate: profile.expectedAnnualReturn,
      years,
    });
  }, [profile, match, years]);

  const plusOneData = useMemo(() => {
    if (!profile || !match) return [];
    const plusOnePct = profile.contributionPct401k + 1;
    const plusOneMatch = calculateEmployerMatch({ ...profile, contributionPct401k: plusOnePct });
    return calculateGrowth({
      currentBalance: profile.currentInvestmentBalance,
      monthlyContribution: (profile.grossAnnualSalary * (plusOnePct / 100)) / 12,
      monthlyEmployerMatch: plusOneMatch.employerAnnual / 12,
      annualReturnRate: profile.expectedAnnualReturn,
      years,
    });
  }, [profile, match, years]);

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-sm">Complete your profile to see your investment projection.</p>
      </div>
    );
  }

  const finalPoint = growthData[growthData.length - 1];
  const plusOnePoint = plusOneData[plusOneData.length - 1];
  const plusOneImpact = plusOnePoint && finalPoint ? plusOnePoint.balance - finalPoint.balance : 0;
  const monthlyContribution = (profile.grossAnnualSalary * (profile.contributionPct401k / 100)) / 12;
  const monthlyEmployerMatch = (match?.employerAnnual ?? 0) / 12;

  return (
    <div>
      <PageHeader title="Investment growth" subtitle={`Modeled at ${profile.expectedAnnualReturn}% annual return`} />

      <div className="flex gap-2 mb-4 animate-fade-up">
        {YEAR_OPTIONS.map((y) => (
          <button
            key={y}
            onClick={() => setYears(y)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-150 ${
              years === y
                ? 'text-white bg-gray-950 shadow-[0_2px_8px_rgba(17,24,39,0.2)]'
                : 'text-gray-500 bg-white border border-black/[0.06] hover:border-black/15'
            }`}
          >
            {y} years
          </button>
        ))}
      </div>

      {finalPoint && (
        <section className="rounded-2xl p-6 mb-4 animate-fade-up-1 bg-gray-950 text-white shadow-[0_8px_30px_rgba(17,24,39,0.18)]">
          <p className="text-xs text-white/55 font-semibold mb-2">Projected balance in {years} years</p>
          <p className="num text-4xl font-bold">{fmt(finalPoint.balance)}</p>
          <p className="text-sm text-white/60 mt-2 leading-relaxed">
            Your current setup turns {fmt(monthlyContribution + monthlyEmployerMatch)}/mo into this projected balance.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs text-white/50">Total contributions</p>
              <p className="num text-lg font-bold mt-1">{fmt(finalPoint.contributions)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs text-white/50">Market growth</p>
              <p className="num text-lg font-bold text-green-300 mt-1">{fmt(finalPoint.growth)}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-green-400/15 border border-green-300/20 p-4">
            <p className="text-xs text-green-200 font-semibold">One percent more</p>
            <p className="text-sm text-white/80 mt-1">
              Raising your contribution to {profile.contributionPct401k + 1}% could add about{' '}
              <span className="num font-bold text-green-200">{fmt(plusOneImpact)}</span> over {years} years.
            </p>
          </div>
        </section>
      )}

      <section className="rounded-2xl p-5 mb-3 animate-fade-up-2 bg-white border border-black/[0.06]">
        <p className="text-sm font-bold text-gray-900 mb-4">Balance over time</p>
        <figure>
          <figcaption className="sr-only">
            Line chart showing investment growth over {years} years. Final balance: {finalPoint ? fmt(finalPoint.balance) : '-'}.
          </figcaption>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growthData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(v: number) => `yr ${v}`} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => fmt(v)} tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', color: '#111827', fontSize: 12 }}
                cursor={{ stroke: 'rgba(0,0,0,0.06)' }}
                formatter={(value, name) => {
                  const n = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                  return [fmt(n), String(name)];
                }}
                labelFormatter={(label) => `Year ${label ?? ''}`}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              <Line type="monotone" dataKey="balance" name="Total balance"
                stroke="#111827" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#111827' }} />
              <Line type="monotone" dataKey="contributions" name="Contributions"
                stroke="#22c55e" strokeWidth={1.8} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </figure>
      </section>

      <section className="rounded-2xl p-5 mb-3 animate-fade-up-3 bg-white border border-black/[0.06]">
        <p className="text-sm font-bold text-gray-900 mb-4">Monthly engine</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Your contribution', value: fmt(monthlyContribution) + '/mo', tone: 'text-gray-900' },
            { label: 'Employer match', value: fmt(monthlyEmployerMatch) + '/mo', tone: 'text-green-700' },
            { label: 'Starting balance', value: fmt(profile.currentInvestmentBalance), tone: 'text-gray-900' },
            { label: 'Return rate', value: profile.expectedAnnualReturn + '%/yr', tone: 'text-gray-900' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className={`num text-sm font-bold ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
