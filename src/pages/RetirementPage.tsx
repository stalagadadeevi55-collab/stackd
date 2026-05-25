import { useMemo } from 'react';
import { useProfileStore } from '../store/profileStore';
import { calculateEmployerMatch } from '../lib/calculations/retirement';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Disclaimer } from '../components/ui/Disclaimer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString();
}

export function RetirementPage() {
  const profile = useProfileStore((s) => s.profile);

  const match = useMemo(() => {
    if (!profile) return null;
    return calculateEmployerMatch(profile);
  }, [profile]);

  if (!profile || !match) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-sm">Complete your profile to see your 401(k) details.</p>
      </div>
    );
  }

  const chartData = [
    { name: 'You', value: match.employeeAnnual, fill: '#111827' },
    { name: 'Employer', value: match.employerAnnual, fill: '#22c55e' },
    { name: 'Missed', value: match.missedMatchAnnual, fill: '#f59e0b' },
  ].filter((item) => item.value > 0);

  const requiredMonthlyIncrease = Math.max(
    0,
    (profile.grossAnnualSalary * ((profile.employerMatchCapPct - profile.contributionPct401k) / 100)) / 12,
  );

  return (
    <div>
      <PageHeader
        title="401(k) match"
        subtitle={`${profile.employerMatchPct}% match up to ${profile.employerMatchCapPct}% of salary`}
      />

      <section className={`rounded-2xl p-6 mb-4 animate-fade-up ${match.isCapturingFullMatch ? 'bg-gray-950 text-white' : 'bg-amber-50 border border-amber-200'}`}>
        <p className={`text-xs font-semibold mb-2 ${match.isCapturingFullMatch ? 'text-white/55' : 'text-amber-700'}`}>
          Match status
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight ${match.isCapturingFullMatch ? 'text-white' : 'text-amber-950'}`}>
              {match.isCapturingFullMatch ? 'Full match captured.' : `${fmt(match.missedMatchAnnual)} still available.`}
            </h2>
            <p className={`text-sm mt-2 leading-relaxed ${match.isCapturingFullMatch ? 'text-white/65' : 'text-amber-800'}`}>
              {match.isCapturingFullMatch
                ? 'Your current contribution is high enough to collect the available employer match.'
                : `Move from ${profile.contributionPct401k}% to ${profile.employerMatchCapPct}% to collect the rest of your employer match.`}
            </p>
          </div>
          <Badge variant={match.isCapturingFullMatch ? 'green' : 'yellow'}>
            {match.isCapturingFullMatch ? 'Captured' : 'Missing'}
          </Badge>
        </div>

        {!match.isCapturingFullMatch && (
          <div className="mt-5 rounded-xl bg-white p-4">
            <p className="text-xs text-amber-700 font-semibold">Payroll change to ask for</p>
            <p className="text-sm text-gray-900 mt-1">
              Increase contributions by about <span className="num font-bold">{fmt(requiredMonthlyIncrease)}/mo</span>.
              That unlocks <span className="num font-bold text-green-700">{fmt(match.missedMatchAnnual)}/yr</span> from your employer.
            </p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-up-1">
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Your annual</p>
          <p className="num text-xl font-bold text-gray-900">{fmt(match.employeeAnnual)}</p>
          <p className="text-xs text-gray-400 mt-1">{profile.contributionPct401k}% of salary</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Employer match</p>
          <p className="num text-xl font-bold text-green-700">{fmt(match.employerAnnual)}</p>
          <p className="text-xs text-gray-400 mt-1">Free compensation</p>
        </div>
        <div className="rounded-xl p-4 col-span-2 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Total annual retirement savings</p>
          <p className="num text-2xl font-bold text-gray-900">{fmt(match.totalAnnual)}</p>
          <p className="text-xs text-gray-400 mt-1">Combined employee + employer</p>
        </div>
      </div>

      <section className="rounded-2xl p-5 mb-3 animate-fade-up-2 bg-white border border-black/[0.06]">
        <p className="text-sm font-bold text-gray-900 mb-4">Contribution breakdown</p>
        <figure>
          <figcaption className="sr-only">
            Bar chart: employee {fmt(match.employeeAnnual)}, employer {fmt(match.employerAnnual)}.
          </figcaption>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', color: '#111827', fontSize: 12 }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                formatter={(value) => {
                  const n = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                  return [fmt(n), ''];
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </figure>
      </section>

      <section className="rounded-2xl p-5 mb-3 animate-fade-up-3 bg-white border border-black/[0.06]">
        <p className="text-sm font-bold text-gray-900 mb-2">Roth IRA checkpoint</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          For 2026, the IRA contribution limit is $7,500, plus a $1,100 catch-up amount if you are 50 or older.
          Roth IRA eligibility phases out from $153,000 to $168,000 for single filers and $242,000 to $252,000 for joint filers.
        </p>
        <a
          href="https://www.irs.gov/pub/irs-drop/n-25-67.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold mt-3 inline-block text-green-700 hover:text-green-800 transition-colors"
        >
          IRS 2026 limits
        </a>
      </section>

      <Disclaimer />
    </div>
  );
}
