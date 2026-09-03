import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatUSD } from "@/lib/stages";
import { Plus, Trash2, Edit, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const db = supabase as any;

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const STATUSES = [
  { value: "al_dia", label: "🟢 Al día" },
  { value: "venciendo", label: "🟡 Venciendo" },
  { value: "vacante", label: "🔴 Vacante" },
];

export function PortfolioAdmin() {
  return (
    <Tabs defaultValue="rentals">
      <TabsList className="bg-muted/60 flex-wrap h-auto">
        <TabsTrigger value="rentals">Alquileres</TabsTrigger>
        <TabsTrigger value="construction">Construcción</TabsTrigger>
        <TabsTrigger value="forsale">A la venta</TabsTrigger>
        <TabsTrigger value="sold">Vendidas</TabsTrigger>
        <TabsTrigger value="draws">Draws</TabsTrigger>
      </TabsList>
      <TabsContent value="rentals" className="mt-6"><RentalsAdmin /></TabsContent>
      <TabsContent value="construction" className="mt-6"><ConstructionAdmin /></TabsContent>
      <TabsContent value="forsale" className="mt-6"><SimpleTableAdmin table="portfolio_for_sale" /></TabsContent>
      <TabsContent value="sold" className="mt-6"><SimpleTableAdmin table="portfolio_sold" /></TabsContent>
      <TabsContent value="draws" className="mt-6"><DrawsAdmin /></TabsContent>
    </Tabs>
  );
}

/* ------------------------------- RENTALS -------------------------------- */

const EMPTY_RENTAL = {
  address: "", owner_name: "", ownership_pct: 100, tenant_name: "",
  monthly_rent: 0, monthly_expenses: 0, lease_start: "", lease_end: "",
  status: "al_dia", purchase_price: "", estimated_sale_price: "", sort_order: 0,
};

function RentalsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_RENTAL);
  const [editing, setEditing] = useState<string | null>(null);
  const [entriesFor, setEntriesFor] = useState<any | null>(null);

  const load = async () => {
    const { data } = await db.from("rental_properties").select("*").order("sort_order");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      address: form.address,
      owner_name: form.owner_name || null,
      ownership_pct: Number(form.ownership_pct) || 0,
      tenant_name: form.tenant_name || null,
      monthly_rent: Number(form.monthly_rent) || 0,
      monthly_expenses: Number(form.monthly_expenses) || 0,
      lease_start: form.lease_start || null,
      lease_end: form.lease_end || null,
      status: form.status,
      purchase_price: form.purchase_price === "" ? null : Number(form.purchase_price),
      estimated_sale_price: form.estimated_sale_price === "" ? null : Number(form.estimated_sale_price),
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = editing
      ? await db.from("rental_properties").update(payload).eq("id", editing)
      : await db.from("rental_properties").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Guardado");
    setOpen(false); setEditing(null); setForm(EMPTY_RENTAL);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await db.from("rental_properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Propiedades en alquiler</h3>
        <Button size="sm" onClick={() => { setForm(EMPTY_RENTAL); setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="card-soft p-4 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-foreground">{r.address}</p>
              <p className="text-xs text-muted-foreground">
                {r.tenant_name || "Sin inquilino"} · {formatUSD(r.monthly_rent)}/mes · {Number(r.ownership_pct)}% · {r.status}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEntriesFor(r)}>
                <CalendarDays className="h-4 w-4" /> Meses
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setForm({ ...EMPTY_RENTAL, ...r, lease_start: r.lease_start ?? "", lease_end: r.lease_end ?? "",
                  purchase_price: r.purchase_price ?? "", estimated_sale_price: r.estimated_sale_price ?? "",
                  owner_name: r.owner_name ?? "", tenant_name: r.tenant_name ?? "" });
                setEditing(r.id); setOpen(true);
              }}><Edit className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground text-sm">Sin propiedades.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} propiedad en alquiler</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field className="sm:col-span-2" label="Dirección" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <Field label="Propietario" value={form.owner_name} onChange={(v) => setForm({ ...form, owner_name: v })} />
            <Field label="Participación %" type="number" value={form.ownership_pct} onChange={(v) => setForm({ ...form, ownership_pct: v })} />
            <Field label="Inquilino" value={form.tenant_name} onChange={(v) => setForm({ ...form, tenant_name: v })} />
            <div>
              <Label>Estado</Label>
              <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <Field label="Alquiler mensual" type="number" value={form.monthly_rent} onChange={(v) => setForm({ ...form, monthly_rent: v })} />
            <Field label="Gastos mensuales" type="number" value={form.monthly_expenses} onChange={(v) => setForm({ ...form, monthly_expenses: v })} />
            <Field label="Inicio contrato" type="date" value={form.lease_start} onChange={(v) => setForm({ ...form, lease_start: v })} />
            <Field label="Vencimiento contrato" type="date" value={form.lease_end} onChange={(v) => setForm({ ...form, lease_end: v })} />
            <Field label="Precio de compra" type="number" value={form.purchase_price} onChange={(v) => setForm({ ...form, purchase_price: v })} />
            <Field label="Precio estimado de venta" type="number" value={form.estimated_sale_price} onChange={(v) => setForm({ ...form, estimated_sale_price: v })} />
            <Field label="Orden" type="number" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} />
          </div>
          <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {entriesFor && (
        <MonthlyEntriesDialog property={entriesFor} onClose={() => setEntriesFor(null)} />
      )}
    </div>
  );
}

function MonthlyEntriesDialog({ property, onClose }: { property: any; onClose: () => void }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [form, setForm] = useState({ income_rent: 0, income_other: 0, expense_admin: 0, expense_repairs: 0, expense_other: 0 });
  const [entries, setEntries] = useState<any[]>([]);

  const load = async () => {
    const { data } = await db.from("rental_monthly_entries").select("*").eq("property_id", property.id).order("year").order("month");
    setEntries(data ?? []);
  };
  useEffect(() => { load(); }, [property.id]);

  useEffect(() => {
    const e = entries.find((x) => x.month === month && x.year === year);
    setForm({
      income_rent: e?.income_rent ?? 0, income_other: e?.income_other ?? 0,
      expense_admin: e?.expense_admin ?? 0, expense_repairs: e?.expense_repairs ?? 0, expense_other: e?.expense_other ?? 0,
    });
  }, [entries, month, year]);

  const save = async () => {
    const payload = {
      property_id: property.id, month, year,
      income_rent: Number(form.income_rent) || 0,
      income_other: Number(form.income_other) || 0,
      expense_admin: Number(form.expense_admin) || 0,
      expense_repairs: Number(form.expense_repairs) || 0,
      expense_other: Number(form.expense_other) || 0,
    };
    const { error } = await db.from("rental_monthly_entries").upsert(payload, { onConflict: "property_id,month,year" });
    if (error) return toast.error(error.message);
    toast.success("Período guardado"); load();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Ingresos y egresos · {property.address}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Mes</Label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <Field label="Año" type="number" value={year} onChange={(v) => setYear(Number(v))} />
          <Field label="Ingreso alquiler" type="number" value={form.income_rent} onChange={(v) => setForm({ ...form, income_rent: v as any })} />
          <Field label="Otros ingresos" type="number" value={form.income_other} onChange={(v) => setForm({ ...form, income_other: v as any })} />
          <Field label="Management fee" type="number" value={form.expense_admin} onChange={(v) => setForm({ ...form, expense_admin: v as any })} />
          <Field label="Reparaciones" type="number" value={form.expense_repairs} onChange={(v) => setForm({ ...form, expense_repairs: v as any })} />
          <Field label="Otros egresos" type="number" value={form.expense_other} onChange={(v) => setForm({ ...form, expense_other: v as any })} />
        </div>
        <div className="rounded-lg bg-muted/40 p-3 text-sm flex justify-between">
          <span className="font-medium">NOI del período</span>
          <span className="font-bold text-primary">
            {formatUSD(
              Number(form.income_rent) + Number(form.income_other) -
              Number(form.expense_admin) - Number(form.expense_repairs) - Number(form.expense_other),
            )}
          </span>
        </div>
        {entries.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Períodos cargados: {entries.map((e) => `${MONTHS[e.month - 1].slice(0, 3)} ${e.year}`).join(", ")}
          </div>
        )}
        <DialogFooter><Button onClick={save}>Guardar período</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- CONSTRUCTION ----------------------------- */

function ConstructionAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [draft, setDraft] = useState<Record<string, { sale: string; contract: string }>>({});

  const load = async () => {
    const { data } = await db
      .from("projects")
      .select("id,address,total_cost,construction_cost,lot_cost,expected_sale_price,estimated_sale_price,total_contract_value")
      .eq("status", "En construcción")
      .order("address");
    const list = (data ?? []).filter((p: any) => p.address !== "Nueva propiedad");
    setRows(list);
    const d: Record<string, { sale: string; contract: string }> = {};
    list.forEach((p: any) => {
      d[p.id] = {
        sale: String(p.estimated_sale_price ?? p.expected_sale_price ?? ""),
        contract: String(p.total_contract_value ?? p.total_cost ?? ""),
      };
    });
    setDraft(d);
  };
  useEffect(() => { load(); }, []);

  const save = async (id: string) => {
    const v = draft[id];
    const { error } = await db.from("projects").update({
      estimated_sale_price: v.sale === "" ? null : Number(v.sale),
      total_contract_value: v.contract === "" ? null : Number(v.contract),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Guardado");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Las propiedades en construcción se toman automáticamente de los proyectos. Solo definí el precio estimado de venta y el valor total del contrato.
      </p>
      {rows.map((p) => (
        <div key={p.id} className="card-soft p-4 grid sm:grid-cols-4 gap-3 items-end">
          <p className="font-semibold text-foreground sm:col-span-1">{p.address}</p>
          <Field label="Precio estimado de venta" type="number" value={draft[p.id]?.sale ?? ""}
            onChange={(v) => setDraft({ ...draft, [p.id]: { ...draft[p.id], sale: v } })} />
          <Field label="Total construcción (contrato)" type="number" value={draft[p.id]?.contract ?? ""}
            onChange={(v) => setDraft({ ...draft, [p.id]: { ...draft[p.id], contract: v } })} />
          <Button size="sm" onClick={() => save(p.id)}>Guardar</Button>
        </div>
      ))}
      {rows.length === 0 && <p className="text-muted-foreground text-sm">Sin proyectos en construcción.</p>}
    </div>
  );
}

/* --------------------------- FOR SALE / SOLD ---------------------------- */

function SimpleTableAdmin({ table }: { table: "portfolio_for_sale" | "portfolio_sold" }) {
  const isSold = table === "portfolio_sold";
  const empty: any = isSold
    ? { address: "", sale_price: 0, sale_date: "", cost_base: "" }
    : { address: "", listing_price: 0, cost_base: 0, notes: "" };
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    const { data } = await db.from(table).select("*").order("created_at");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, [table]);

  const save = async () => {
    const payload = isSold
      ? {
          address: form.address,
          sale_price: Number(form.sale_price) || 0,
          sale_date: form.sale_date || null,
          cost_base: form.cost_base === "" ? null : Number(form.cost_base),
        }
      : {
          address: form.address,
          listing_price: Number(form.listing_price) || 0,
          cost_base: Number(form.cost_base) || 0,
          notes: form.notes || null,
        };
    const { error } = editing
      ? await db.from(table).update(payload).eq("id", editing)
      : await db.from(table).insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Guardado");
    setOpen(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => {
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">{isSold ? "Propiedades vendidas" : "Propiedades a la venta"}</h3>
        <Button size="sm" onClick={() => { setForm(empty); setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="card-soft p-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-foreground">{r.address}</p>
            <p className="text-xs text-muted-foreground">
              {isSold
                ? `${formatUSD(r.sale_price)} · ${r.sale_date ?? "sin fecha"}`
                : `${formatUSD(r.listing_price)} · base ${formatUSD(r.cost_base)}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => {
              setForm({ ...empty, ...r, sale_date: r.sale_date ?? "", cost_base: r.cost_base ?? "", notes: r.notes ?? "" });
              setEditing(r.id); setOpen(true);
            }}><Edit className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="text-muted-foreground text-sm">Sin registros.</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} propiedad</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field className="sm:col-span-2" label="Dirección" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            {isSold ? (
              <>
                <Field label="Precio de venta" type="number" value={form.sale_price} onChange={(v) => setForm({ ...form, sale_price: v })} />
                <Field label="Fecha de venta" type="date" value={form.sale_date} onChange={(v) => setForm({ ...form, sale_date: v })} />
                <Field label="Costo base" type="number" value={form.cost_base} onChange={(v) => setForm({ ...form, cost_base: v })} />
              </>
            ) : (
              <>
                <Field label="Precio de listado" type="number" value={form.listing_price} onChange={(v) => setForm({ ...form, listing_price: v })} />
                <Field label="Costo base" type="number" value={form.cost_base} onChange={(v) => setForm({ ...form, cost_base: v })} />
                <div className="sm:col-span-2">
                  <Label>Notas</Label>
                  <Textarea className="mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </>
            )}
          </div>
          <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", className }: {
  label: string; value: any; onChange: (v: string) => void; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input className="mt-1" type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
