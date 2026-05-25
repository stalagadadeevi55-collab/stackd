import type { Recommendation } from '../../types/index';
import { Link } from 'react-router-dom';

const typeRoutes: Record<Recommendation['type'], string> = {
  match: '/retirement',
  emergency: '/budget',
  debt: '/budget',
  roth: '/investments',
  '401k': '/retirement',
  brokerage: '/investments',
};

export function NextStepCard({ rec }: { rec: Recommendation }) {
  const route = typeRoutes[rec.type];

  return (
    <div className="rounded-2xl p-5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.06]"
      style={{ borderLeft: '4px solid #f59e0b' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⚡</span>
        <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Top priority</p>
      </div>
      <p className="font-bold text-gray-900 text-sm mb-1.5">{rec.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed font-normal">{rec.description}</p>
      {rec.actionable && (
        <Link
          to={route}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
        >
          Take action →
        </Link>
      )}
    </div>
  );
}
