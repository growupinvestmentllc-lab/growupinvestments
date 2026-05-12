import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { ALL_STAGES } from "@/lib/stages";
import { MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Project = {
  id: string; address: string; status: string;
};

function Dashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<(Project & { progress: number; activeStage: string })[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("projects").select("id,address,status").order("created_at");
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
      const { data: pr } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setProfile(pr);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name={profile?.full_name ?? user?.email ?? ""} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Hola{profile?.full_name ? `, ${profile.full_name}` : ""}</p>
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
            <Link
              key={p.id}
              to="/dashboard/$projectId"
              params={{ projectId: p.id }}
              className="card-soft p-5 hover:shadow-lg transition group"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {p.status}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground leading-snug">{p.address}</h3>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Florida, USA
              </p>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Avance de obra</span><span className="font-semibold text-foreground">{p.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Etapa actual: <span className="text-foreground font-medium">{p.activeStage}</span></p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}