import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/stages";
import { HardHat, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/hunter/")({
  head: () => ({
    meta: [
      { title: "Propuestas para vender | GrowUp Investments" },
      { name: "description", content: "Casas para construir, lotes disponibles y oportunidades RBI para ofrecer a tus clientes." },
      { property: "og:title", content: "Propuestas para vender | GrowUp Investments" },
      { property: "og:description", content: "Casas para construir, lotes disponibles y oportunidades RBI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HunterOfferings,
});

type Offering = {
  id: string;
  kind: string;
  title: string;
  location: string | null;
  model: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft_living: number | null;
  sqft_total: number | null;
  price: number | null;
  deposit_required: number | null;
  construction_cost: number | null;
  lot_cost: number | null;
  expected_sale_price: number | null;
  expected_roi: number | null;
  commission_pct: number | null;
  image_url: string | null;
  notes: string | null;
  sort_order: number | null;
};

const db = supabase as any;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-card border border-border/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Card({ o }: { o: Offering }) {
  const specs: { label: string; value: string }[] = [];
  if (o.model) specs.push({ label: "Modelo", value: o.model });
  if (o.bedrooms != null) specs.push({ label: "Dormitorios", value: String(o.bedrooms) });
  if (o.bathrooms != null) specs.push({ label: "Baños", value: String(o.bathrooms) });
  if (o.sqft_living != null) specs.push({ label: "Sqft living", value: String(o.sqft_living) });
  if (o.sqft_total != null) specs.push({ label: "Sqft total", value: String(o.sqft_total) });
  if (o.lot_cost != null) specs.push({ label: "Costo lote", value: formatUSD(o.lot_cost) });
  if (o.construction_cost != null) specs.push({ label: "Costo construcción", value: formatUSD(o.construction_cost) });
  if (o.price != null) specs.push({ label: "Precio", value: formatUSD(o.price) });
  if (o.deposit_required != null) specs.push({ label: "Depósito requerido", value: formatUSD(o.deposit_required) });
  if (o.expected_sale_price != null) specs.push({ label: "Precio estimado de venta", value: formatUSD(o.expected_sale_price) });
  if (o.expected_roi != null) specs.push({ label: "ROI estimado", value: `${Number(o.expected_roi).toFixed(1)}%` });
  if (o.commission_pct != null) specs.push({ label: "Tu comisión", value: `${Number(o.commission_pct).toFixed(1)}%` });

  return (
    <div className="card-soft overflow-hidden">
      {o.image_url && <img src={o.image_url} alt={o.title} className="h-44 w-full object-cover" />}
      <div className="p-5">
        <h3 className="font-semibold text-foreground">{o.title}</h3>
        {o.location && (
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {o.location}
          </p>
        )}
        {specs.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {specs.map((s) => (
              <Field key={s.label} {...s} />
            ))}
          </div>
        )}
        {o.notes && <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">{o.notes}</p>}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  items,
  empty,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: Offering[];
  empty: string;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      {items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="mt-4 grid md:grid-cols-2 gap-5">
          {items.map((o) => (
            <Card key={o.id} o={o} />
          ))}
        </div>
      )}
    </section>
  );
}

function HunterOfferings() {
  const [items, setItems] = useState<Offering[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await db
        .from("hunter_offerings")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      setItems((data ?? []) as Offering[]);
    })();
  }, []);

  const by = (k: string) => items.filter((i) => i.kind === k);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Propuestas para vender</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Casas disponibles, opciones con contrato de alquiler y lotes para elegir modelo.
      </p>

      <Section
        icon={<HardHat className="h-5 w-5 text-primary" />}
        title="Posibilidad de vender"
        subtitle="Casas disponibles para ofrecer a tus clientes."
        items={by("construccion")}
        empty="Todavía no hay casas cargadas."
      />
      <Section
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        title="Posibilidad de vender con contrato de alquiler"
        subtitle="Casas con inquilino y contrato vigente."
        items={by("rbi")}
        empty="Todavía no hay opciones cargadas."
      />
      <Section
        icon={<MapPin className="h-5 w-5 text-primary" />}
        title="Lotes en venta para elegir modelo de casa"
        subtitle="Lotes disponibles para definir el modelo junto al cliente."
        items={by("lote")}
        empty="Todavía no hay lotes cargados."
      />
    </div>
  );
}
