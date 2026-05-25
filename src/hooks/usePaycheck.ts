import { useMemo } from 'react';
import { useProfileStore } from '../store/profileStore';
import { calculatePaycheck } from '../lib/calculations/paycheck';
import type { PaycheckResult } from '../types/index';

export function usePaycheck(): PaycheckResult | null {
  const profile = useProfileStore((s) => s.profile);

  return useMemo(() => {
    if (!profile || !profile.grossAnnualSalary) return null;
    return calculatePaycheck(profile);
  }, [profile]);
}
