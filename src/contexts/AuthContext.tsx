import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applyUserTheme = async (userId: string) => {
      const { data } = await supabase.from("users").select("color_scheme, dark_mode").eq("user_id", userId).single();
      if (data) {
        const root = document.documentElement;
        const theme = data.color_scheme || "theme-blue";
        ["theme-blue","theme-purple","theme-green","theme-orange","theme-rose"].forEach(t => root.classList.remove(t));
        root.classList.add(theme);
        localStorage.setItem("color-theme", theme);
        const dark = data.dark_mode ?? false;
        if (dark) root.classList.add("dark"); else root.classList.remove("dark");
        localStorage.setItem("dark-mode", String(dark));
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session?.user) applyUserTheme(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) applyUserTheme(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
