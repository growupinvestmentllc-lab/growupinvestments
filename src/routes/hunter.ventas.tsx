import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/stages";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/hunter/ventas")({
  head: () => ({
    meta: [
      { title: "Mis Ventas | GrowUp Investments" },
      { name: "description", content: "Record de casas vendidas para construcción, terminadas y RBI con fecha, comprador, comisión y precio." },
      { property: "og:title", content: "Mis Ventas | GrowUp Investments" },
      { property: "og:description", content: "Record de ventas: fecha, comprador, comisión y precio de venta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HunterSales,
});

type Sale = {
  id: string;
  kind: string;
  address: string;
  buyer_name: string | null;
  sale_date: string | null;
  sale_price: number | null;
  commission_pct: number | null;
  commission_amount: number | null;
  notes: string | null;
};

const db = supabase as any;

const KIND_LABEL: Record<string, string> = {
  construccion: "Vendidas para construcción",
  terminada: "Vendidas ya terminadas",
  rbi: "Vendidas RBI",
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function Table({ rows }: { rows: Sale[] }) {
  if (rows.length === 0) {
    return <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">Sin ventas registradas.</div>;
  }
  return (
    <div className="card-soft overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <th className="px-4 py-3">Dirección</th>
            <th className="px-4 py-3">Fecha de venta</th>
            <th className="px-4 py-3">Comprador</th>
            <th className="px-4 py-3 text-right">% Hunter</th>
            <th className="px-4 py-3 text-right">Comisión</th>
            <th className="px-4 py-3 text-right">Precio de venta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const commission =
              s.commission_amount ??
              (s.sale_price != null && s.commission_pct != null ? (s.sale_price * s.commission_pct) / 100 : null);
            return (
              <tr key={s.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{s.address}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(s.sale_date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.buyer_name ?? "—"}</td>
                <td className="px-4 py-3 text-right">{s.commission_pct != null ? `${Number(s.commission_pct).toFixed(1)}%` : "—"}</td>
                <td className="px-4 py-3 text-right">{commission != null ? formatUSD(commission) : "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  {s.sale_price != null ? formatUSD(s.sale_price) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HunterSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("2026");

  useEffect(() => {
    (async () => {
      const { data } = await db
        .from("hunter_sales")
        .select("*")
        .order("sale_date", { ascending: false });
      setSales((data ?? []) as Sale[]);
    })();
  }, []);

  const periods = useMemo(() => {
    const datedYears = sales
      .map((sale) => sale.sale_date?.slice(0, 4))
      .filter((year): year is string => Boolean(year));
    const years = Array.from(new Set(["2026", "2027", ...datedYears])).sort();
    return sales.some((sale) => !sale.sale_date) ? [...years, "sin-fecha"] : years;
  }, [sales]);

  const periodSales = useMemo(
    () =>
      sales.filter((sale) =>
        selectedPeriod === "sin-fecha" ? !sale.sale_date : sale.sale_date?.startsWith(selectedPeriod),
      ),
    [sales, selectedPeriod],
  );

  const totals = useMemo(() => {
    const volume = periodSales.reduce((a, s) => a + Number(s.sale_price ?? 0), 0);
    const commission = periodSales.reduce(
      (a, s) =>
        a +
        Number(
          s.commission_amount ??
            (s.sale_price != null && s.commission_pct != null ? (s.sale_price * s.commission_pct) / 100 : 0),
        ),
      0,
    );
    return { volume, commission, count: periodSales.length };
  }, [periodSales]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mis Ventas</h1>
      <p className="text-sm text-muted-foreground mt-1">Record de operaciones cerradas.</p>

      <div className="mt-6 border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-3" role="tablist" aria-label="Año de ventas">
          {periods.map((period) => {
            const active = selectedPeriod === period;
            return (
              <Button
                key={period}
                type="button"
                role="tab"
                aria-selected={active}
                variant={active ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period)}
                className="min-w-24 text-base font-bold"
              >
                {period === "sin-fecha" ? "Sin fecha" : period}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4 border-l-4 border-primary pl-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Período</p>
          <h2 className="text-3xl font-extrabold text-foreground">
            {selectedPeriod === "sin-fecha" ? "Ventas sin fecha" : `Ventas ${selectedPeriod}`}
          </h2>
        </div>
        <p className="pb-1 text-sm font-medium text-muted-foreground">
          {totals.count} {totals.count === 1 ? "operación" : "operaciones"}
        </p>
      </div>

      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        <div className="card-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ventas</p>
          <p className="text-2xl font-bold text-foreground">{totals.count}</p>
        </div>
        <div className="card-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Volumen vendido</p>
          <p className="text-2xl font-bold text-foreground">{formatUSD(totals.volume)}</p>
        </div>
        <div className="card-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Comisiones</p>
          <p className="text-2xl font-bold text-primary">{formatUSD(totals.commission)}</p>
        </div>
      </div>

      {(["construccion", "terminada", "rbi"] as const).map((k) => (
        <section key={k} className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-3">{KIND_LABEL[k]}</h2>
          <Table rows={periodSales.filter((s) => s.kind === k)} />
        </section>
      ))}
    </div>
  );
}
