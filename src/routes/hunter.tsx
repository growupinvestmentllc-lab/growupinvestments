import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/hunter")({ component: HunterLayout });

function HunterLayout() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
    else if (role === "investor") navigate({ to: "/dashboard" });
  }, [user, role, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="border-b border-border bg-card/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 py-2">
          <Link
            to="/hunter"
            activeOptions={{ exact: true }}
            className="text-sm px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition"
            activeProps={{ className: "text-sm px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-medium" }}
          >
            Propuestas
          </Link>
          <Link
            to="/hunter/ventas"
            className="text-sm px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition"
            activeProps={{ className: "text-sm px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-medium" }}
          >
            Mis Ventas
          </Link>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
