import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Images, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatUSD } from "@/lib/stages";
import { groupedInvestorOpportunities, type InvestorOffering } from "@/lib/investor-opportunities";

function OpportunityPhoto({ offering: o }: { offering: InvestorOffering }) {
  const photos = o.gallery?.length ? o.gallery : o.image_url ? [o.image_url] : [];
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  if (!photos.length) return null;
  const move = (direction: number) => setActive((i) => (i + direction + photos.length) % photos.length);
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
      <Button variant="ghost" onClick={() => setOpen(true)} aria-label={`Ver fotos de ${o.title}`} className="h-full w-full rounded-none p-0">
        <img src={photos[active]} alt={o.title} loading="lazy" className={`h-full w-full ${o.title.includes("2812") ? "object-contain" : "object-cover"}`} />
      </Button>
      {o.kind === "rbi" && <span className="pointer-events-none absolute -left-10 top-7 w-44 -rotate-45 bg-destructive py-1 text-center text-xs font-bold text-destructive-foreground">ALQUILADA</span>}
      {photos.length > 1 && <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-background/90 p-1 text-foreground">
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Foto anterior de ${o.title}`} onClick={() => move(-1)}><ChevronLeft /></Button>
        <span className="flex items-center gap-1 text-xs"><Images className="h-3 w-3" />{active + 1}/{photos.length}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Foto siguiente de ${o.title}`} onClick={() => move(1)}><ChevronRight /></Button>
      </div>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogTitle>{o.title}</DialogTitle>
          <img src={photos[active]} alt={o.title} className="max-h-[70vh] w-full object-contain" />
          {photos.length > 1 && <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" aria-label="Foto anterior" onClick={() => move(-1)}><ChevronLeft /></Button>
            <span className="text-sm text-muted-foreground">{active + 1} / {photos.length}</span>
            <Button variant="outline" size="icon" aria-label="Foto siguiente" onClick={() => move(1)}><ChevronRight /></Button>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OpportunityCard({ offering: o }: { offering: InvestorOffering }) {
  const specs: [string, string][] = [];
  const money = (value: string | number) => formatUSD(Number(value));
  const area = (value: number) => `${value.toLocaleString("es-AR")} sqft (${Math.round(value / 10.7639)} m²)`;
  if (o.model) specs.push(["Modelo", o.model]);
  if (o.bedrooms != null) specs.push(["Dormitorios", o.model?.includes("Ponte Vedra") ? `${o.bedrooms} + 1 studio` : String(o.bedrooms)]);
  if (o.bathrooms != null) specs.push(["Baños", String(o.bathrooms)]);
  if (o.sqft_living != null) specs.push([o.title === "14 Trout Way" ? "Superficie" : "Superficie cerrada", area(Number(o.sqft_living))]);
  if (o.sqft_total != null && o.title !== "14 Trout Way") specs.push(["Superficie total", area(Number(o.sqft_total))]);
  if (o.lot_cost != null) specs.push(["Costo lote", money(o.lot_cost)]);
  if (o.construction_cost != null) specs.push(["Costo construcción", money(o.construction_cost)]);
  if (o.deposit_required != null) specs.push(["Depósito requerido", money(o.deposit_required)]);
  if (o.expected_sale_price != null) specs.push(["Precio estimado de venta", money(o.expected_sale_price)]);
  if (o.expected_roi != null) specs.push(["ROI estimado", `${o.expected_roi}%`]);
  return (
    <article className="card-soft flex flex-col overflow-hidden" aria-label={o.title}>
      <OpportunityPhoto offering={o} />
      <div className="flex flex-1 flex-col p-5">
        <h4 className="text-lg font-semibold text-foreground">{o.title}</h4>
        {o.location && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{o.location}</p>}
        {o.price != null && <div className="mt-4"><p className="text-xs text-muted-foreground">Precio</p><p className="text-2xl font-bold text-primary">{money(o.price)}</p></div>}
        {specs.length > 0 && <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-border pt-4">
          {specs.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[10px] uppercase text-muted-foreground">{label}</dt><dd className="mt-0.5 break-words text-sm font-semibold text-foreground">{value}</dd></div>)}
        </dl>}
        {o.rent_gross != null && <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div><p className="text-xs text-muted-foreground">Alquiler bruto mensual</p><p className="text-lg font-bold text-primary">{money(o.rent_gross)}</p></div>
          {o.rent_net != null && <div><p className="text-xs text-muted-foreground">Alquiler neto mensual</p><p className="text-lg font-bold text-primary">{money(o.rent_net)}</p></div>}
        </div>}
        {o.rent_net != null && <p className="mt-3 border-l-2 border-primary pl-3 text-xs text-primary">El alquiler neto incluye property management, property tax y seguro.</p>}
        {o.progress_pct != null && <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Avance de la casa</span><span>{Number(o.progress_pct)}%</span></div><progress value={Number(o.progress_pct)} max={100} aria-label={`Avance de ${o.title}`} className="h-2 w-full accent-primary" /></div>}
        {o.kind === "lote" && <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Fondeado</span><span>0%</span></div><progress value={0} max={100} aria-label={`Fondeado de ${o.title}`} className="h-2 w-full accent-primary" /></div>}
        {o.notes && o.kind !== "lote" && <p className="mt-4 whitespace-pre-line text-xs text-muted-foreground">{o.notes}</p>}
        <div className="flex-1" />
        <Button asChild className="mt-5 w-full"><Link to="/contact" search={{ opportunity_name: o.title }}>Quiero saber más <ArrowRight /></Link></Button>
      </div>
    </article>
  );
}

export function InvestorOpportunities({ userId }: { userId: string | undefined }) {
  const groups = groupedInvestorOpportunities(userId);
  return <section className="mt-16" aria-label="Oportunidades">
    <h2 className="text-2xl font-bold text-foreground">Oportunidades</h2>
    {groups.map((group) => <section key={group.title} className="mt-10" aria-label={group.title}>
      <h3 className="border-l-4 border-primary pl-3 text-lg font-bold uppercase text-foreground">{group.title}</h3>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{group.items.map((o) => <OpportunityCard key={o.id} offering={o} />)}</div>
    </section>)}
  </section>;
}