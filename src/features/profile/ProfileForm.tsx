import { useState } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { saveProfile } from '../../hooks/useProfile';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { US_STATES } from '../../lib/constants';
import type { UserProfile, PayFrequency, FilingStatus } from '../../types/index';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h2>
      {children}
    </div>
  );
}

export function ProfileForm() {
  const { profile, setProfile } = useProfileStore();
  const [form, setForm] = useState<UserProfile | null>(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!form) return <p className="text-gray-400 text-sm">No profile loaded.</p>;

  function update(field: keyof UserProfile, value: string | number | boolean | null) {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  }

  function num(val: string) {
    return parseFloat(val) || 0;
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    const updated = { ...form, updatedAt: new Date().toISOString() };
    const { error } = await saveProfile(updated);
    if (!error) {
      setProfile(updated);
      setSaved(true);
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="About you">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Age" type="number" name="age" value={form.age} min={16} max={80}
            onChange={(e) => update('age', num(e.target.value))} />
          <Select label="Residence state" name="state" value={form.state}
            options={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
            onChange={(e) => update('state', e.target.value)} />
          <Input label="City" type="text" name="city" value={form.city}
            onChange={(e) => update('city', e.target.value)} />
          <Input label="Employer" type="text" name="employerName" value={form.employerName ?? ''}
            placeholder="e.g. Walmart"
            onChange={(e) => update('employerName', e.target.value)} />
          <div className="col-span-2">
            <Select label="Work arrangement" name="isRemote" value={form.isRemote ? 'true' : 'false'}
              options={[
                { value: 'false', label: 'In-office / Hybrid' },
                { value: 'true', label: 'Fully remote' },
              ]}
              onChange={(e) => update('isRemote', e.target.value === 'true')} />
          </div>
          {form.isRemote && (
            <div className="col-span-2">
              <Select label="Employer's state (payroll)" name="employerState" value={form.employerState ?? ''}
                options={[{ value: '', label: 'Same as residence' }, ...US_STATES.map((s) => ({ value: s.code, label: s.name }))]}
                hint="Determines which state tax your employer withholds — confirm with HR"
                onChange={(e) => update('employerState', e.target.value || null)} />
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Income">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Gross annual salary" type="number" name="grossAnnualSalary"
            value={form.grossAnnualSalary} prefix="$"
            onChange={(e) => update('grossAnnualSalary', num(e.target.value))} />
          <Select label="Pay frequency" name="payFrequency" value={form.payFrequency}
            options={[
              { value: 'biweekly', label: 'Biweekly (26×)' },
              { value: 'semi_monthly', label: 'Semi-monthly (24×)' },
              { value: 'monthly', label: 'Monthly (12×)' },
            ]}
            onChange={(e) => update('payFrequency', e.target.value as PayFrequency)} />
          <div className="col-span-2">
            <Select label="Filing status" name="filingStatus" value={form.filingStatus}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married_filing_jointly', label: 'Married filing jointly' },
                { value: 'married_filing_separately', label: 'Married filing separately' },
                { value: 'head_of_household', label: 'Head of household' },
              ]}
              onChange={(e) => update('filingStatus', e.target.value as FilingStatus)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="401(k)">
        <div className="grid grid-cols-3 gap-3">
          <Input label="Your contrib." type="number" name="contributionPct401k"
            value={form.contributionPct401k} suffix="%" min={0} max={100}
            onChange={(e) => update('contributionPct401k', num(e.target.value))} />
          <Input label="Match rate" type="number" name="employerMatchPct"
            value={form.employerMatchPct} suffix="%" min={0}
            onChange={(e) => update('employerMatchPct', num(e.target.value))} />
          <Input label="Match cap" type="number" name="employerMatchCapPct"
            value={form.employerMatchCapPct} suffix="%" min={0} max={100}
            onChange={(e) => update('employerMatchCapPct', num(e.target.value))} />
        </div>
      </SectionCard>

      <SectionCard title="Monthly expenses">
        <div className="grid grid-cols-3 gap-3">
          <Input label="Rent" type="number" name="monthlyRent" value={form.monthlyRent} prefix="$"
            onChange={(e) => update('monthlyRent', num(e.target.value))} />
          <Input label="Food & dining" type="number" name="monthlyFood" value={form.monthlyFood} prefix="$"
            onChange={(e) => update('monthlyFood', num(e.target.value))} />
          <Input label="Utilities" type="number" name="monthlyUtilities" value={form.monthlyUtilities} prefix="$"
            onChange={(e) => update('monthlyUtilities', num(e.target.value))} />
          <Input label="Car" type="number" name="monthlyCar" value={form.monthlyCar} prefix="$"
            onChange={(e) => update('monthlyCar', num(e.target.value))} />
          <Input label="Insurance" type="number" name="monthlyInsurance" value={form.monthlyInsurance} prefix="$"
            onChange={(e) => update('monthlyInsurance', num(e.target.value))} />
          <Input label="Fun" type="number" name="monthlyFun" value={form.monthlyFun} prefix="$"
            onChange={(e) => update('monthlyFun', num(e.target.value))} />
          <Input label="Travel" type="number" name="monthlyTravel" value={form.monthlyTravel} prefix="$"
            onChange={(e) => update('monthlyTravel', num(e.target.value))} />
          <Input label="Student loans" type="number" name="monthlyStudentLoans" value={form.monthlyStudentLoans} prefix="$"
            onChange={(e) => update('monthlyStudentLoans', num(e.target.value))} />
          <Input label="Other" type="number" name="otherMonthlyExpenses" value={form.otherMonthlyExpenses} prefix="$"
            onChange={(e) => update('otherMonthlyExpenses', num(e.target.value))} />
        </div>
      </SectionCard>

      <SectionCard title="Goals">
        <div className="grid grid-cols-3 gap-3">
          <Input label="Emergency fund" type="number" name="emergencyFundMonths"
            value={form.emergencyFundMonths} suffix="mo" min={1} max={12}
            onChange={(e) => update('emergencyFundMonths', num(e.target.value))} />
          <Input label="Current savings" type="number" name="currentInvestmentBalance"
            value={form.currentInvestmentBalance} prefix="$"
            onChange={(e) => update('currentInvestmentBalance', num(e.target.value))} />
          <Input label="Annual return" type="number" name="expectedAnnualReturn"
            value={form.expectedAnnualReturn} suffix="%" min={0} max={20}
            onChange={(e) => update('expectedAnnualReturn', num(e.target.value))} />
        </div>
      </SectionCard>

      <div className="flex items-center gap-3">
        <Button onClick={() => void handleSave()} loading={saving} className="flex-1">
          Save changes
        </Button>
        {saved && <span className="text-sm font-bold text-green-600">Saved ✓</span>}
      </div>
    </div>
  );
}
