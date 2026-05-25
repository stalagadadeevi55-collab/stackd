import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useProfileStore } from '../store/profileStore';

export function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <Outlet />;
}

export function OnboardingGuard() {
  const { user, loading } = useAuth();
  const profile = useProfileStore((s) => s.profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Redirect to onboarding if profile not yet completed
  if (!profile?.grossAnnualSalary) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
