import { useState, useMemo } from 'react';
import { useProfileStore } from '../store/profileStore';
import { calculatePaycheck } from '../lib/calculations/paycheck';
import { PageHeader } from '../components/layout/PageHeader';
import { Disclaimer } from '../components/ui/Disclaimer';

function fmt(n: number, decimals = 0) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

interface LineItemProps {
  label: string;
  perPay: number;
  annual: number;
  dimmed?: boolean;
  bold?: boolean;
  accent?: boolean;
}

function LineItem({ label, perPay, annual, dimmed = false, bold = false, accent = false }: LineItemProps) {
  const textColor = accent ? 'text-green-700' : dimmed ? 'text-gray-400' : 'text-gray-700';
  const weightClass = bold ? 'font-bold' : 'font-normal';

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className={`text-xs ${textColor} ${weightClass}`}>{label}</span>
      <div className="text-right">
        <span className={`num text-sm ${textColor} ${weightClass}`}>{fmt(perPay, 2)}</span>
        <span className="num text-[10px] text-gray-400 ml-3">{fmt(annual)} /yr</span>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-3 pb-1 font-semibold">
      {children}
    </p>
  );
}

export function PaycheckPage() {
  const profile = useProfileStore((s) => s.profile);
  const [taxView, setTaxView] = useState<'residence' | 'employer'>('residence');

  const isDualState = !!(profile?.isRemote && profile.employerState && profile.employerState !== profile.state);

  const residencePaycheck = useMemo(() => {
    if (!profile) return null;
    return calculatePaycheck(profile);
  }, [profile]);

  const employerPaycheck = useMemo(() => {
    if (!profile || !isDualState || !profile.employerState) return null;
    return calculatePaycheck({ ...profile, state: profile.employerState });
  }, [profile, isDualState]);

  const paycheck = taxView === 'employer' && employerPaycheck ? employerPaycheck : residencePaycheck;

  if (!paycheck || !profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-sm">Complete your profile to see your paycheck breakdown.</p>
      </div>
    );
  }

  const freqLabel = {
    biweekly: 'biweekly (26×/yr)',
    semi_monthly: 'semi-monthly (24×/yr)',
    monthly: 'monthly (12×/yr)',
  }[profile.payFrequency];

  const displayState = taxView === 'employer' ? (profile.employerState ?? profile.state) : profile.state;
  const netDiff = employerPaycheck ? residencePaycheck!.netPerPay - employerPaycheck.netPerPay : 0;

  return (
    <div>
      <PageHeader
        title="Paycheck breakdown"
        subtitle={`Paid ${freqLabel} · ${fmt(paycheck.grossPerPay, 2)} gross per paycheck`}
      />

      {/* Dual-state tax toggle */}
      {isDualState && (
        <div className="rounded-2xl p-4 mb-3 animate-fade-up bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Remote worker — tax situation varies</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                You live in <strong>{profile.state}</strong> but your employer is in <strong>{profile.employerState}</strong>.
                Your actual withholding depends on which state your company's payroll is set up in. Check with HR!
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTaxView('residence')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                taxView === 'residence'
                  ? 'gradient-brand text-white shadow-sm'
                  : 'bg-white border border-amber-200 text-amber-700'
              }`}
            >
              {profile.state} (where you live)
            </button>
            <button
              onClick={() => setTaxView('employer')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                taxView === 'employer'
                  ? 'gradient-brand text-white shadow-sm'
                  : 'bg-white border border-amber-200 text-amber-700'
              }`}
            >
              {profile.employerState} (employer state)
            </button>
          </div>

          {employerPaycheck && netDiff !== 0 && (
            <p className="text-[11px] text-amber-700 mt-2 text-center">
              Taxed as <strong>{profile.employerState}</strong> = <strong>{fmt(Math.abs(netDiff), 2)}/{freqLabel.split(' ')[0]} {netDiff > 0 ? 'more' : 'less'}</strong> take-home
            </p>
          )}
        </div>
      )}

      {/* Main breakdown */}
      <div className="rounded-2xl p-5 mb-3 bg-white border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.06)] animate-fade-up-1"
        style={{ borderTop: '3px solid #22c55e' }}>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">
          Per paycheck / Annual {isDualState && <span className="normal-case text-amber-600">— {displayState} tax</span>}
        </p>

        <LineItem label="Gross pay" perPay={paycheck.grossPerPay} annual={paycheck.grossAnnual} bold />

        <SectionLabel>Pre-tax deductions</SectionLabel>
        <LineItem label={`401(k) contribution (${profile.contributionPct401k}%)`}
          perPay={-paycheck.contribution401kPerPay} annual={-paycheck.contribution401kAnnual} dimmed />

        <SectionLabel>Taxes (estimated)</SectionLabel>
        <LineItem label="Federal income tax" perPay={-paycheck.federalTaxPerPay} annual={-paycheck.federalTaxAnnual} dimmed />
        <LineItem label={`State tax (${displayState})`} perPay={-paycheck.stateTaxPerPay} annual={-paycheck.stateTaxAnnual} dimmed />
        <LineItem label="Social Security (6.2%)" perPay={-paycheck.socialSecurityPerPay} annual={-paycheck.socialSecurityAnnual} dimmed />
        <LineItem label="Medicare (1.45%)" perPay={-paycheck.medicarePerPay} annual={-paycheck.medicareAnnual} dimmed />
        {paycheck.additionalMedicareAnnual > 0 && (
          <LineItem label="Additional Medicare (0.9%)" perPay={-paycheck.additionalMedicarePerPay} annual={-paycheck.additionalMedicareAnnual} dimmed />
        )}

        <div className="border-t border-gray-100 mt-2 pt-1">
          <LineItem label="Net take-home pay" perPay={paycheck.netPerPay} annual={paycheck.netAnnual} bold accent />
        </div>
      </div>

      {/* Effective rates */}
      <div className="rounded-2xl p-5 mb-3 bg-white border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.06)] animate-fade-up-2"
        style={{ borderTop: '3px solid #0d9488' }}>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-4">Effective rates</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Federal effective rate', value: ((paycheck.federalTaxAnnual / paycheck.grossAnnual) * 100).toFixed(1) + '%' },
            { label: 'Total tax rate', value: (((paycheck.federalTaxAnnual + paycheck.stateTaxAnnual + paycheck.socialSecurityAnnual + paycheck.medicareAnnual) / paycheck.grossAnnual) * 100).toFixed(1) + '%' },
            { label: '401(k) rate', value: profile.contributionPct401k + '%' },
            { label: 'Take-home rate', value: ((paycheck.netAnnual / paycheck.grossAnnual) * 100).toFixed(1) + '%' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="num text-xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
