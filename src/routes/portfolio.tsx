import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ALL_STAGES, formatUSD } from "@/lib/stages";
import { HardHat, Home, Tag, CheckCircle2, ArrowRight, MapPin } from "lucide-react";
import { OwnershipPanel, useOwnerships } from "@/components/OwnershipPanel";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Mi Portafolio | GrowUp Investments" },
      { name: "description", content: "Portafolio de inversiones: propiedades en construcción, en alquiler, a la venta y vendidas." },
      { property: "og:title", content: "Mi Portafolio | GrowUp Investments" },
      { property: "og:description", content: "Portafolio de inversiones: construcción, alquiler, ventas y resultados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const db = supabase as any;

type Project = {
  id: string;
  address: string;
  status: string;
  total_cost: number | null;
  construction_cost: number | null;
  lot_cost: number | null;
  expected_sale_price: number | null;
  estimated_sale_price: number | null;
  total_contract_value: number | null;
};

type Stage = {
  project_id: string;
  stage_name: string;
  stage_group: string | null;
  completed: boolean;
  active: boolean;
  draw_number: number | null;
  draw_amount: number | null;
};

type Rental = {
  id: string;
  address: string;
  owner_name: string | null;
  ownership_pct: number;
  tenant_name: string | null;
  monthly_rent: number;
  monthly_expenses: number;
  lease_start: string | null;
  lease_end: string | null;
  status: string;
  purchase_price: number | null;
  estimated_sale_price: number | null;
  project_id: string | null;
  investor_id: string | null;
};

type Entry = {
  id: string;
  property_id: string;
  month: number;
  year: number;
  income_rent: number;
  income_other: number;
  expense_admin: number;
  expense_repairs: number;
  expense_other: number;
};

function PortfolioPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single().then(({ data }) => {
      setProfileName(data?.full_name ?? user.email ?? "");
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name={profileName} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground">Mi Portafolio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estado consolidado de tus inversiones inmobiliarias
        </p>

        <Tabs defaultValue="construccion" className="mt-8">
          <TabsList className="bg-muted/60 flex-wrap h-auto">
            <TabsTrigger value="construccion" className="gap-1.5">
              <HardHat className="h-4 w-4" /> En Construcción
            </TabsTrigger>
            <TabsTrigger value="alquiler" className="gap-1.5">
              <Home className="h-4 w-4" /> En Alquiler
            </TabsTrigger>
            <TabsTrigger value="venta" className="gap-1.5">
              <Tag className="h-4 w-4" /> A la Venta
            </TabsTrigger>
            <TabsTrigger value="vendidas" className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Vendidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="construccion" className="mt-6"><ConstructionTab /></TabsContent>
          <TabsContent value="alquiler" className="mt-6"><RentalTab /></TabsContent>
          <TabsContent value="venta" className="mt-6"><ForSaleTab /></TabsContent>
          <TabsContent value="vendidas" className="mt-6"><SoldTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* --------------------------- TAB 1: CONSTRUCCIÓN --------------------------- */

function Box({ label, value, tone }: { label: string; value: string; tone?: "muted" }) {
  return (
    <div className={`rounded-xl border border-border px-3 py-2.5 ${tone === "muted" ? "bg-muted/40" : "bg-card"}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">{label}</p>
      <p className="text-sm font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function ConstructionTab() {
  const { rows: ownerships, myLlc } = useOwnerships();
  const [rows, setRows] = useState<
    (Project & { progress: number; stage: string; deposited: number; pending: number })[]
  >([]);


  useEffect(() => {
    (async () => {
      const { data: projects } = await db
        .from("projects")
        .select("id,address,status,total_cost,construction_cost,lot_cost,expected_sale_price,estimated_sale_price,total_contract_value")
        .eq("status", "En construcción");
      const list: Project[] = (projects ?? []).filter((p: Project) => p.address !== "Nueva propiedad");
      if (list.length === 0) return setRows([]);
      const { data: stagesData } = await db
        .from("project_stages")
        .select("project_id,stage_name,stage_group,completed,active,draw_number,draw_amount")
        .in("project_id", list.map((p) => p.id));
      const stages: Stage[] = stagesData ?? [];
      const { data: drawsData } = await db
        .from("project_draws")
        .select("project_id,amount,paid")
        .in("project_id", list.map((p) => p.id));
      const allDraws: any[] = drawsData ?? [];

      const enriched = list.map((p) => {
        const ps = stages.filter((s) => s.project_id === p.id);
        const done = ps.filter((s) => s.completed).length;
        const progress = ALL_STAGES.length ? Math.round((done / ALL_STAGES.length) * 100) : 0;
        const activeSt = ps.find((s) => s.active);
        const stage = (activeSt?.stage_group?.startsWith("CO") ? activeSt.stage_group : activeSt?.stage_name) ?? (progress >= 100 ? "Finalizada" : "Por iniciar");

        const draws = new Map<number, { amount: number; completed: boolean }>();
        ps.forEach((s) => {
          if (s.draw_number == null) return;
          const cur = draws.get(s.draw_number) ?? { amount: 0, completed: true };
          cur.amount = Math.max(cur.amount, Number(s.draw_amount || 0));
          cur.completed = cur.completed && s.completed;
          draws.set(s.draw_number, cur);
        });
        let deposited = 0;
        let pending = 0;
        const pd = allDraws.filter((d) => d.project_id === p.id);
        if (pd.length > 0) {
          pd.forEach((d) => {
            if (d.paid) deposited += Number(d.amount || 0);
            else pending += Number(d.amount || 0);
          });
        } else {
          draws.forEach((d) => {
            if (d.completed) deposited += d.amount;
            else pending += d.amount;
          });
        }
        return { ...p, progress, stage, deposited, pending };
      });
      enriched.sort((a, b) => a.address.localeCompare(b.address));
      setRows(enriched);
    })();
  }, []);

  const totals = rows.reduce(
    (acc, r) => {
      const contract = contractValue(r);
      const sale = salePrice(r);
      acc.deposited += r.deposited;
      acc.pending += r.pending;
      acc.contract += contract;
      acc.sale += sale;
      return acc;
    },
    { deposited: 0, pending: 0, contract: 0, sale: 0 },
  );
  const totalGain = totals.sale - totals.contract;
  const totalRoi = totals.contract ? (totalGain / totals.contract) * 100 : 0;

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No hay propiedades en construcción.</p>;
  }

  return (
    <div className="space-y-5">
      {rows.map((r) => {
        const contract = contractValue(r);
        const sale = salePrice(r);
        const gain = sale - contract;
        const roi = contract ? (gain / contract) * 100 : 0;
        return (
          <div key={r.id} className="card-soft p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{r.address}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> Florida, USA
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/dashboard/$projectId" params={{ projectId: r.id }}>
                  Ver proyecto <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Avance de obra</span>
                <span className="font-semibold text-foreground">{r.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${r.progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Etapa actual: <span className="text-foreground font-medium">{r.stage}</span>
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Box label="Total depositado a la fecha" value={formatUSD(r.deposited)} />
              <Box label="Pendiente de depositar" value={formatUSD(r.pending)} />
              <Box label="Total construcción" value={formatUSD(contract)} />
              <Box label="Precio estimado de venta" value={formatUSD(sale)} tone="muted" />
            </div>

            <OwnershipPanel
              ownerships={ownerships.filter((o) => o.project_id === r.id)}
              myLlc={myLlc}
              stage="construccion"
              amounts={[
                { label: "Total depositado", value: r.deposited },
                { label: "Pendiente", value: r.pending },
                { label: "Total construcción", value: contract },
                { label: "Ganancia estimada", value: gain },
              ]}
            />


            <div className="mt-4 rounded-xl bg-primary text-primary-foreground p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide opacity-80">Ganancia estimada</p>
                <p className="text-xl font-bold">{formatUSD(gain)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide opacity-80">ROI estimado</p>
                <p className="text-2xl font-bold">{roi.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="card-soft p-6 bg-secondary/30 border-secondary">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Consolidado en construcción
        </h3>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Box label="Total depositado" value={formatUSD(totals.deposited)} />
          <Box label="Pendiente de depositar" value={formatUSD(totals.pending)} />
          <Box label="Total construcción" value={formatUSD(totals.contract)} />
          <Box label="Venta estimada" value={formatUSD(totals.sale)} tone="muted" />
        </div>
        <div className="mt-4 rounded-xl bg-primary text-primary-foreground p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide opacity-80">Ganancia estimada total</p>
            <p className="text-xl font-bold">{formatUSD(totalGain)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide opacity-80">ROI estimado total</p>
            <p className="text-2xl font-bold">{totalRoi.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function contractValue(p: Project) {
  return Number(
    p.total_contract_value ?? p.total_cost ?? (Number(p.construction_cost || 0) + Number(p.lot_cost || 0)),
  );
}
function salePrice(p: Project) {
  return Number(p.estimated_sale_price ?? p.expected_sale_price ?? 0);
}

/* ----------------------------- TAB 2: ALQUILER ----------------------------- */

const STATUS_META: Record<string, { label: string; dot: string; cls: string }> = {
  al_dia: { label: "Al día", dot: "🟢", cls: "bg-primary/10 text-primary" },
  venciendo: { label: "Venciendo", dot: "🟡", cls: "bg-amber-100 text-amber-800" },
  vacante: { label: "Vacante", dot: "🔴", cls: "bg-red-100 text-red-800" },
};

function entryNoi(e: Entry) {
  return (
    Number(e.income_rent || 0) + Number(e.income_other || 0) -
    Number(e.expense_admin || 0) - Number(e.expense_repairs || 0) - Number(e.expense_other || 0)
  );
}

function RentalTab() {
  const { rows: ownerships, myLlc } = useOwnerships();
  const { user, role } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [props, setProps] = useState<Rental[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await db.from("rental_properties").select("*").order("sort_order");
      setProps(p ?? []);
      const { data: e } = await db.from("rental_monthly_entries").select("*");
      const list = e ?? [];
      setEntries(list);
      // Posicionar el período en el último mes con datos cargados
      const withData = list.filter((x: Entry) => entryNoi(x) !== 0 || Number(x.income_rent || 0) !== 0);
      if (withData.length) {
        const last = withData.reduce((a: Entry, b: Entry) =>
          b.year * 12 + b.month > a.year * 12 + a.month ? b : a,
        );
        setYear(last.year);
        setMonth(last.month);
      }
    })();
  }, []);

  const isAdmin = role === "admin";

  const myRentalProjectIds = useMemo(() => {
    const ids = new Set<string>();
    ownerships.forEach((o) => {
      if (o.stage === "alquiler" && !o.to_date && o.project_id) {
        ids.add(o.project_id);
      }
    });
    return ids;
  }, [ownerships]);

  const visibleProps = useMemo(() => {
    if (isAdmin) return props;
    return props.filter((p) => {
      if (p.project_id && myRentalProjectIds.has(p.project_id)) return true;
      if (p.investor_id && user && p.investor_id === user.id) return true;
      return false;
    });
  }, [props, ownerships, myRentalProjectIds, isAdmin, user]);

  const years = useMemo(() => {
    const set = new Set<number>([now.getFullYear(), now.getFullYear() - 1, now.getFullYear() + 1]);
    entries.forEach((e) => set.add(e.year));
    return Array.from(set).sort();
  }, [entries]);

  const active = visibleProps.filter((p) => p.status !== "vacante");
  const grossMonthly = active.reduce((s, p) => s + Number(p.monthly_rent || 0), 0);
  const noiMonthly = active.reduce((s, p) => s + (Number(p.monthly_rent || 0) - Number(p.monthly_expenses || 0)), 0);

  const visibleEntries = useMemo(
    () => entries.filter((e) => visibleProps.some((p) => p.id === e.property_id)),
    [entries, visibleProps],
  );

  const periodEntries = visibleEntries.filter((e) => e.month === month && e.year === year);
  const periodNoi = periodEntries.reduce((s, e) => s + entryNoi(e), 0);
  const ytdNoi = visibleEntries
    .filter((e) => e.year === year && e.month <= month)
    .reduce((s, e) => s + entryNoi(e), 0);

  const chartData = MONTHS.map((m, i) => ({
    mes: m.slice(0, 3),
    noi: visibleEntries.filter((e) => e.year === year && e.month === i + 1).reduce((s, e) => s + entryNoi(e), 0),
  }));

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Box label="Propiedades activas" value={String(active.length)} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Período:</span>
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-[150px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[110px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {visibleProps.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No hay propiedades en alquiler.</p>
      )}

      {visibleProps.map((p) => {
        const meta = STATUS_META[p.status] ?? STATUS_META.al_dia;
        const noi = Number(p.monthly_rent || 0) - Number(p.monthly_expenses || 0);
        const e = periodEntries.find((x) => x.property_id === p.id);
        const income = e ? Number(e.income_rent || 0) + Number(e.income_other || 0) : 0;
        const expenses = e
          ? Number(e.expense_admin || 0) + Number(e.expense_repairs || 0) + Number(e.expense_other || 0)
          : 0;
        const accum = visibleEntries
          .filter((x) => x.property_id === p.id && x.year === year && x.month <= month)
          .reduce((s, x) => s + Number(x.income_rent || 0) + Number(x.income_other || 0), 0);

        return (
          <div key={p.id} className="card-soft p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{p.address}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.tenant_name ? `Inquilino: ${p.tenant_name}` : "Sin inquilino"}
                  {p.lease_start ? ` · Inicio: ${fmtDate(p.lease_start)}` : ""}
                  {p.lease_end ? ` · Vence: ${fmtDate(p.lease_end)}` : ""}
                </p>
                {p.owner_name && <p className="text-xs text-muted-foreground">Propietario: {p.owner_name}</p>}
                {(p as any).notes && <p className="text-xs text-muted-foreground mt-0.5">{(p as any).notes}</p>}
                {((p as any).property_tax_annual || (p as any).insurance_annual || (p as any).management_annual) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Anual: impuestos {formatUSD((p as any).property_tax_annual)} · seguro {formatUSD((p as any).insurance_annual)} · administración {formatUSD((p as any).management_annual)}
                    {(p as any).cap_rate ? ` · Cap rate ${Number((p as any).cap_rate)}%` : ""}
                  </p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.cls}`}>
                {meta.dot} {meta.label}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Box label="Participación" value={`${Number(p.ownership_pct)}%`} />
              <Box label="Alquiler mensual bruto" value={formatUSD(p.monthly_rent)} />
              <Box label="NOI mensual" value={formatUSD(noi)} />
              <Box label="NOI anual estimado" value={formatUSD(noi * 12)} />
              <Box label="Precio estimado de venta" value={p.estimated_sale_price ? formatUSD(p.estimated_sale_price) : "—"} tone="muted" />
            </div>

            {p.project_id && (
              <OwnershipPanel
                ownerships={ownerships.filter((o) => o.project_id === p.project_id)}
                myLlc={myLlc}
                stage="alquiler"
                amounts={[
                  { label: "Alquiler mensual", value: Number(p.monthly_rent || 0) },
                  { label: "NOI mensual", value: noi },
                  { label: "NOI anual estimado", value: noi * 12 },
                  { label: "NOI del período", value: income - expenses },
                ]}
              />
            )}


            <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Período: {MONTHS[month - 1]} {year}
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Ingresos</p>
                  <Row label="Ingreso alquiler" value={e ? Number(e.income_rent || 0) : 0} />
                  <Row label="Otros ingresos" value={e ? Number(e.income_other || 0) : 0} />
                  <Row label="Total ingresos" value={income} strong />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Egresos</p>
                  <Row label="Management fee" value={e ? Number(e.expense_admin || 0) : 0} />
                  <Row label="Reparaciones" value={e ? Number(e.expense_repairs || 0) : 0} />
                  <Row label="Otros" value={e ? Number(e.expense_other || 0) : 0} />
                  <Row label="Total egresos" value={expenses} strong />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">NOI del período</span>
                <span className="text-lg font-bold text-primary">{formatUSD(income - expenses)}</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Total cobrado hasta {MONTHS[month - 1]} {year}:{" "}
              <span className="font-semibold text-foreground">{formatUSD(accum)}</span>
            </p>
          </div>
        );
      })}

      <div className="card-soft p-6 bg-secondary/30 border-secondary">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Consolidado</h3>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Box label={`NOI total ${MONTHS[month - 1]} ${year}`} value={formatUSD(periodNoi)} />
          <Box label={`NOI acumulado ${year}`} value={formatUSD(ytdNoi)} />
        </div>
      </div>

      <div className="card-soft p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          NOI mensual total {year}
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatUSD(Number(v))} />
              <Bar dataKey="noi" fill="#1B4332" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between mt-1 ${strong ? "font-semibold text-foreground border-t border-border pt-1 mt-2" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span>{formatUSD(value)}</span>
    </div>
  );
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

/* ----------------------------- TAB 3: A LA VENTA ---------------------------- */

function ForSaleTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    db.from("portfolio_for_sale").select("*").order("created_at").then(({ data }: any) => setRows(data ?? []));
  }, []);
  if (rows.length === 0) return <p className="text-muted-foreground text-center py-12">No hay propiedades a la venta.</p>;
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {rows.map((r) => {
        const base = Number(r.cost_base || 0);
        const roi = base ? ((Number(r.listing_price || 0) - base) / base) * 100 : 0;
        const is2812 = (r.address ?? "").toLowerCase().includes("2812");
        const is35SW = (r.address ?? "").toLowerCase().includes("35 sw 19th");
        if (is35SW) {
          return (
            <div key={r.id} className="card-soft p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">{r.address}</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 whitespace-nowrap">
                  🟠 En venta
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Lote (sin construcción)</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Box label="Precio de venta" value={formatUSD(60000)} />
                <Box label="Costo lote" value={formatUSD(50000)} tone="muted" />
              </div>
              <div className="mt-3 rounded-xl bg-primary text-primary-foreground p-4 space-y-2 text-sm">
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Purchase price</span><span className="font-semibold">{formatUSD(60000)}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Closing costs (8%)</span><span className="font-semibold">({formatUSD(4800)})</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Net sales proceeds</span><span className="font-semibold">{formatUSD(55200)}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Land cost</span><span className="font-semibold">{formatUSD(50000)}</span></div>
                <div className="flex justify-between pt-1 text-base"><span className="font-semibold">ROI estimado</span><span className="font-bold">10.40%</span></div>
              </div>
              {r.project_id && (
                <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                  <Link to="/dashboard/$projectId" params={{ projectId: r.project_id }}>
                    Ver proyecto <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          );
        }
        if (is2812) {
          return (
            <div key={r.id} className="card-soft p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">{r.address}</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 whitespace-nowrap">
                  🟠 En venta
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Box label="Precio de venta" value={formatUSD(415000)} />
                <Box label="Total invertido" value={formatUSD(351000)} tone="muted" />
              </div>
              <div className="mt-3 rounded-xl bg-primary text-primary-foreground p-4 space-y-2 text-sm">
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Purchase price</span><span className="font-semibold">{formatUSD(415000)}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Closing costs (8%)</span><span className="font-semibold">({formatUSD(33200)})</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Net sales proceeds</span><span className="font-semibold">{formatUSD(381800)}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Land cost</span><span className="font-semibold">{formatUSD(55000)}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Construction cost</span><span className="font-semibold">{formatUSD(296000)}</span></div>
                <div className="flex justify-between pt-1 text-base"><span className="font-semibold">ROI estimado</span><span className="font-bold">8.77%</span></div>
              </div>
              {r.project_id && (
                <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                  <Link to="/dashboard/$projectId" params={{ projectId: r.project_id }}>
                    Ver proyecto <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          );
        }
        return (
          <div key={r.id} className="card-soft p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">{r.address}</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 whitespace-nowrap">
                🟠 En venta
              </span>
            </div>
            {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Box label="Precio de venta" value={formatUSD(r.listing_price)} />
              <Box label="Costo base" value={formatUSD(base)} tone="muted" />
            </div>
            <div className="mt-3 rounded-xl bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide opacity-80">ROI estimado</span>
              <span className="text-xl font-bold">{roi.toFixed(2)}%</span>
            </div>
            {r.project_id && (
              <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                <Link to="/dashboard/$projectId" params={{ projectId: r.project_id }}>
                  Ver proyecto <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ TAB 4: VENDIDAS ----------------------------- */

function SoldTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    db.from("portfolio_sold").select("*").order("sale_date", { ascending: false }).then(({ data }: any) => setRows(data ?? []));
  }, []);
  if (rows.length === 0) return <p className="text-muted-foreground text-center py-12">Aún no hay propiedades vendidas.</p>;
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {rows.map((r) => {
        const base = Number(r.cost_base || 0);
        const roi = base ? ((Number(r.sale_price || 0) - base) / base) * 100 : null;
        const is127Cape = (r.address ?? "").toLowerCase().includes("127 nw 24th");

        if (is127Cape) {
          return (
            <div key={r.id} className="card-soft p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">{r.address}</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                  ✅ Vendida
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Lote (sin construcción) · Vendida el 2 de julio de 2026</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Box label="Precio de venta" value={formatUSD(57145.42)} />
                <Box label="Costo lote" value={formatUSD(50000)} tone="muted" />
              </div>
              <div className="mt-3 rounded-xl bg-primary text-primary-foreground p-4 space-y-2 text-sm">
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Purchase price (lote)</span><span className="font-semibold">{formatUSD(62000)}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Closing costs (7,83%)</span><span className="font-semibold">({formatUSD(4854.58)})</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Net sales proceeds</span><span className="font-semibold">{formatUSD(57145.42)}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-2"><span>Land cost (costo original)</span><span className="font-semibold">{formatUSD(50000)}</span></div>
                <div className="flex justify-between pt-1 text-base"><span className="font-semibold">ROI estimado</span><span className="font-bold">14.29%</span></div>
              </div>
              {r.project_id && (
                <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                  <Link to="/dashboard/$projectId" params={{ projectId: r.project_id }}>
                    Ver proyecto <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          );
        }
        return (
          <div key={r.id} className="card-soft p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">{r.address}</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                ✅ Vendida
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Box label="Precio de venta final" value={formatUSD(r.sale_price)} />
              <Box label="Fecha de venta" value={r.sale_date ? fmtDate(r.sale_date) : "—"} tone="muted" />
            </div>
            {roi != null && (
              <div className="mt-3 rounded-xl bg-primary text-primary-foreground p-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide opacity-80">ROI realizado</span>
                <span className="text-xl font-bold">{roi.toFixed(2)}%</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
