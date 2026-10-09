import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { formatUSD, ALL_STAGES } from "@/lib/stages";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, FileText, MapPin } from "lucide-react";
import flamingoPhoto from "@/assets/621-flamingo-foto.png.asset.json";
import proforma621 from "@/assets/proforma-621-flamingo.png.asset.json";
import { ConstructionProgressBar } from "@/components/ConstructionProgressBar";
import { GanttChart } from "@/components/GanttChart";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/aporte")({
  head: () => ({
    meta: [
      { title: "Mi aporte de capital | GrowUp Investments" },
      { name: "description", content: "Detalle de tu aporte de capital en GrowUp Investments." },
      { property: "og:title", content: "Mi aporte de capital | GrowUp Investments" },
      { property: "og:description", content: "Detalle de tu aporte de capital en GrowUp Investments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AportePage,
});

type Deposit = { date: string | null; amount: number; detail: string | null };
type Doc = { name: string; path: string | null };
type Contribution = {
  id: string; title: string; property_address: string; project_status: string; project_id: string | null;
  sale_price: number | null; total_cost: number | null; project_profit: number | null; project_roi: number | null; ownership_pct: number | null;
  capital: number; rate_pct: number; profit: number; total_to_collect: number;
  deposits: Deposit[]; documents: Doc[];
};

const fmtDate = (d: string | null) => (d ? d.split("-").reverse().join("/") : "Pendiente");

function DocCard({ name, url, image }: { name: string; url: string | null; image?: boolean }) {
  return (
    <div className="card-soft p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {name}</p>
        {url && (
          <Button asChild size="sm"><a href={url} download target="_blank" rel="noreferrer"><Download className="h-4 w-4" /> Descargar</a></Button>
        )}
      </div>
      {url && image && <img src={url} alt={name} className="w-full rounded-md border border-border" />}
      {url && !image && <iframe title={name} src={url} className="w-full h-80 rounded-md border border-border" />}
    </div>
  );
}

function AportePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [c, setC] = useState<Contribution | null>(null);
  const [name, setName] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [stages, setStages] = useState<Tables<"project_stages">[]>([]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: pr } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setName(pr?.full_name ?? user.email ?? "");
      const { data } = await (supabase as any).from("capital_contributions").select("*").eq("investor_id", user.id).limit(1);
      const row = (data?.[0] ?? null) as Contribution | null;
      setC(row);
      setStages([]);
      if (row?.project_id) {
        const { data: projectStages } = await supabase.from("project_stages").select("*").eq("project_id", row.project_id).order("stage_order");
        setStages(projectStages ?? []);
      } else if (row) {
        // Obra terminada sin proyecto vinculado: todas las etapas finalizadas (100%).
        // Cronograma terminado en agosto: un mes por grupo de etapas, de marzo a agosto 2026.
        const groupMonth: Record<string, number> = {
          "Soft Construction": 3, "Hard Construction 1": 4, "Hard Construction 2": 5,
          "Hard Construction 3": 6, "Hard Construction 4": 7, "CO (Certificado de Ocupación)": 8,
        };
        const month = (m: number, day: number) => `2026-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        setStages(ALL_STAGES.map((s, i) => ({
          id: `done-${i}`, project_id: "", stage_order: i + 1, stage_name: s.name, stage_group: s.group,
          completed: true, active: false, draw_number: null, draw_amount: null, created_at: "",
          estimated_date: null,
          estimated_start_date: month(groupMonth[s.group] ?? 8, 1),
          estimated_end_date: month(groupMonth[s.group] ?? 8, 28),
        })) as Tables<"project_stages">[]);
      }
      const out: Record<string, string> = {};
      for (const d of row?.documents ?? []) {
        if (!d.path) continue;
        const { data: s } = await supabase.storage.from("project-documents").createSignedUrl(d.path, 3600);
        if (s?.signedUrl) out[d.name] = s.signedUrl;
      }
      setUrls(out);
    })();
  }, [user]);

  if (!c) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader name={name} />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center text-muted-foreground">Cargando…</main>
      </div>
    );
  }

  const totalDep = c.deposits.reduce((s, d) => s + Number(d.amount), 0);
  const progress = stages.length ? Math.round(stages.filter((s) => s.completed).length / stages.length * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name={name} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-2"><ArrowRight className="h-4 w-4 rotate-180" /> Mis Proyectos</Link>
          <h1 className="text-3xl font-bold text-foreground mt-1">{c.title}</h1>
        </div>

        <section className="card-soft overflow-hidden grid md:grid-cols-2">
          <img src={flamingoPhoto.url} alt={c.property_address} className="w-full h-72 object-cover" />
          <div className="p-6 space-y-4">
            <span className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{c.project_status}</span>
            <p className="font-semibold text-lg text-foreground flex items-start gap-1"><MapPin className="h-5 w-5 mt-0.5 text-primary" /> {c.property_address}</p>
            {c.ownership_pct != null && (
              <p className="text-sm font-semibold text-primary">Sos propietario del {Number(c.ownership_pct).toLocaleString("es-AR", { maximumFractionDigits: 2 })}% de la casa</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Precio de venta", c.sale_price != null ? formatUSD(Number(c.sale_price)) : "—"],
                ["Costo total", c.total_cost != null ? formatUSD(Number(c.total_cost)) : "—"],
                ["Ganancia neta", c.project_profit != null ? formatUSD(Number(c.project_profit)) : "—"],
                ["ROI del proyecto", c.project_roi != null ? `${c.project_roi}%` : "—"],
              ].map(([l, v]) => (
                <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-semibold text-foreground">{v}</p></div>
              ))}
            </div>
            {stages.length > 0 && <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Avance de obra</span><span className="font-semibold text-foreground">{progress}%</span></div>
              <progress aria-label="Avance de obra" value={progress} max={100} className="w-full h-2 accent-primary" />
            </div>}
          </div>
        </section>

        {stages.length > 0 && <><ConstructionProgressBar stages={stages} /><GanttChart stages={stages} /></>}

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold text-foreground mb-3">Depósitos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Fecha</th><th className="py-2 pr-3">Monto</th><th className="py-2">Detalle</th>
              </tr></thead>
              <tbody>
                {c.deposits.map((d, i) => (
                  <tr key={i} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-3">{i + 1}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{d.date ? fmtDate(d.date) : "—"}</td>
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">{formatUSD(Number(d.amount))}</td>
                    <td className="py-2 text-muted-foreground">{d.detail ?? "—"}</td>
                  </tr>
                ))}
                <tr><td /><td className="py-2 font-semibold">Total depositado</td><td className="py-2 font-bold text-primary">{formatUSD(totalDep)}</td><td /></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Documentos</h2>
          {c.documents.filter((d) => !d.name.startsWith("Comprobante depósito")).map((d) => <DocCard key={d.name} name={d.name} image={d.name.startsWith("Proforma ")} url={d.name.startsWith("Proforma ") ? proforma621.url : urls[d.name] ?? null} />)}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Aporte de capital</h2>

          <div className="rounded-xl bg-primary p-5 text-primary-foreground space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">Total a cobrar</p>
              <p className="text-2xl font-bold mt-1">{formatUSD(Number(c.total_to_collect))}</p>
            </div>

            <div className="border-t border-primary-foreground/25 pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["Capital aportado", formatUSD(Number(c.capital))],
                  ["Rentabilidad", `${c.rate_pct}%`],
                  ["Ganancia", formatUSD(Number(c.profit))],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-xs uppercase tracking-wide opacity-80">{l}</p>
                    <p className="text-xl font-bold mt-1">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


      </main>
    </div>
  );
}
