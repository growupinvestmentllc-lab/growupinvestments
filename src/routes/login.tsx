import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const otra = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("otra") === "1";
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [switching, setSwitching] = useState(otra);

  useEffect(() => {
    if (!otra) return;
    supabase.auth.signOut().finally(() => setSwitching(false));
  }, [otra]);

  useEffect(() => {
    if (switching || loading || !user) return;
    if (role === "admin") navigate({ to: "/admin" });
    else if (role === "hunter") navigate({ to: "/hunter" });
    else if (role === "investor") navigate({ to: "/dashboard" });
  }, [user, role, loading, navigate, switching]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    if (roleError) {
      setSubmitting(false);
      toast.error("No pudimos abrir tu cuenta. Intenta nuevamente.");
      return;
    }

    const roles = (roleRows ?? []).map((row) => row.role as string);
    toast.success("Bienvenido");

    if (roles.includes("admin")) await navigate({ to: "/admin", replace: true });
    else if (roles.includes("hunter")) await navigate({ to: "/hunter", replace: true });
    else if (roles.includes("investor")) await navigate({ to: "/dashboard", replace: true });
    else {
      setSubmitting(false);
      toast.error("Tu cuenta todavía no tiene un acceso asignado.");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between py-12 pr-12 pl-0 bg-primary text-primary-foreground overflow-hidden">
        <Logo light className="h-24 max-w-[680px]" />
        <div className="pl-12">
          <h1 className="text-4xl font-bold leading-tight">
            Tu portafolio inmobiliario,<br />en tiempo real.
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Sigue cada etapa de construcción, draws y rentabilidad de tus inversiones con GrowUp Investments.
          </p>
        </div>
        <p className="pl-12 text-xs text-primary-foreground/60">© GrowUp Investments LLC · Florida</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-start"><Logo className="h-16 max-w-full" /></div>
          <h2 className="text-2xl font-bold text-foreground">Iniciar sesión</h2>
          <p className="text-sm text-muted-foreground mt-1">Accede a tu portal de inversionista.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <button
            type="button"
            onClick={async () => {
              setSwitching(true);
              await supabase.auth.signOut();
              setEmail("");
              setPassword("");
              setSwitching(false);
              toast.success("Sesión cerrada. Ya puedes ingresar con otra cuenta.");
            }}
            className="mt-6 w-full text-xs text-muted-foreground underline text-center"
          >
            Ingresar con otra cuenta
          </button>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            ¿Eres admin? También puedes acceder con tus credenciales aquí.
          </p>
        </div>
      </div>
    </div>
  );
}