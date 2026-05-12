import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { ALL_STAGES, formatUSD, STAGE_GROUPS } from "@/lib/stages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, MapPin, Bed, Bath, Car, Home, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/dashboard/$projectId")({ component: ProjectDetail });

type Project = {
  id: string; address: string; status: string; hero_image_url: string | null;
  total_value: number; amount_deposited: number;
  expected_sale_price: number; total_cost: number;
  notes: string | null;
  model_name: string | null; sqft_total: number | null; sqft_living: number | null;
  bedrooms: number | null; bathrooms: number | null; garage: boolean; features: string | null;
};
type Stage = {
  id: string; stage_order: number; stage_name: string; stage_group: string | null;
  draw_number: number | null; draw_amount: number; completed: boolean; active: boolean;
};
type Comp = { id: string; address: string; sale_price: number; sqft_total: number | null; sqft_living: number | null; days_on_market: number | null; sale_date: string | null };
type Image = { id: string; image_url: string; caption: string | null };
type Opportunity = { id: string; name: string; location: string; expected_roi: number; total_investment: number; status: string; contact_url: string | null; image_url: string | null };

function ProjectDetail() {
  const { projectId } = useParams({ from: "/dashboard/$projectId" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [comps, setComps] = useState<Comp[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [opps, setOpps] = useState<Opportunity[]>([]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }, { data: c }, { data: i }, { data: o }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase.from("project_stages").select("*").eq("project_id", projectId).order("stage_order"),
        supabase.from("comparables").select("*").eq("project_id", projectId).order("created_at"),
        supabase.from("portfolio_images").select("*").eq("project_id", projectId).order("sort_order"),
        supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
      ]);
      setProject(p as Project);
      setStages((s ?? []) as Stage[]);
      setComps((c ?? []) as Comp[]);
      setImages((i ?? []) as Image[]);
      setOpps((o ?? []) as Opportunity[]);
    })();
  }, [projectId]);

  const progress = useMemo(() => {
    if (!stages.length) return 0;
    const total = ALL_STAGES.length;
    const done = stages.filter((s) => s.completed).length;
    return Math.round((done / total) * 100);
  }, [stages]);

  const activeStage = stages.find((s) => s.active);
  const pending = (project?.total_value ?? 0) - (project?.amount_deposited ?? 0);

  if (!project) return <div className="min-h-screen bg-background"><AppHeader /><div className="p-12 text-center text-muted-foreground">Cargando...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver a proyectos
        </Link>
        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-6 bg-muted">
          <img
            src={project.hero_image_url || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80"}
            alt={project.address}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{project.address}</h1>
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" /> Florida, USA</p>
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">{project.status}</span>
        </div>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-muted/60 flex-wrap h-auto">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="opps">Nuevas Oportunidades</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="comps">Comparables</TabsTrigger>
            <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
            <TabsTrigger value="sim">Simulador</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="card-soft p-6 lg:col-span-1 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avance de Obra</h3>
                <ProgressCircle value={progress} />
                <p className="mt-3 text-sm text-muted-foreground text-center">Etapa actual</p>
                <p className="text-base font-semibold text-foreground text-center">{activeStage?.stage_name ?? "Por iniciar"}</p>
              </div>
              <div className="card-soft p-6 lg:col-span-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Etapas de Construcción</h3>
                <Timeline stages={stages} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard label="Depositado" value={formatUSD(project.amount_deposited)} accent="primary" />
              <StatCard label="Total del Proyecto" value={formatUSD(project.total_value)} />
              <StatCard label="Pendiente" value={formatUSD(pending)} accent="muted" />
            </div>
          </TabsContent>

          {/* OPPORTUNITIES */}
          <TabsContent value="opps" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {opps.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No hay oportunidades disponibles.</p>}
              {opps.map((o) => (
                <div key={o.id} className="card-soft overflow-hidden flex flex-col">
                  {o.image_url ? (
                    <img src={o.image_url} alt={o.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-secondary/40 flex items-center justify-center text-secondary-foreground"><Home className="h-8 w-8" /></div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="self-start text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{o.status}</span>
                    <h3 className="mt-2 font-semibold text-foreground">{o.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{o.location}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-xs text-muted-foreground">ROI esperado</p><p className="font-semibold text-primary">{o.expected_roi}%</p></div>
                      <div><p className="text-xs text-muted-foreground">Inversión</p><p className="font-semibold text-foreground">{formatUSD(o.total_investment)}</p></div>
                    </div>
                    <Button asChild className="mt-5"><a href={o.contact_url || "#"} target="_blank" rel="noreferrer">Quiero saber más <ExternalLink className="h-3 w-3" /></a></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* DETAILS */}
          <TabsContent value="details" className="mt-6 space-y-6">
            <div className="card-soft p-6">
              <h3 className="font-semibold text-foreground mb-4">Comparables</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                    <tr><th className="py-2">Dirección</th><th>Precio</th><th>Sqft total</th><th>Sqft living</th><th>Días</th><th>Fecha</th></tr>
                  </thead>
                  <tbody>
                    {comps.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Sin comparables aún.</td></tr>}
                    {comps.map((c) => (
                      <tr key={c.id} className="border-b border-border/60">
                        <td className="py-3 font-medium text-foreground">{c.address}</td>
                        <td>{formatUSD(c.sale_price)}</td>
                        <td>{c.sqft_total ?? "—"}</td>
                        <td>{c.sqft_living ?? "—"}</td>
                        <td>{c.days_on_market ?? "—"}</td>
                        <td>{c.sale_date ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-soft p-5 bg-secondary/30 border-secondary">
              <p className="text-sm text-foreground"><strong>Financiamiento:</strong> Este proyecto puede calificarse para financiamiento bancario de hasta el 50% del valor de venta. Consultar con el equipo GrowUp.</p>
            </div>
            <div className="card-soft p-6 bg-primary text-primary-foreground">
              <h3 className="font-semibold mb-4">Rentabilidad esperada</h3>
              <div className="grid sm:grid-cols-4 gap-4 text-sm">
                <Stat dark label="Precio est. de venta" value={formatUSD(project.expected_sale_price)} />
                <Stat dark label="Costo total" value={formatUSD(project.total_cost)} />
                <Stat dark label="Ganancia neta" value={formatUSD((project.expected_sale_price ?? 0) - (project.total_cost ?? 0))} />
                <Stat dark label="ROI estimado" value={`${project.total_cost ? (((project.expected_sale_price - project.total_cost) / project.total_cost) * 100).toFixed(1) : 0}%`} />
              </div>
            </div>
            {project.notes && (
              <div className="card-soft p-6">
                <h3 className="font-semibold text-foreground mb-2">Detalles del Proyecto</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{project.notes}</p>
              </div>
            )}
          </TabsContent>

          {/* PORTFOLIO */}
          <TabsContent value="portfolio" className="mt-6 space-y-6">
          </TabsContent>
          {/* COMPARABLES */}
          <TabsContent value="comps" className="mt-6 space-y-8">
            <ComparablesTab />
          </TabsContent>
          <TabsContent value="portfolio_real" className="hidden">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">Sin fotos aún.</p>}
              {images.map((img) => (
                <div key={img.id} className="card-soft overflow-hidden">
                  <img src={img.image_url} alt={img.caption ?? "Portafolio"} className="w-full h-56 object-cover" />
                  {img.caption && <p className="p-3 text-xs text-muted-foreground">{img.caption}</p>}
                </div>
              ))}
            </div>
            <div className="card-soft p-6">
              <h3 className="font-semibold text-foreground mb-4">Especificaciones</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <Spec icon={<Home className="h-4 w-4" />} label="Modelo" value={project.model_name ?? "—"} />
                <Spec label="Sqft total" value={project.sqft_total ? `${project.sqft_total.toLocaleString()} sqft` : "—"} />
                <Spec label="Sqft living" value={project.sqft_living ? `${project.sqft_living.toLocaleString()} sqft` : "—"} />
                <Spec icon={<Bed className="h-4 w-4" />} label="Habitaciones" value={String(project.bedrooms ?? "—")} />
                <Spec icon={<Bath className="h-4 w-4" />} label="Baños" value={String(project.bathrooms ?? "—")} />
                <Spec icon={<Car className="h-4 w-4" />} label="Garage" value={project.garage ? "Sí" : "No"} />
              </div>
              {project.features && <p className="mt-4 text-sm text-muted-foreground"><strong>Adicional:</strong> {project.features}</p>}
            </div>
          </TabsContent>

          {/* SIMULATOR */}
          <TabsContent value="sim" className="mt-6">
            <Simulator baseCost={project.total_cost || 0} basePrice={project.expected_sale_price || 250000} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ProgressCircle({ value }: { value: number }) {
  const r = 56, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative h-40 w-40 mt-4">
      <svg className="h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={r} stroke="currentColor" className="text-muted" strokeWidth="10" fill="none" />
        <circle cx="80" cy="80" r={r} stroke="currentColor" className="text-primary transition-all" strokeWidth="10" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{value}%</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">completado</span>
      </div>
    </div>
  );
}

function Timeline({ stages }: { stages: Stage[] }) {
  // group stages by stage_group preserving STAGE_GROUPS order
  return (
    <div className="space-y-6">
      {STAGE_GROUPS.map((g) => {
        const groupStages = stages.filter((s) => s.stage_group === g.group);
        if (groupStages.length === 0) return null;
        return (
          <div key={g.group}>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{g.group}</h4>
            <div className="space-y-2">
              {groupStages.map((s) => (
                <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  s.completed ? "bg-primary/5 border-primary/20" : s.active ? "bg-secondary/40 border-secondary" : "bg-background border-border"
                }`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    s.completed ? "bg-primary text-primary-foreground" : s.active ? "bg-secondary text-secondary-foreground ring-2 ring-primary/40" : "bg-muted text-muted-foreground"
                  }`}>
                    {s.completed ? <Check className="h-4 w-4" /> : s.draw_number ?? "•"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${s.completed || s.active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.stage_name}</p>
                  </div>
                  {s.draw_number != null && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Draw {s.draw_number} · {formatUSD(s.draw_amount)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "primary" | "muted" }) {
  const cls = accent === "primary" ? "bg-primary text-primary-foreground" : accent === "muted" ? "bg-secondary/40 text-foreground" : "bg-card text-foreground";
  return (
    <div className={`card-soft p-5 ${cls}`}>
      <p className={`text-xs uppercase tracking-wider ${accent === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Stat({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  return (
    <div>
      <p className={`text-xs ${dark ? "text-primary-foreground/70" : "text-muted-foreground"} uppercase tracking-wider`}>{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}

function Spec({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
      {icon && <div className="text-primary">{icon}</div>}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Simulator({ baseCost, basePrice }: { baseCost: number; basePrice: number }) {
  const [price, setPrice] = useState(basePrice || 250000);
  const [cost, setCost] = useState(baseCost || 180000);
  const [commission, setCommission] = useState(6);
  const [closing, setClosing] = useState(2);
  const [other, setOther] = useState(0);

  const calc = (p: number) => {
    const net = p - p * (commission / 100) - p * (closing / 100) - other;
    const gain = net - cost;
    const roi = cost ? (gain / cost) * 100 : 0;
    return { net, gain, roi, price: p };
  };
  const conservative = calc(price * 0.9);
  const base = calc(price);
  const optimistic = calc(price * 1.1);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card-soft p-6 lg:col-span-1 space-y-5">
        <h3 className="font-semibold text-foreground">Parámetros</h3>
        <div>
          <Label>Precio de venta estimado: <span className="text-primary font-semibold">{formatUSD(price)}</span></Label>
          <Slider min={150000} max={600000} step={5000} value={[price]} onValueChange={(v) => setPrice(v[0])} className="mt-3" />
        </div>
        <div>
          <Label>Costo total invertido</Label>
          <Input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Comisión %</Label><Input type="number" value={commission} onChange={(e) => setCommission(Number(e.target.value))} /></div>
          <div><Label>Closing %</Label><Input type="number" value={closing} onChange={(e) => setClosing(Number(e.target.value))} /></div>
        </div>
        <div><Label>Otros gastos</Label><Input type="number" value={other} onChange={(e) => setOther(Number(e.target.value))} /></div>
      </div>
      <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
        <ScenarioCard title="Conservador" tone="red" {...conservative} />
        <ScenarioCard title="Base" tone="yellow" {...base} />
        <ScenarioCard title="Optimista" tone="green" {...optimistic} />
      </div>
    </div>
  );
}

function ScenarioCard({ title, tone, price, gain, roi }: { title: string; tone: "red" | "yellow" | "green"; price: number; net?: number; gain: number; roi: number }) {
  const tones = {
    red: "border-l-4 border-red-500",
    yellow: "border-l-4 border-yellow-500",
    green: "border-l-4 border-primary",
  } as const;
  return (
    <div className={`card-soft p-5 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-3 text-xs text-muted-foreground">Precio venta</p>
      <p className="text-lg font-bold text-foreground">{formatUSD(price)}</p>
      <p className="mt-3 text-xs text-muted-foreground">Ganancia neta</p>
      <p className={`text-lg font-bold ${gain >= 0 ? "text-primary" : "text-destructive"}`}>{formatUSD(gain)}</p>
      <p className="mt-3 text-xs text-muted-foreground">ROI</p>
      <p className="text-2xl font-bold text-foreground">{roi.toFixed(1)}%</p>
    </div>
  );
}