import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { ALL_STAGES } from "@/lib/stages";
import { MapPin, ArrowRight, Home, ExternalLink } from "lucide-react";
import { formatUSD } from "@/lib/stages";
import { Button } from "@/components/ui/button";
import { Simulator } from "@/components/Simulator";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Project = {
  id: string;
  address: string;
  status: string;
  hero_image_url: string | null;
};
type Opportunity = {
  id: string;
  name: string;
  location: string;
  expected_roi: number;
  total_investment: number;
  status: string;
  contact_url: string | null;
  image_url: string | null;
};

function Dashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<(Project & { progress: number; activeStage: string })[]>(
    [],
  );
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (!user || location.pathname !== "/dashboard") return;
    (async () => {
      const { data: p } = await supabase
        .from("projects")
        .select("id,address,status,hero_image_url")
        .order("created_at");
      const list = p ?? [];
      const enriched = await Promise.all(
        list.map(async (proj) => {
          const { data: stages } = await supabase
            .from("project_stages")
            .select("completed,active,stage_name")
            .eq("project_id", proj.id);
          const total = ALL_STAGES.length;
          const done = (stages ?? []).filter((s) => s.completed).length;
          const active = (stages ?? []).find((s) => s.active);
          return {
            ...proj,
            progress: total ? Math.round((done / total) * 100) : 0,
            activeStage: active?.stage_name ?? "Por iniciar",
          };
        }),
      );
      setProjects(enriched);
      const { data: pr } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      setProfile(pr);
      const { data: o } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });
      setOpps((o ?? []) as Opportunity[]);
    })();
  }, [user, location.pathname]);

  if (location.pathname !== "/dashboard") return <Outlet />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name={profile?.full_name ?? user?.email ?? ""} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Hola{profile?.full_name ? `, ${profile.full_name}` : ""}
            </p>
            <h1 className="text-3xl font-bold text-foreground mt-1">Mis Proyectos</h1>
          </div>
          <span className="text-sm text-muted-foreground">{projects.length} proyecto(s)</span>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.length === 0 && (
            <div className="card-soft p-8 col-span-full text-center text-muted-foreground">
              Aún no tienes proyectos asignados. Contacta al equipo GrowUp.
            </div>
          )}
          {projects.map((p) => (
            <div key={p.id} className="card-soft overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                <img
                  src={
                    p.hero_image_url ||
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80"
                  }
                  alt={p.address}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {p.status}
                  </span>
                  <Link
                    to="/dashboard/$projectId"
                    params={{ projectId: p.id }}
                    aria-label={`Ver más información de ${p.address}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground leading-snug">
                  {p.address}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Florida, USA
                </p>
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Avance de obra</span>
                    <span className="font-semibold text-foreground">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Etapa actual:{" "}
                    <span className="text-foreground font-medium">
                      {p.progress >= 100 ? "Obra 100% completada y entregada" : p.activeStage}
                    </span>
                  </p>
                </div>
                <Button asChild className="mt-5 w-full">
                  <Link to="/dashboard/$projectId" params={{ projectId: p.id }}>
                    Ver información <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Oportunidades */}
        {profile?.full_name?.toUpperCase() !== "LAS TROPAS LLC" && (
        <section className="mt-16">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Oportunidades</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Nuevos proyectos disponibles para invertir
              </p>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {opps.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-12">
                No hay oportunidades disponibles.
              </p>
            )}
            {opps.map((o) => (
              <div key={o.id} className="card-soft overflow-hidden flex flex-col">
                {o.image_url ? (
                  <img src={o.image_url} alt={o.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-secondary/40 flex items-center justify-center text-secondary-foreground">
                    <Home className="h-8 w-8" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <span className="self-start text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {o.status}
                  </span>
                  <h3 className="mt-2 font-semibold text-foreground">{o.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {o.location}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">ROI esperado</p>
                      <p className="font-semibold text-primary">{o.expected_roi}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Inversión</p>
                      <p className="font-semibold text-foreground">
                        {formatUSD(o.total_investment)}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="mt-5">
                    <a href={o.contact_url || "#"} target="_blank" rel="noreferrer">
                      Quiero saber más <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Simulador */}
        {profile?.full_name?.toUpperCase() !== "LAS TROPAS LLC" && (
        <section className="mt-16">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Simulador de rentabilidad</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Estima ganancias y ROI según escenarios de venta
            </p>
          </div>
          <div className="mt-6">
            <Simulator />
          </div>
        </section>
        )}
      </main>
    </div>
  );
}
