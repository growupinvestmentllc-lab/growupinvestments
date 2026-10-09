import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contributionPhoto, type Contribution } from "@/lib/capital-contributions";
import { formatUSD } from "@/lib/stages";

export function CapitalProjectCard({ contribution: c, progress }: { contribution: Contribution; progress?: number }) {
  return (
    <div className="card-soft overflow-hidden">
      <img src={contributionPhoto} alt={c.property_address} className="aspect-[16/9] w-full object-cover" />
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{c.project_status}</span>
          {c.ownership_pct != null && <span className="text-xs font-medium px-2 py-1 rounded-full bg-participation text-participation-foreground">Tu participación: {Number(c.ownership_pct).toLocaleString("es-AR")}%</span>}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">{c.property_address}</h3>
        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Aporte de capital</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {[["Capital aportado", formatUSD(c.capital)], ["Rentabilidad", `${c.rate_pct}%`], ["Ganancia", formatUSD(c.profit)], ["Total a cobrar", formatUSD(c.total_to_collect)]].map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold text-foreground">{value}</p></div>)}
        </div>
        {progress != null && <div className="mt-5"><div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Avance de obra</span><span className="font-semibold text-foreground">{progress}%</span></div><progress aria-label="Avance de obra" value={progress} max={100} className="w-full h-2 accent-primary" /></div>}
        <Button asChild className="mt-5 w-full"><Link to="/aporte">Ver información <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
    </div>
  );
}