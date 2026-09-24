import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/stages";
import { ChevronLeft, ChevronRight, HardHat, Image as ImageIcon, MapPin, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  gallery: string[] | null;
  rent_gross: number | null;
  rent_net: number | null;
  proforma_url: string | null;
};

const db = supabase as any;

function Field({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        highlighted ? "border-primary/50 bg-secondary/40" : "border-border/60 bg-card"
      }`}
    >
      <p className={`text-[10px] uppercase tracking-wide ${highlighted ? "font-semibold text-primary" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className={`${highlighted ? "text-lg font-bold text-primary" : "text-sm font-semibold text-foreground"}`}>{value}</p>
    </div>
  );
}

function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const many = photos.length > 1;
  const go = (d: number) => setActive((i) => (i + d + photos.length) % photos.length);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="relative block w-full">
        <img src={photos[active]} alt={title} className="h-56 w-full object-cover" />
        {many && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-foreground/75 px-2.5 py-1 text-xs font-medium text-background">
            <ImageIcon className="h-3.5 w-3.5" /> {photos.length} fotos
          </span>
        )}
      </button>
      {many && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1">
          {photos.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === active ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <img src={p} alt={`${title} foto ${i + 1}`} loading="lazy" className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-2 sm:p-4">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="relative">
            <img src={photos[active]} alt={title} className="max-h-[75vh] w-full rounded-md object-contain" />
            {many && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Foto siguiente"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {many && (
            <p className="text-center text-xs text-muted-foreground">
              {active + 1} / {photos.length}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Card({ o }: { o: Offering }) {
  const specs: { label: string; value: string; highlighted?: boolean }[] = [];
  if (o.model) specs.push({ label: "Modelo", value: o.model });
  if (o.bedrooms != null)
    specs.push({
      label: "Dormitorios",
      value: o.model?.toLowerCase().includes("ponte vedra") ? `${o.bedrooms} + 1 studio` : String(o.bedrooms),
    });
  if (o.bathrooms != null) specs.push({ label: "Baños", value: String(o.bathrooms) });
  if (o.sqft_living != null) specs.push({ label: "Sqft living", value: String(o.sqft_living) });
  if (o.sqft_total != null) specs.push({ label: "Sqft total", value: String(o.sqft_total) });
  if (o.lot_cost != null) specs.push({ label: "Costo lote", value: formatUSD(o.lot_cost) });
  if (o.construction_cost != null) specs.push({ label: "Costo construcción", value: formatUSD(o.construction_cost) });
  if (o.price != null) specs.push({ label: "Precio", value: formatUSD(o.price) });
  if (o.deposit_required != null) specs.push({ label: "Depósito requerido", value: formatUSD(o.deposit_required) });
  if (o.expected_sale_price != null) specs.push({ label: "Precio estimado de venta", value: formatUSD(o.expected_sale_price) });
  if (o.rent_gross != null) specs.push({ label: "Alquiler bruto (mensual)", value: formatUSD(o.rent_gross), highlighted: true });
  if (o.rent_net != null) specs.push({ label: "Alquiler neto (mensual)", value: formatUSD(o.rent_net), highlighted: true });
  if (o.expected_roi != null) specs.push({ label: "ROI estimado", value: `${Number(o.expected_roi).toFixed(1)}%` });
  if (o.commission_pct != null) specs.push({ label: "Tu comisión", value: `${Number(o.commission_pct).toFixed(1)}%` });

  const photos = o.gallery && o.gallery.length > 0 ? o.gallery : o.image_url ? [o.image_url] : [];

  return (
    <div className="card-soft overflow-hidden">
      {photos.length > 0 && <Gallery photos={photos} title={o.title} />}
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
        {o.rent_net != null && (
          <div className="mt-3 rounded-md border border-primary/50 bg-secondary/40 px-3 py-2">
            <p className="text-xs font-semibold text-primary">
              El alquiler neto ya incluye:
            </p>
            <ul className="mt-1 list-disc pl-4 text-xs text-primary">
              <li>Property management</li>
              <li>Property tax</li>
              <li>Seguro</li>
            </ul>
          </div>
        )}
        {o.notes && <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">{o.notes}</p>}
        {o.proforma_url && (
          <a
            href={o.proforma_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Ver proforma
          </a>
        )}
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
