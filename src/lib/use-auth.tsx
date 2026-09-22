import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "investor" | "hunter" | null;

type AuthState = {
  session: Session | null;
  user: User | null;
  role: Role;
  loading: boolean;
  signOut: () => ReturnType<typeof supabase.auth.signOut>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function applySession(s: Session | null) {
      const currentRequest = ++requestId;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(true);

      if (!s?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", s.user.id);

        if (error) throw error;
        if (!active || currentRequest !== requestId) return;

        const roles = (data ?? []).map((row) => row.role as string);
        setRole(
          roles.includes("admin")
            ? "admin"
            : roles.includes("hunter")
              ? "hunter"
              : roles.includes("investor")
                ? "investor"
                : null,
        );
      } catch (error) {
        if (active && currentRequest === requestId) {
          console.error("No se pudo cargar el acceso del usuario", error);
          setRole(null);
        }
      } finally {
        if (active && currentRequest === requestId) setLoading(false);
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;
      // Supabase recommends deferring follow-up API calls made from this callback.
      setTimeout(() => void applySession(nextSession), 0);
    });

    void supabase.auth.getSession()
      .then(({ data }) => applySession(data.session))
      .catch((error) => {
        if (!active) return;
        console.error("No se pudo recuperar la sesión", error);
        setSession(null);
        setUser(null);
        setRole(null);
        setLoading(false);
      });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut: () => supabase.auth.signOut() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return auth;
}