import { Link } from 'react-router-dom';
import { ProfileForm } from '../features/profile/ProfileForm';
import { PageHeader } from '../components/layout/PageHeader';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';

export function SettingsPage() {
  const { signOut, user } = useAuth();

  return (
    <div>
      <PageHeader title="Settings" subtitle={user?.email ?? ''} />

      {/* Re-run AI advisor */}
      <div className="rounded-2xl p-5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.06] mb-6"
        style={{ borderTop: '3px solid #22c55e' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Re-run AI advisor</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Moving cities, got a raise, or switching jobs? Let the AI rebuild your plan from scratch with your new info.
            </p>
            <Link
              to="/onboarding?rerun=true"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              Start fresh conversation →
            </Link>
          </div>
        </div>
      </div>

      <ProfileForm />

      <div className="mt-8 pt-6 border-t border-gray-100">
        <Button variant="danger" onClick={() => void signOut()}>Sign out</Button>
      </div>
    </div>
  );
}
