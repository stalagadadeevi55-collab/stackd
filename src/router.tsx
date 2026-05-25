import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PaycheckPage } from './pages/PaycheckPage';
import { RetirementPage } from './pages/RetirementPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { BudgetPage } from './pages/BudgetPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthGuard, OnboardingGuard } from './auth/AuthGuard';
import { AppShell } from './components/layout/AppShell';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/auth', element: <AuthPage /> },
  {
    // Auth required — shows spinner / redirects to /auth if not logged in
    element: <AuthGuard />,
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      {
        // Profile required — redirects to /onboarding if profile not set up
        element: <OnboardingGuard />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/paycheck', element: <PaycheckPage /> },
              { path: '/retirement', element: <RetirementPage /> },
              { path: '/investments', element: <InvestmentsPage /> },
              { path: '/budget', element: <BudgetPage /> },
              { path: '/scenarios', element: <ScenariosPage /> },
              { path: '/settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
