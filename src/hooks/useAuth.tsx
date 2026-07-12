
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  ownTeamId: number | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  ownTeamId: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ownTeamId, setOwnTeamId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdentityExtras = async (currentUser: User | null) => {
      if (!currentUser) {
        setOwnTeamId(null);
        setIsAdmin(false);
        return;
      }

      const [{ data: teamId }, { data: adminFlag }] = await Promise.all([
        supabase.rpc('get_user_equipe_id'),
        supabase.rpc('has_role', { _user_id: currentUser.id, _role: 'admin' }),
      ]);

      setOwnTeamId(teamId ?? null);
      setIsAdmin(!!adminFlag);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        loadIdentityExtras(session?.user ?? null).finally(() => setLoading(false));
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadIdentityExtras(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, ownTeamId, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
