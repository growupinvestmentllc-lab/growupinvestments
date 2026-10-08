import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { formatUSD } from "@/lib/stages";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, FileText, MapPin } from "lucide-react";
import flamingoPhoto from "@/assets/621-flamingo-garantia.png.asset.json";
import lot329 from "@/assets/329-ne-13th-hero.png.asset.json";
import proforma329 from "@/assets/proforma-329-ponte-vedra.pdf.asset.json";

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
  sale_price: number | null; total_cost: number | null; project_profit: number | null; project_roi: number | null;
  capital: number; rate_pct: number; profit: number; total_to_collect: number;
  deposits: Deposit[]; documents: Doc[];
};

const fmtDate = (d: string | null) => (d ? d.split("-").reverse().join("/") : "Pendiente");

function DocCard({ name, url }: { name: string; url: string | null }) {
  return (
    <div className="card-soft p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {name}</p>
        {url ? (
          <Button asChild size="sm"><a href={url} download target="_blank" rel="noreferrer"><Download className="h-4 w-4" /> Descargar</a></Button>
        ) : (
          <span className="text-xs text-muted-foreground">Pendiente de carga</span>
        )}
      </div>
      {url && <iframe title={name} src={url} className="w-full h-80 rounded-md border border-border" />}
    </div>
  );
}

function AportePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [c, setC] = useState<Contribution | null>(null);
  const [name, setName] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: pr } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setName(pr?.full_name ?? user.email ?? "");
      const { data } = await (supabase as any).from("capital_contributions").select("*").eq("investor_id", user.id).limit(1);
      const row = (data?.[0] ?? null) as Contribution | null;
      setC(row);
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name={name} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Hola, {name}</p>
          <h1 className="text-3xl font-bold text-foreground mt-1">{c.title}</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Capital aportado", formatUSD(Number(c.capital))],
            ["Rentabilidad", `${c.rate_pct}%`],
            ["Ganancia", formatUSD(Number(c.profit))],
            ["Total a cobrar", formatUSD(Number(c.total_to_collect))],
          ].map(([l, v]) => (
            <div key={l} className="card-soft p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{v}</p>
            </div>
          ))}
        </div>

        <section className="card-soft overflow-hidden grid md:grid-cols-2">
          <img src={flamingoPhoto.url} alt={c.property_address} className="w-full h-72 object-cover" />
          <div className="p-6 space-y-4">
            <span className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{c.project_status}</span>
            <p className="font-semibold text-lg text-foreground flex items-start gap-1"><MapPin className="h-5 w-5 mt-0.5 text-primary" /> {c.property_address}</p>
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
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Avance de obra</span><span className="font-semibold text-foreground">100%</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-full" /></div>
            </div>
          </div>
        </section>

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
                    <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(d.date)}</td>
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">{formatUSD(Number(d.amount))}</td>
                    <td className="py-2 text-muted-foreground">{d.detail ?? "Pendiente"}</td>
                  </tr>
                ))}
                <tr><td /><td className="py-2 font-semibold">Total depositado</td><td className="py-2 font-bold text-primary">{formatUSD(totalDep)}</td><td /></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Documentos</h2>
          {c.documents.map((d) => <DocCard key={d.name} name={d.name} url={urls[d.name] ?? null} />)}
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-2xl font-bold text-foreground">Nueva oportunidad – 329</h2>
          <div className="card-soft overflow-hidden grid md:grid-cols-2">
            <img src={lot329.url} alt="Lote 329 NE 13th St" className="w-full h-72 object-cover" />
            <div className="p-6 flex flex-col gap-4">
              <p className="font-semibold text-foreground flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> 329 NE 13th St</p>
              <p className="text-sm text-muted-foreground">Lote + modelo de casa ya permisada y aprobada, lista para comenzar la construcción.</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline"><a href={proforma329.url} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /> Ver proforma</a></Button>
                <Button asChild variant="outline"><a href={proforma329.url} download><Download className="h-4 w-4" /> Descargar</a></Button>
              </div>
              <div className="flex-1" />
              <Button asChild><Link to="/contact" search={{ opportunity_name: "Nueva oportunidad – 329" } as any}>Me interesa <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </div>
          <iframe title="Proforma 329" src={proforma329.url} className="w-full h-[500px] rounded-md border border-border" />
        </section>
      </main>
    </div>
  );
}
