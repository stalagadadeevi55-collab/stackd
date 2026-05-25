import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(params.get('signup') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (err) {
      setError(err);
    } else if (isSignUp) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <Link to="/" className="block text-center mb-10">
          <span className="text-2xl font-bold tracking-tight gradient-text">Stackd</span>
        </Link>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-2xl mb-6 bg-white border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <button
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl uppercase tracking-widest transition-all duration-150 ${
              !isSignUp
                ? 'gradient-brand text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Log in
          </button>
          <button
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl uppercase tracking-widest transition-all duration-150 ${
              isSignUp
                ? 'gradient-brand text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            autoComplete="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            hint={isSignUp ? 'At least 6 characters' : undefined}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-xs text-red-600 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full mt-1" loading={loading}>
            {isSignUp ? 'Create account' : 'Log in'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {isSignUp ? 'Already have an account? ' : 'New here? '}
          <button
            className="text-green-600 hover:text-green-700 transition-colors font-semibold"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          >
            {isSignUp ? 'Log in' : 'Sign up free'}
          </button>
        </p>
      </div>
    </div>
  );
}
