import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const resolving = useRef(false);
  const initialized = useRef(false);

  const fetchRole = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return (!error && data) ? data.role : 'user';
  };

  const resolveUser = async (session) => {
    if (resolving.current) return;
    resolving.current = true;
    // Supabase re-validates the session (and fires onAuthStateChange) whenever
    // the tab regains focus, e.g. after switching tabs. Only show the
    // full-screen loading state on the very first resolution — otherwise the
    // whole app remounts on every tab-focus and the user loses their place.
    if (!initialized.current) setLoading(true);

    const currentUser = session?.user ?? null;

    if (currentUser) {
      const userRole = await fetchRole(currentUser.id);
      setUser(currentUser);
      setRole(userRole);
    } else {
      setUser(null);
      setRole(null);
    }

    setLoading(false);
    initialized.current = true;
    resolving.current = false;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveUser(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveUser(session);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const isAdmin = role === 'admin';

  return { user, role, isAdmin, loading };
}
