import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';
import { toUserProfile, toProfileRow } from '../lib/profileMapper';
import { useProfileStore } from '../store/profileStore';
import type { UserProfile } from '../types/index';

export function useProfile() {
  const { user } = useAuth();
  const { profile, setProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (err) {
        if (err.code !== 'PGRST116') { // PGRST116 = no rows found
          setError(err.message);
        }
        setLoading(false);
        return;
      }

      if (data) {
        const fetched = toUserProfile(data);
        // Only update if fetched data is newer than cached
        if (!profile || fetched.updatedAt > profile.updatedAt) {
          setProfile(fetched);
        }
      }
      setLoading(false);
    }

    void fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { profile, loading, error };
}

export async function saveProfile(profile: UserProfile): Promise<{ error: string | null }> {
  const row = toProfileRow(profile);
  const { error } = await supabase.from('profiles').upsert(row);
  return { error: error?.message ?? null };
}
