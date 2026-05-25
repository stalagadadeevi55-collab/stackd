import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
        <span className="text-base font-bold tracking-tight gradient-text">Stackd</span>
        <Link
          to="/auth"
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-widest font-semibold"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Pill tag */}
        <div className="animate-fade-up mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-green-50 border border-green-200 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Free · Private · Works offline
        </div>

        {/* Headline */}
        <div className="animate-fade-up-1 text-center max-w-sm">
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] text-gray-900 mb-2">
            Your money,<br />
            <span className="gradient-text">finally clear.</span>
          </h1>
        </div>

        {/* Subheadline */}
        <p className="animate-fade-up-2 text-center text-gray-500 text-base mt-5 max-w-xs leading-relaxed font-normal">
          Paycheck breakdown, 401(k) optimizer, and 30-year wealth projection — in one place.
        </p>

        {/* Stat strip */}
        <div className="animate-fade-up-3 flex gap-0 mt-10 w-full max-w-sm rounded-2xl overflow-hidden bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {[
            { label: 'Take-home', value: '$5,242', sub: '/mo', color: '#22c55e' },
            { label: 'Employer match', value: '$5,400', sub: '/yr', color: '#0d9488' },
            { label: '30-yr projection', value: '$1.1M', sub: '', color: '#0ea5e9' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center justify-center py-4 px-2"
              style={{
                borderRight: i < 2 ? '1px solid rgba(0,0,0,0.06)' : undefined,
                borderTop: `3px solid ${s.color}`,
              }}
            >
              <span className="num text-lg font-bold text-gray-900">
                {s.value}<span className="text-gray-400 text-xs">{s.sub}</span>
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="animate-fade-up-4 mt-6 w-full max-w-sm">
          <Link to="/auth?signup=true">
            <button className="w-full py-4 rounded-xl text-base font-bold text-white gradient-brand transition-all duration-200 active:scale-[0.98] shadow-[0_4px_16px_rgba(34,197,94,0.35)] hover:shadow-[0_4px_24px_rgba(34,197,94,0.5)]">
              Build my wealth plan →
            </button>
          </Link>
          <p className="text-center text-xs text-gray-400 mt-3 tracking-wide">No credit card · Takes 2 minutes</p>
        </div>

        {/* Feature grid */}
        <div className="animate-fade-up-5 grid grid-cols-2 gap-3 mt-12 w-full max-w-sm">
          {[
            { icon: '💸', title: 'Paycheck decoder', desc: 'Every deduction explained', color: '#22c55e' },
            { icon: '🎯', title: '401(k) optimizer', desc: 'Never miss free match money', color: '#0d9488' },
            { icon: '📈', title: 'Growth projector', desc: 'See 10–40 year trajectories', color: '#0ea5e9' },
            { icon: '⚡', title: 'Priority engine', desc: 'Your best next financial move', color: '#f59e0b' },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-4 bg-white border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              style={{ borderTop: `3px solid ${f.color}` }}
            >
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <p className="text-sm font-semibold text-gray-900">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-normal">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
