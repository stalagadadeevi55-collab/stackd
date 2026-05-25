export function Disclaimer() {
  return (
    <div role="note" className="rounded-2xl p-4 mt-4 bg-amber-50 border border-amber-200">
      <p className="text-xs text-amber-700 leading-relaxed">
        <span className="font-semibold">Estimates only.</span>{' '}
        These calculations are for planning and educational purposes. They use simplified tax logic
        and do not account for all deductions, credits, or individual circumstances. Consult a
        qualified financial advisor or tax professional for personalized advice.
      </p>
    </div>
  );
}
