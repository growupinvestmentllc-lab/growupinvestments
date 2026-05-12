import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
    else if (role === "investor") navigate({ to: "/dashboard" });
  }, [user, role, loading, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Logo />
    </div>
  );
}
