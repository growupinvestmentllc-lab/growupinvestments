import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "investor" | "hunter" | null;

export function useAuth() {
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

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.user.id);

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
      setLoading(false);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Supabase recommends deferring follow-up API calls made from this callback.
      setTimeout(() => void applySession(nextSession), 0);
    });

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, role, loading, signOut: () => supabase.auth.signOut() };
}