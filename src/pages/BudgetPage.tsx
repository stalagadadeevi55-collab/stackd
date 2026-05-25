import { useMemo } from 'react';
import { useProfileStore } from '../store/profileStore';
import { usePaycheck } from '../hooks/usePaycheck';
import { PageHeader } from '../components/layout/PageHeader';
import { Disclaimer } from '../components/ui/Disclaimer';

function fmt(n: number) {
  return '$' + Math.round(Math.abs(n)).toLocaleString();
}

function pct(n: number) {
  return n.toFixed(1) + '%';
}

export function BudgetPage() {
  const profile = useProfileStore((s) => s.profile);
  const paycheck = usePaycheck();

  const monthlyTakeHome = paycheck ? (paycheck.netPerPay * paycheck.payPeriods) / 12 : 0;

  const expenses = useMemo(() => {
    if (!profile) return [];
    return [
      { name: 'Rent / mortgage', value: profile.monthlyRent, color: 'bg-green-500' },
      { name: 'Food & dining', value: profile.monthlyFood, color: 'bg-orange-500' },
      { name: 'Utilities', value: profile.monthlyUtilities, color: 'bg-sky-500' },
      { name: 'Car payment', value: profile.monthlyCar, color: 'bg-teal-500' },
      { name: 'Insurance', value: profile.monthlyInsurance, color: 'bg-amber-500' },
      { name: 'Fun & entertainment', value: profile.monthlyFun, color: 'bg-violet-500' },
      { name: 'Travel', value: profile.monthlyTravel, color: 'bg-pink-500' },
      { name: 'Student loans', value: profile.monthlyStudentLoans, color: 'bg-red-500' },
      { name: 'Other expenses', value: profile.otherMonthlyExpenses, color: 'bg-gray-400' },
    ]
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [profile]);

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-sm">Complete your profile to see your budget breakdown.</p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);
  const surplus = monthlyTakeHome - totalExpenses;
  const surplusPositive = surplus >= 0;
  const savingsRate = monthlyTakeHome > 0 ? Math.max(0, surplus / monthlyTakeHome) * 100 : 0;
  const largestExpense = expenses[0];
  const emergencyTarget = totalExpenses * profile.emergencyFundMonths;
  const emergencyGap = Math.max(0, emergencyTarget - profile.currentInvestmentBalance);
  const maxExpense = Math.max(...expenses.map((e) => e.value), 1);

  return (
    <div>
      <PageHeader title="Monthly budget" subtitle="Your cash-flow pressure map" />

      <section className={`rounded-2xl p-6 mb-4 animate-fade-up ${surplusPositive ? 'bg-gray-950 text-white' : 'bg-red-50 border border-red-200'}`}>
        <p className={`text-xs font-semibold mb-2 ${surplusPositive ? 'text-white/55' : 'text-red-500'}`}>
          Monthly result
        </p>
        <p className={`num text-4xl font-bold ${surplusPositive ? 'text-green-300' : 'text-red-600'}`}>
          {surplusPositive ? '+' : '-'}{fmt(surplus)}
        </p>
        <p className={`text-sm mt-2 leading-relaxed ${surplusPositive ? 'text-white/65' : 'text-red-600'}`}>
          {surplusPositive
            ? `${pct(savingsRate)} of take-home is available for saving, debt payoff, or investing.`
            : `Expenses are running ${fmt(surplus)} above take-home each month.`}
        </p>

        <div className={`mt-5 rounded-xl p-4 ${surplusPositive ? 'bg-white/10' : 'bg-white'}`}>
          <p className={`text-xs font-semibold mb-1 ${surplusPositive ? 'text-white/50' : 'text-gray-500'}`}>
            Best budget lever
          </p>
          <p className={`text-base font-bold ${surplusPositive ? 'text-white' : 'text-gray-900'}`}>
            {largestExpense ? `${largestExpense.name} is your largest line item.` : 'Add expenses to see spending pressure.'}
          </p>
          <p className={`text-sm mt-1 ${surplusPositive ? 'text-white/60' : 'text-gray-500'}`}>
            {largestExpense
              ? `A 10% change here would move about ${fmt(largestExpense.value * 0.1)} per month.`
              : 'Once expenses are entered, this becomes your fastest lever.'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-up-1">
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Take-home</p>
          <p className="num text-xl font-bold text-gray-900">{fmt(monthlyTakeHome)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Expenses</p>
          <p className="num text-xl font-bold text-gray-900">{fmt(totalExpenses)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Savings rate</p>
          <p className="num text-xl font-bold text-gray-900">{pct(savingsRate)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-black/[0.06]">
          <p className="text-xs text-gray-500 mb-2">Emergency gap</p>
          <p className="num text-xl font-bold text-gray-900">{fmt(emergencyGap)}</p>
        </div>
      </div>

      <section className="rounded-2xl p-5 mb-3 animate-fade-up-2 bg-white border border-black/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">Spending rank</p>
          <p className="text-xs text-gray-400">{expenses.length} categories</p>
        </div>
        <div className="space-y-4">
          {expenses.map((item) => {
            const share = monthlyTakeHome > 0 ? (item.value / monthlyTakeHome) * 100 : 0;
            const width = Math.max(6, (item.value / maxExpense) * 100);
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                  <span className="num text-sm font-bold text-gray-900">{fmt(item.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${width}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct(share)} of take-home</p>
              </div>
            );
          })}
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
