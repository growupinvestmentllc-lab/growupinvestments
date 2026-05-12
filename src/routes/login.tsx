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
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (role === "admin") navigate({ to: "/admin" });
    else if (role === "investor") navigate({ to: "/dashboard" });
  }, [user, role, loading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Bienvenido");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <Logo light />
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Tu portafolio inmobiliario,<br />en tiempo real.
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Sigue cada etapa de construcción, draws y rentabilidad de tus inversiones con GrowUp Investments.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">© GrowUp Investments LLC · Florida</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>
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
          <p className="mt-6 text-xs text-muted-foreground text-center">
            ¿Eres admin? También puedes acceder con tus credenciales aquí.
          </p>
        </div>
      </div>
    </div>
  );
}