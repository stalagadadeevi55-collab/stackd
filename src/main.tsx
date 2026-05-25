import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UpdateBanner } from './components/ui/UpdateBanner';
import { router } from './router';
import './index.css';

export function Root() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const cleanup = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegisteredSW(_swUrl, registration) {
        setUpdateSW(() => async () => {
          await (registration as ServiceWorkerRegistration | undefined)?.update();
          window.location.reload();
        });
      },
    });
    return () => { void cleanup?.(); };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
        {needRefresh && updateSW && (
          <UpdateBanner onReload={() => void updateSW()} />
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
