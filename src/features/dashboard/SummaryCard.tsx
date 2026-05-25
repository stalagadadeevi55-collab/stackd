interface SummaryCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
  color?: string;
}

export function SummaryCard({ label, value, sublabel, accent = false, color = '#22c55e' }: SummaryCardProps) {
  return (
    <div className="rounded-2xl p-4 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.06]"
      style={{ borderTop: `3px solid ${color}` }}>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">{label}</p>
      <p className={`num text-2xl font-bold tracking-tight ${accent ? 'text-green-700' : 'text-gray-900'}`}>
        {value}
      </p>
      {sublabel && <p className="text-[10px] text-gray-400 mt-1 font-normal">{sublabel}</p>}
    </div>
  );
}
