import { NavLink, Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../auth/AuthContext';

const desktopNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/paycheck', label: 'Paycheck' },
  { to: '/retirement', label: '401(k)' },
  { to: '/investments', label: 'Invest' },
  { to: '/budget', label: 'Budget' },
  { to: '/scenarios', label: 'Scenarios' },
];

export function AppShell() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop nav */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 sticky top-0 z-50 bg-white border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight gradient-text">Stackd</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <NavLink to="/settings" className="text-xs text-gray-400 hover:text-gray-700 transition-colors tracking-wider uppercase">
            Settings
          </NavLink>
          <button
            onClick={() => void signOut()}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors tracking-wider uppercase"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="flex lg:hidden items-center justify-between px-5 py-4 sticky top-0 z-50 bg-white border-b border-black/[0.06]">
        <span className="text-base font-bold tracking-tight gradient-text">Stackd</span>
        <NavLink to="/settings" className="text-xs text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wider">
          Settings
        </NavLink>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:pb-10">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
