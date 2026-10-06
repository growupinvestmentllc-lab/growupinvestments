import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { formatUSD } from "@/lib/stages";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, FileText, MapPin, ShieldCheck } from "lucide-react";
import flamingoPhoto from "@/assets/621-flamingo-garantia.png.asset.json";

export const Route = createFileRoute("/prestamo")({
  head: () => ({
    meta: [
      { title: "Mi préstamo | GrowUp Investments" },
      { name: "description", content: "Detalle de tu préstamo con garantía en GrowUp Investments." },
      { property: "og:title", content: "Mi préstamo | GrowUp Investments" },
      { property: "og:description", content: "Detalle de tu préstamo con garantía en GrowUp Investments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoanPage,
});

type Loan = {
  id: string; lender: string; borrower: string; borrower_signer: string | null;
  principal: number; rate_pct: number; issue_date: string; lender_signed_date: string | null;
  maturity_date: string; interest_at_maturity: number; total_at_maturity: number; status: string;
  collateral_address: string | null; collateral_description: string | null; collateral_project_id: string | null;
  document_path: string | null; document_name: string | null; docusign_envelope_id: string | null;
};

const fmtDate = (d: string | null) => (d ? d.split("-").reverse().join("/") : "—");
const DAY = 86400000;
const toUtc = (d: string) => { const [y, m, dd] = d.split("-").map(Number); return Date.UTC(y, m - 1, dd); };

const TERMS = [
  ["Pago anticipado", "Permitido, total o parcial, sin penalidad, en cualquier momento antes del 26/12/2026."],
  ["Vencimiento anticipado", "El pago total es exigible si la propiedad 621 Flamingo Ave se vende, hipoteca o transfiere antes del 26/12/2026."],
  ["Incumplimiento", "Si el pagaré entra en default y pasa a cobranza, el prestatario paga todos los costos razonables de cobranza y honorarios de abogados."],
  ["Vigencia de términos", "Todas las obligaciones siguen vigentes mientras exista saldo impago."],
  ["Ley aplicable", "Estado de Florida."],
  ["Jurisdicción", "Tribunales del Estado de Florida o tribunales federales en Florida, condado de Orange."],
];

function LoanPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setNow(Date.now());
    (async () => {
      const { data: pr } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setName(pr?.full_name ?? user.email ?? "");
      const { data } = await (supabase as any).from("loans").select("*").eq("investor_id", user.id).limit(1);
      const l = (data?.[0] ?? null) as Loan | null;
      setLoan(l);
      if (l?.collateral_project_id) {
        const { data: p } = await supabase.from("projects").select("hero_image_url").eq("id", l.collateral_project_id).maybeSingle();
        setImage(l.collateral_project_id === "b525d962-242f-4d8b-b632-c0f061c67dd2" ? flamingoPhoto.url : p?.hero_image_url ?? null);
      }
      if (l?.document_path) {
        const { data: s } = await supabase.storage.from("project-documents").createSignedUrl(l.document_path, 3600);
        setDocUrl(s?.signedUrl ?? null);
      }
    })();
  }, [user]);

  if (!loan) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader name={name} />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center text-muted-foreground">Cargando…</main>
      </div>
    );
  }

  const start = toUtc(loan.issue_date);
  const end = toUtc(loan.maturity_date);
  const totalDays = Math.round((end - start) / DAY);
  const today = now ?? start;
  const elapsed = Math.min(Math.max(Math.floor((today - start) / DAY), 0), totalDays);
  const remaining = totalDays - elapsed;
  const pct = totalDays ? (elapsed / totalDays) * 100 : 0;
  const accrued = (Number(loan.principal) * (Number(loan.rate_pct) / 100) * elapsed) / 365;
  const mapAddress = loan.collateral_project_id === "b525d962-242f-4d8b-b632-c0f061c67dd2"
    ? "621 Flamingo Ave S, Lehigh Acres, FL 33974"
    : loan.collateral_address ?? "";
  const mapQ = encodeURIComponent(mapAddress);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name={name} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Hola, {name}</p>
            <h1 className="text-3xl font-bold text-foreground mt-1">Préstamo con garantía</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Prestatario: {loan.borrower}{loan.borrower_signer ? ` (firmado por ${loan.borrower_signer})` : ""}
            </p>
          </div>
          <span className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-status-construction text-status-construction-foreground">
            {loan.status}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Capital invertido", formatUSD(Number(loan.principal))],
            ["Tasa", `${loan.rate_pct}% anual`],
            ["Interés a cobrar", formatUSD(Number(loan.interest_at_maturity))],
            ["Total al vencimiento", formatUSD(Number(loan.total_at_maturity))],
          ].map(([l, v]) => (
            <div key={l} className="card-soft p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{v}</p>
            </div>
          ))}
        </div>

        <div className="card-soft p-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Emisión {fmtDate(loan.issue_date)}</span>
            <span>Vencimiento {fmtDate(loan.maturity_date)}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-foreground font-medium">{pct.toFixed(0)}% transcurrido · {remaining} días restantes</span>
            <span className="text-muted-foreground">
              Interés devengado a hoy: <span className="font-semibold text-primary">{formatUSD(Math.round(accrued * 100) / 100)}</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Pago total al vencimiento. Firmado por el prestamista el {fmtDate(loan.lender_signed_date)}.
          </p>
        </div>

        <section className="card-soft overflow-hidden border-2 border-primary/40">
          <div className="p-5 flex items-center gap-2 border-b border-border">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Garantía</h2>
          </div>
          <div className="grid md:grid-cols-3">
            {image && <img src={image} alt={loan.collateral_address ?? ""} className="w-full h-64 object-cover" />}
            <div className="p-5 space-y-2">
              <p className="font-semibold text-foreground flex items-start gap-1">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" /> {loan.collateral_address}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{loan.collateral_description}</p>
            </div>
            <iframe
              title="Mapa de la garantía"
              className="w-full h-64 border-0"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${mapQ}&z=17&output=embed`}
            />
          </div>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold text-foreground">Condiciones del Promissory Note</h2>
          <Accordion type="multiple" className="mt-2">
            {TERMS.map(([t, d]) => (
              <AccordionItem key={t} value={t}>
                <AccordionTrigger>{t}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{d}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="card-soft p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Documentos
              </h2>
              <p className="text-sm text-foreground mt-1">{loan.document_name}</p>
              {loan.docusign_envelope_id && (
                <p className="text-xs text-muted-foreground mt-1">Docusign Envelope ID: {loan.docusign_envelope_id}</p>
              )}
            </div>
            {docUrl && (
              <Button asChild>
                <a href={docUrl} download={loan.document_name ?? undefined} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" /> Descargar
                </a>
              </Button>
            )}
          </div>
          {docUrl && <iframe title="Vista previa del documento" src={docUrl} className="w-full h-[600px] rounded-md border border-border" />}
        </section>
      </main>
    </div>
  );
}
