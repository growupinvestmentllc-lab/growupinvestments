import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { ALL_STAGES, formatUSD, STAGE_GROUPS } from "@/lib/stages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, MapPin, Bed, Bath, Car, Home, FileText, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/$projectId")({ component: ProjectDetail });

const DOC_LABELS: Record<string, string> = {
  contrato_construccion: "Contrato de Construcción",
  assignment_beneficiary: "Assignment of Beneficiary",
  buyer: "Buyer",
  due_diligence: "Due Diligence",
  joint_venture: "Joint Venture",
  warranty_deed: "Warranty Deed",
  structural_plan: "Structural Plan",
  ledger_balance: "Ledger Balance Report",
  informe_1: "Informe 1",
  informe_2: "Informe 2",
  informe_3: "Informe 3",
  landtrust: "Landtrust",
  certificado_ocupacion: "Certificado de Ocupación (CO)",
};

type Project = {
  id: string; address: string; status: string; hero_image_url: string | null;
  total_value: number; amount_deposited: number;
  expected_sale_price: number; total_cost: number;
  expected_rent_price: number | null;
  construction_cost: number; lot_cost: number;
  notes: string | null;
  model_name: string | null; sqft_total: number | null; sqft_living: number | null;
  bedrooms: number | null; bathrooms: number | null; garage: boolean; features: string | null;
  investor_id: string;
  owner_llc: string | null; owner_llc_2: string | null;
  owner_pct_1: number | null; owner_pct_2: number | null;
};
type Stage = {
  id: string; stage_order: number; stage_name: string; stage_group: string | null;
  draw_number: number | null; draw_amount: number; completed: boolean; active: boolean;
};
type Comp = { id: string; address: string; sale_price: number; sqft_total: number | null; sqft_living: number | null; days_on_market: number | null; sale_date: string | null };
type Image = { id: string; image_url: string; caption: string | null };

function ProjectDetail() {
  const { projectId } = useParams({ from: "/dashboard/$projectId" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [comps, setComps] = useState<Comp[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [myLlc, setMyLlc] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }, { data: c }, { data: i }, { data: prof }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase.from("project_stages").select("*").eq("project_id", projectId).order("stage_order"),
        supabase.from("comparables").select("*").eq("project_id", projectId).order("created_at"),
        supabase.from("portfolio_images").select("*").eq("project_id", projectId).order("sort_order"),
        supabase.from("profiles").select("llc_name").maybeSingle(),
      ]);
      setProject(p as Project);
      setStages((s ?? []) as Stage[]);
      setComps((c ?? []) as Comp[]);
      setImages((i ?? []) as Image[]);
      setMyLlc((prof as { llc_name: string | null } | null)?.llc_name ?? null);
    })();
  }, [projectId]);

  const progress = useMemo(() => {
    if (!stages.length) return 0;
    const total = ALL_STAGES.length;
    const done = stages.filter((s) => s.completed).length;
    return Math.round((done / total) * 100);
  }, [stages]);

  const activeStage = stages.find((s) => s.active);
  const totalCost = (Number(project?.construction_cost) || 0) + (Number(project?.lot_cost) || 0)
    || Number(project?.total_cost) || 0;
  const deposited = Number(project?.amount_deposited) || 0;
  const pending = totalCost - deposited;

  // Determine current investor share (%)
  const myPct = useMemo(() => {
    if (!project) return null;
    if (myLlc && project.owner_llc && project.owner_llc.trim() === myLlc.trim()) {
      return Number(project.owner_pct_1) || null;
    }
    if (myLlc && project.owner_llc_2 && project.owner_llc_2.trim() === myLlc.trim()) {
      return Number(project.owner_pct_2) || null;
    }
    return null;
  }, [project, myLlc]);
  const hasMultipleOwners = !!(project?.owner_llc_2 && project.owner_llc_2.trim());

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

        {(() => null)()}
        {/* hide comparables tab for specific projects */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-muted/60 flex-wrap h-auto">
            <TabsTrigger value="overview">Información</TabsTrigger>
            <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
            {!(
              (project.address?.toLowerCase().includes("2725") && project.address?.toLowerCase().includes("ember")) ||
              (project.address?.toLowerCase().includes("sun") && project.address?.toLowerCase().includes("lake")) ||
              project.address?.toLowerCase().includes("jaguar")
            ) && <TabsTrigger value="comparables">Comparables</TabsTrigger>}
            <TabsTrigger value="docs">Documentación</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="card-soft p-6 lg:col-span-1 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avance de Obra</h3>
                <ProgressCircle value={progress} />
                <p className="mt-3 text-sm text-muted-foreground text-center">Etapa actual</p>
                <p className="text-base font-semibold text-foreground text-center">{progress >= 100 ? "Obra 100% completada y entregada" : (activeStage?.stage_name ?? "Por iniciar")}</p>
              </div>
              <div className="card-soft p-6 lg:col-span-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Etapas de Construcción</h3>
                <Timeline stages={stages} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard
                label="Depositado"
                value={formatUSD(deposited)}
                accent="primary"
                sub={hasMultipleOwners && myPct != null
                  ? `Tu parte ${myPct}% = ${formatUSD(deposited * (myPct / 100))}`
                  : undefined}
              />
              <StatCard
                label="Pendiente"
                value={formatUSD(pending)}
                accent="muted"
                sub={hasMultipleOwners && myPct != null
                  ? `Tu parte ${myPct}% = ${formatUSD(pending * (myPct / 100))}`
                  : undefined}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Costos del proyecto</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard label="Construcción" value={formatUSD(project.construction_cost)} />
                <StatCard label="Lote" value={formatUSD(project.lot_cost)} />
                <StatCard label="Costo Total" value={formatUSD(totalCost)} accent="muted" />
              </div>
            </div>

            <DrawSchedule stages={stages} lotCost={Number(project.lot_cost || 0)} />

            {!(
              (project.address?.toLowerCase().includes("2725") && project.address?.toLowerCase().includes("ember")) ||
              (project.address?.toLowerCase().includes("sun") && project.address?.toLowerCase().includes("lake"))
            ) && (
              <div className="card-soft p-5 bg-secondary/30 border-secondary">
                <p className="text-sm text-foreground"><strong>Financiamiento bancario:</strong> Este proyecto puede calificarse para financiamiento bancario de hasta el 50% del valor de venta estimado (~{formatUSD((project.expected_sale_price || 0) * 0.5)}), lo que permite recuperar capital para reinvertir.</p>
              </div>
            )}
            <div className="card-soft p-6 bg-primary text-primary-foreground">
              <h3 className="font-semibold mb-4">Rentabilidad esperada</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <Stat dark label="Precio est. de venta" value={formatUSD(project.expected_sale_price)} />
                <Stat dark label="Alquiler est. (mensual)" value={formatUSD(project.expected_rent_price ?? 0)} />
                <Stat dark label="Costo construcción" value={formatUSD(project.construction_cost)} />
                <Stat dark label="Costo lote" value={formatUSD(project.lot_cost)} />
                {project.address?.toLowerCase().includes("2725") && project.address?.toLowerCase().includes("ember") ? (
                  <Stat dark label="NOI estimado" value="6.34%" />
                ) : (
                  <Stat dark label="ROI estimado" value={`${project.total_cost ? (((project.expected_sale_price - project.total_cost) / project.total_cost) * 100).toFixed(1) : 0}%`} />
                )}
              </div>
            </div>
            {project.notes && (
              <div className="card-soft p-6">
                <h3 className="font-semibold text-foreground mb-2">Detalles del Proyecto</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{project.notes}</p>
              </div>
            )}
          </TabsContent>

          {/* COMPARABLES */}
          {!(
            (project.address?.toLowerCase().includes("2725") && project.address?.toLowerCase().includes("ember")) ||
            (project.address?.toLowerCase().includes("sun") && project.address?.toLowerCase().includes("lake")) ||
            project.address?.toLowerCase().includes("jaguar")
          ) && (
            <TabsContent value="comparables" className="mt-6 space-y-6">
              <ComparablesTab />
            </TabsContent>
          )}

          {/* PORTFOLIO */}
          <TabsContent value="portfolio" className="mt-6 space-y-6">
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
                <Spec label="Constructor" value="Total Smartors LLC" />
                <Spec label="Arquitecto" value="Olympus Designs Group" />
              </div>
              {project.features && <p className="mt-4 text-sm text-muted-foreground"><strong>Adicional:</strong> {project.features}</p>}
            </div>
          </TabsContent>

          {/* DOCS */}
          <TabsContent value="docs" className="mt-6">
            <DocsTab projectId={project.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DrawSchedule({ stages, lotCost = 0 }: { stages: Stage[]; lotCost?: number }) {
  const DRAW_GROUPS = [
    "Soft Construction",
    "Hard Construction 1",
    "Hard Construction 2",
    "Hard Construction 3",
    "Hard Construction 4",
    "CO (Certificate of Occupancy)",
  ];
  const LABELS: Record<string, string> = {
    "CO (Certificate of Occupancy)": "C.O",
  };
  const groupRows = DRAW_GROUPS.map((group, idx) => {
    const groupStages = stages.filter((s) => (s.stage_group ?? "") === group);
    const amount = groupStages.reduce((sum, s) => sum + Number(s.draw_amount || 0), 0);
    const allCompleted = groupStages.length > 0 && groupStages.every((s) => s.completed);
    const anyActive = groupStages.some((s) => s.active);
    const anyCompleted = groupStages.some((s) => s.completed);
    return {
      num: idx + 1,
      group: LABELS[group] ?? group,
      amount,
      completed: allCompleted,
      active: anyActive || (anyCompleted && !allCompleted),
    };
  });
  const list = lotCost > 0
    ? [
        { num: 0, group: "Compra Lote", amount: lotCost, completed: true, active: false },
        ...groupRows.map((g) => ({ ...g, num: g.num + 1 })),
      ]
    : groupRows;
  if (!list.length) return null;
  return (
    <div className="card-soft p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Cronograma de Draws</h3>
      <div className="space-y-2">
        {list.map((d) => {
          const status = d.completed ? "completado" : d.active ? "en-progreso" : "pendiente";
          const badge =
            status === "completado"
              ? "bg-primary/15 text-primary"
              : status === "en-progreso"
              ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
              : "bg-muted text-muted-foreground";
          const label = status === "completado" ? "✅ Completado" : status === "en-progreso" ? "🔄 En progreso" : "⏳ Pendiente";
          return (
            <div key={d.num} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background">
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-8 w-8 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-semibold">{d.num}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Draw {d.num} — {d.group}</p>
                  <p className="text-xs text-muted-foreground">{formatUSD(d.amount)}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge}`}>{label}</span>
            </div>
          );
        })}
      </div>
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
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, accent, sub }: { label: string; value: string; accent?: "primary" | "muted"; sub?: string }) {
  const cls = accent === "primary" ? "bg-primary text-primary-foreground" : accent === "muted" ? "bg-secondary/40 text-foreground" : "bg-card text-foreground";
  return (
    <div className={`card-soft p-5 ${cls}`}>
      <p className={`text-xs uppercase tracking-wider ${accent === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {sub && (
        <p className={`text-xs mt-2 ${accent === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{sub}</p>
      )}
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

const SALE_COMPS = [
  { address: "2109 SW Embers Ter, Cape Coral FL", price: 368000, sqftTotal: 2210, sqftLiving: 1756, dom: 42, date: "Feb 2025" },
  { address: "2341 SW 2nd Pl, Cape Coral FL", price: 345000, sqftTotal: 2004, sqftLiving: 1620, dom: 28, date: "Jan 2025" },
  { address: "1812 SW Embers Ave, Cape Coral FL", price: 389000, sqftTotal: 2506, sqftLiving: 1904, dom: 55, date: "Mar 2025" },
  { address: "2205 SW 4th Ter, Cape Coral FL", price: 359900, sqftTotal: 2150, sqftLiving: 1780, dom: 19, date: "Apr 2025" },
];

const RENT_COMPS = [
  { address: "2318 SW Embers Ter, Cape Coral FL", rent: 2400, sqftLiving: 1820, beds: "4bd/3ba", date: "Mar 2025" },
  { address: "1956 SW 3rd Ave, Cape Coral FL", rent: 2250, sqftLiving: 1650, beds: "3bd/2ba", date: "Feb 2025" },
  { address: "2440 SW Embers Ave, Cape Coral FL", rent: 2600, sqftLiving: 2010, beds: "4bd/3ba", date: "Apr 2025" },
  { address: "2102 SW 1st Pl, Cape Coral FL", rent: 2350, sqftLiving: 1904, beds: "4bd/3ba", date: "Jan 2025" },
];

function ComparablesTab() {
  const avgPrice = SALE_COMPS.reduce((s, c) => s + c.price, 0) / SALE_COMPS.length;
  const avgDom = SALE_COMPS.reduce((s, c) => s + c.dom, 0) / SALE_COMPS.length;
  const avgPpsf = SALE_COMPS.reduce((s, c) => s + c.price / c.sqftLiving, 0) / SALE_COMPS.length;
  const avgRent = RENT_COMPS.reduce((s, c) => s + c.rent, 0) / RENT_COMPS.length;
  const annualRent = avgRent * 12;
  const capRate = (annualRent / avgPrice) * 100;

  return (
    <div className="space-y-10">
      {/* Section A — Sales */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Ventas recientes en la zona</h2>
          <p className="text-sm text-muted-foreground">Propiedades similares vendidas recientemente en Cape Coral, FL</p>
        </div>
        <div className="card-soft overflow-hidden">
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Dirección</th>
                  <th>Precio venta</th>
                  <th>Sqft total</th>
                  <th>Sqft living</th>
                  <th>Días en mercado</th>
                  <th className="pr-4">Fecha venta</th>
                </tr>
              </thead>
              <tbody>
                {SALE_COMPS.map((c) => (
                  <tr key={c.address} className="border-b border-border/60 last:border-0">
                    <td className="py-3 px-4 font-medium text-foreground">{c.address}</td>
                    <td className="font-semibold text-primary">{formatUSD(c.price)}</td>
                    <td>{c.sqftTotal.toLocaleString()} sqft</td>
                    <td>{c.sqftLiving.toLocaleString()} sqft</td>
                    <td>{c.dom} días</td>
                    <td className="pr-4">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-border">
            {SALE_COMPS.map((c) => (
              <div key={c.address} className="p-4">
                <p className="font-medium text-foreground">{c.address}</p>
                <p className="text-lg font-bold text-primary mt-1">{formatUSD(c.price)}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Total: {c.sqftTotal.toLocaleString()} sqft</span>
                  <span>Living: {c.sqftLiving.toLocaleString()} sqft</span>
                  <span>{c.dom} días en mercado</span>
                  <span>{c.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-soft p-6 bg-primary text-primary-foreground">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary-foreground/80">Resumen de ventas</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Stat dark label="Precio promedio" value={formatUSD(Math.round(avgPrice))} />
            <Stat dark label="Promedio días en mercado" value={`${Math.round(avgDom)} días`} />
            <Stat dark label="Promedio por sqft living" value={`$${Math.round(avgPpsf)}/sqft`} />
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Section B — Rentals */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Rentas recientes en la zona</h2>
          <p className="text-sm text-muted-foreground">Propiedades similares alquiladas recientemente en Cape Coral, FL</p>
        </div>
        <div className="card-soft overflow-hidden">
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Dirección</th>
                  <th>Renta mensual</th>
                  <th>Sqft living</th>
                  <th>Beds/Baths</th>
                  <th className="pr-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {RENT_COMPS.map((c) => (
                  <tr key={c.address} className="border-b border-border/60 last:border-0">
                    <td className="py-3 px-4 font-medium text-foreground">{c.address}</td>
                    <td className="font-semibold text-primary">{formatUSD(c.rent)}/mes</td>
                    <td>{c.sqftLiving.toLocaleString()} sqft</td>
                    <td>{c.beds}</td>
                    <td className="pr-4">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden divide-y divide-border">
            {RENT_COMPS.map((c) => (
              <div key={c.address} className="p-4">
                <p className="font-medium text-foreground">{c.address}</p>
                <p className="text-lg font-bold text-primary mt-1">{formatUSD(c.rent)}/mes</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{c.sqftLiving.toLocaleString()} sqft</span>
                  <span>{c.beds}</span>
                  <span>{c.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-soft p-6 bg-primary text-primary-foreground">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary-foreground/80">Resumen de rentas</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Stat dark label="Renta promedio mensual" value={`${formatUSD(Math.round(avgRent))}/mes`} />
            <Stat dark label="Renta promedio anual" value={`${formatUSD(Math.round(annualRent))}/año`} />
            <Stat dark label="Cap rate estimado" value={`~${capRate.toFixed(1)}%`} />
          </div>
        </div>
      </section>
    </div>
  );
}
function DocsTab({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("project_documents").select("*").eq("project_id", projectId);
      setDocs(data ?? []);
    })();
  }, [projectId]);

  const open = async (path: string) => {
    const { data, error } = await supabase.storage.from("project-documents").createSignedUrl(path, 60 * 10);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank");
  };

  const groups = [
    { key: "legal", label: "Documentos Legales" },
    { key: "construccion", label: "Documentos de Construcción" },
  ];

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const items = docs.filter((d) => d.category === g.key);
        return (
          <div key={g.key} className="card-soft p-6">
            <h3 className="font-semibold text-foreground mb-4">{g.label}</h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin documentos disponibles.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map((d) => {
                  const label = DOC_LABELS[d.doc_type] ?? d.doc_type;
                  const uploaded = !!d.file_path;
                  return (
                    <button
                      key={d.id}
                      disabled={!uploaded}
                      onClick={() => uploaded && open(d.file_path)}
                      className="text-left flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-background"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.llc_name ? `${d.llc_name} · ` : ""}
                          {uploaded ? "Cargado" : "Pendiente"}
                        </p>
                      </div>
                      {uploaded && <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
