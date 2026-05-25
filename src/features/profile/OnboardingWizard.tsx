import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useProfileStore } from '../../store/profileStore';
import { saveProfile } from '../../hooks/useProfile';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { US_STATES } from '../../lib/constants';
import { calculatePaycheck } from '../../lib/calculations/paycheck';
import { calculateEmployerMatch } from '../../lib/calculations/retirement';
import type { UserProfile, PayFrequency, FilingStatus } from '../../types/index';

const TOTAL_STEPS = 5;

type PartialProfile = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;

const defaults: PartialProfile = {
  age: 22,
  state: 'AR',
  city: 'Bentonville',
  grossAnnualSalary: 90000,
  payFrequency: 'biweekly',
  filingStatus: 'single',
  contributionPct401k: 6,
  employerMatchPct: 100,
  employerMatchCapPct: 6,
  monthlyRent: 0,
  monthlyCar: 0,
  monthlyInsurance: 0,
  monthlyStudentLoans: 0,
  monthlyFood: 0,
  monthlyUtilities: 0,
  monthlyFun: 0,
  monthlyTravel: 0,
  otherMonthlyExpenses: 0,
  emergencyFundMonths: 6,
  currentInvestmentBalance: 0,
  expectedAnnualReturn: 7,
};

const stepMeta = [
  { marker: '01', title: 'About you', subtitle: "Let's start with the basics." },
  { marker: '02', title: 'Income', subtitle: 'See estimated take-home as you type.' },
  { marker: '03', title: '401(k)', subtitle: 'Know whether the full match is captured.' },
  { marker: '04', title: 'Expenses', subtitle: 'Watch monthly surplus update live.' },
  { marker: '05', title: 'Goals', subtitle: 'Preview the plan before you finish.' },
];

function money(n: number) {
  return '$' + Math.round(Math.abs(n)).toLocaleString();
}

function PreviewStat({ label, value, tone = 'text-gray-900' }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`num text-sm font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const setProfile = useProfileStore((s) => s.setProfile);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PartialProfile>(defaults);

  function update(field: keyof PartialProfile, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function num(val: string) {
    return parseFloat(val) || 0;
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    const profile: UserProfile = {
      ...form,
      id: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { error } = await saveProfile(profile);
    if (!error) {
      setProfile(profile);
      navigate('/dashboard');
    }
    setSaving(false);
  }

  const meta = stepMeta[step - 1];
  const previewProfile: UserProfile = {
    ...form,
    id: user?.id ?? 'preview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const previewPaycheck = calculatePaycheck(previewProfile);
  const previewMatch = calculateEmployerMatch(previewProfile);
  const previewMonthlyTakeHome = (previewPaycheck.netPerPay * previewPaycheck.payPeriods) / 12;
  const previewMonthlyExpenses =
    form.monthlyRent +
    form.monthlyCar +
    form.monthlyInsurance +
    form.monthlyStudentLoans +
    form.monthlyFood +
    form.monthlyUtilities +
    form.monthlyFun +
    form.monthlyTravel +
    form.otherMonthlyExpenses;
  const previewSurplus = previewMonthlyTakeHome - previewMonthlyExpenses;
  const emergencyTarget = previewMonthlyExpenses * form.emergencyFundMonths;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-up">
          <span className="text-2xl font-bold tracking-tight gradient-text">Stackd</span>
          <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-widest font-semibold">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-1.5 mb-6 bg-gray-200 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500 gradient-brand"
            style={{ width: `${((step) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step card */}
        <div className="animate-fade-up bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-black/[0.06]">
          {/* Step header */}
          <div className="mb-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-xs font-bold text-white mb-3">
              {meta.marker}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{meta.title}</h2>
            <p className="text-sm text-gray-500 mt-1 font-normal">{meta.subtitle}</p>
          </div>

          {step === 1 && <Step1 form={form} onUpdate={update} onNum={num} />}
          {step === 2 && <Step2 form={form} onUpdate={update} onNum={num} />}
          {step === 3 && <Step3 form={form} onUpdate={update} onNum={num} />}
          {step === 4 && <Step4 form={form} onUpdate={update} onNum={num} />}
          {step === 5 && <Step5 form={form} onUpdate={update} onNum={num} />}

          <div className="mt-6 rounded-xl bg-gray-50 border border-black/[0.06] p-4">
            {step === 1 && (
              <>
                <p className="text-sm font-bold text-gray-900 mb-1">Local plan context</p>
                <p className="text-sm text-gray-500">We will use {form.city || 'your city'}, {form.state} for state tax and budget assumptions.</p>
              </>
            )}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <PreviewStat label="Per paycheck" value={money(previewPaycheck.netPerPay)} />
                <PreviewStat label="Monthly take-home" value={money(previewMonthlyTakeHome)} tone="text-green-700" />
              </div>
            )}
            {step === 3 && (
              <>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  {previewMatch.isCapturingFullMatch ? 'Full employer match captured' : `${money(previewMatch.missedMatchAnnual)} match still available`}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <PreviewStat label="You contribute" value={`${money(previewMatch.employeeAnnual)}/yr`} />
                  <PreviewStat label="Employer adds" value={`${money(previewMatch.employerAnnual)}/yr`} tone="text-green-700" />
                </div>
              </>
            )}
            {step === 4 && (
              <div className="grid grid-cols-2 gap-4">
                <PreviewStat label="Expenses" value={`${money(previewMonthlyExpenses)}/mo`} />
                <PreviewStat
                  label="Surplus"
                  value={`${previewSurplus >= 0 ? '+' : '-'}${money(previewSurplus)}/mo`}
                  tone={previewSurplus >= 0 ? 'text-green-700' : 'text-red-600'}
                />
              </div>
            )}
            {step === 5 && (
              <div className="grid grid-cols-2 gap-4">
                <PreviewStat label="Emergency target" value={money(emergencyTarget)} />
                <PreviewStat label="Starting balance" value={money(form.currentInvestmentBalance)} tone="text-green-700" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <Button variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button className="flex-1" loading={saving} onClick={() => void handleFinish()}>
              Build my plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  form: PartialProfile;
  onUpdate: (field: keyof PartialProfile, value: string | number) => void;
  onNum: (val: string) => number;
}

function Step1({ form, onUpdate, onNum }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Age" type="number" name="age" value={form.age} min={16} max={80}
        onChange={(e) => onUpdate('age', onNum(e.target.value))} />
      <Select label="State" name="state" value={form.state}
        options={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
        onChange={(e) => onUpdate('state', e.target.value)} />
      <Input label="City" type="text" name="city" value={form.city} placeholder="e.g. Bentonville"
        onChange={(e) => onUpdate('city', e.target.value)} />
    </div>
  );
}

function Step2({ form, onUpdate, onNum }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Gross annual salary" type="number" name="grossAnnualSalary" value={form.grossAnnualSalary}
        prefix="$" hint="Before taxes and deductions"
        onChange={(e) => onUpdate('grossAnnualSalary', onNum(e.target.value))} />
      <Select label="Pay frequency" name="payFrequency" value={form.payFrequency}
        options={[
          { value: 'biweekly', label: 'Every two weeks (biweekly, 26×/yr)' },
          { value: 'semi_monthly', label: 'Twice a month (semi-monthly, 24×/yr)' },
          { value: 'monthly', label: 'Once a month (12×/yr)' },
        ]}
        onChange={(e) => onUpdate('payFrequency', e.target.value as PayFrequency)} />
      <Select label="Filing status" name="filingStatus" value={form.filingStatus}
        options={[
          { value: 'single', label: 'Single' },
          { value: 'married_filing_jointly', label: 'Married filing jointly' },
          { value: 'married_filing_separately', label: 'Married filing separately' },
          { value: 'head_of_household', label: 'Head of household' },
        ]}
        onChange={(e) => onUpdate('filingStatus', e.target.value as FilingStatus)} />
    </div>
  );
}

function Step3({ form, onUpdate, onNum }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Your 401(k) contribution" type="number" name="contributionPct401k"
        value={form.contributionPct401k} suffix="%" min={0} max={100}
        hint="Percentage of your salary you contribute"
        onChange={(e) => onUpdate('contributionPct401k', onNum(e.target.value))} />
      <Input label="Employer match rate" type="number" name="employerMatchPct"
        value={form.employerMatchPct} suffix="%" min={0} max={200}
        hint="e.g. 100 means dollar-for-dollar match"
        onChange={(e) => onUpdate('employerMatchPct', onNum(e.target.value))} />
      <Input label="Employer match cap" type="number" name="employerMatchCapPct"
        value={form.employerMatchCapPct} suffix="% of salary" min={0} max={100}
        hint="The max % of salary your employer will match"
        onChange={(e) => onUpdate('employerMatchCapPct', onNum(e.target.value))} />
    </div>
  );
}

function Step4({ form, onUpdate, onNum }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Monthly rent / mortgage" type="number" name="monthlyRent" value={form.monthlyRent} prefix="$"
        onChange={(e) => onUpdate('monthlyRent', onNum(e.target.value))} />
      <Input label="Food & dining" type="number" name="monthlyFood" value={form.monthlyFood} prefix="$"
        onChange={(e) => onUpdate('monthlyFood', onNum(e.target.value))} />
      <Input label="Utilities" type="number" name="monthlyUtilities" value={form.monthlyUtilities} prefix="$"
        onChange={(e) => onUpdate('monthlyUtilities', onNum(e.target.value))} />
      <Input label="Car payment" type="number" name="monthlyCar" value={form.monthlyCar} prefix="$"
        onChange={(e) => onUpdate('monthlyCar', onNum(e.target.value))} />
      <Input label="Insurance (health, auto, etc.)" type="number" name="monthlyInsurance" value={form.monthlyInsurance} prefix="$"
        onChange={(e) => onUpdate('monthlyInsurance', onNum(e.target.value))} />
      <Input label="Fun & entertainment" type="number" name="monthlyFun" value={form.monthlyFun} prefix="$"
        onChange={(e) => onUpdate('monthlyFun', onNum(e.target.value))} />
      <Input label="Travel" type="number" name="monthlyTravel" value={form.monthlyTravel} prefix="$"
        onChange={(e) => onUpdate('monthlyTravel', onNum(e.target.value))} />
      <Input label="Student loan payments" type="number" name="monthlyStudentLoans" value={form.monthlyStudentLoans} prefix="$"
        onChange={(e) => onUpdate('monthlyStudentLoans', onNum(e.target.value))} />
      <Input label="Other monthly expenses" type="number" name="otherMonthlyExpenses" value={form.otherMonthlyExpenses} prefix="$"
        hint="Subscriptions, pets, gifts, and anything uncategorized"
        onChange={(e) => onUpdate('otherMonthlyExpenses', onNum(e.target.value))} />
    </div>
  );
}

function Step5({ form, onUpdate, onNum }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Emergency fund target" type="number" name="emergencyFundMonths"
        value={form.emergencyFundMonths} suffix="months" min={1} max={12}
        hint="Recommended: 3–6 months of expenses"
        onChange={(e) => onUpdate('emergencyFundMonths', onNum(e.target.value))} />
      <Input label="Current savings / investment balance" type="number" name="currentInvestmentBalance"
        value={form.currentInvestmentBalance} prefix="$"
        hint="401k, IRA, brokerage, savings — all combined"
        onChange={(e) => onUpdate('currentInvestmentBalance', onNum(e.target.value))} />
      <Input label="Expected annual investment return" type="number" name="expectedAnnualReturn"
        value={form.expectedAnnualReturn} suffix="%" min={0} max={20}
        hint="Historical S&P 500 average is ~7% after inflation"
        onChange={(e) => onUpdate('expectedAnnualReturn', onNum(e.target.value))} />
    </div>
  );
}
