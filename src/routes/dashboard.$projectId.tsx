import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { ALL_STAGES, formatUSD, STAGE_GROUPS } from "@/lib/stages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, MapPin, Bed, Bath, Car, Home, FileText, Download } from "lucide-react";
import { ConstructionProgressBar } from "@/components/ConstructionProgressBar";
import { GanttChart, ym, type PlannedVsActual } from "@/components/GanttChart";

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
  estimated_date?: string | null;
  estimated_start_date?: string | null;
  estimated_end_date?: string | null;
};
type Image = { id: string; image_url: string; caption: string | null };
type Investment = {
  id: string; project_id: string; owner_llc: string; percentage: number;
  total_deposited: number; total_pending: number;
};
type Ownership = { project_id: string; llc_name: string; stage: string };

const normalizeLlc = (value: string | null | undefined) =>
  value?.trim().replace(/\s+/g, " ").toUpperCase() ?? "";
const RAJAH_472_PROJECT_ID = "97dacb6f-4145-402a-941b-9fd4c4ff73ff";
const RAJAH_472_SELLERS = new Set(["ALMERIA LLC", "DAVI LLC"]);

function ProjectDetail() {
  const { projectId } = useParams({ from: "/dashboard/$projectId" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [myPayments, setMyPayments] = useState<{ id: string; paid_on: string; amount: number; description: string | null }[]>([]);

  const [myLlc, setMyLlc] = useState<string | null>(null);
  
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      else if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, images.length]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }, { data: i }, { data: prof }, { data: inv }, { data: ownershipRows }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase.from("project_stages").select("*").eq("project_id", projectId).order("stage_order"),
        supabase.from("portfolio_images").select("*").eq("project_id", projectId).order("sort_order"),
        supabase.from("profiles").select("llc_name").maybeSingle(),
        supabase.from("investments").select("*").eq("project_id", projectId),
        (supabase as any).from("property_ownerships").select("project_id,llc_name,stage").eq("project_id", projectId),
      ]);
      setProject(p as Project);
      setStages((s ?? []) as Stage[]);
      setInvestments((inv ?? []) as Investment[]);
      setOwnerships((ownershipRows ?? []) as Ownership[]);
      const rawImgs = (i ?? []) as Image[];

      // Bucket is private → generate signed URLs from stored path
      const signed = await Promise.all(rawImgs.map(async (img) => {
        const url = img.image_url || "";
        const marker = "/portfolio/";
        const idx = url.indexOf(marker);
        const path = idx >= 0 ? url.slice(idx + marker.length).split("?")[0] : url;
        try {
          const { data } = await supabase.storage.from("portfolio").createSignedUrl(path, 60 * 60);
          return { ...img, image_url: data?.signedUrl || img.image_url };
        } catch {
          return img;
        }
      }));
      setImages(signed);
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
  const is2446 = project?.id === "f6705699-6576-4ecf-99eb-8d54b41d382e";
  const is448Rajah = project?.id === "f17fd366-0e24-46ed-b5eb-84f669cbb219";
  const is7305SunNLake = project?.id === "8d9ed84c-7973-4dd5-9d28-2f09cd858379";
  const is2725Embers = project?.id === "22a81a71-0338-49da-9d2e-98c37c8a2c39";
  const is2812 = (project?.address?.toLowerCase() ?? "").includes("2812 nw 27th");
  const is14Trout = (project?.address?.toLowerCase() ?? "").includes("14 trout");
  const is5963Virtudes = (project?.address?.toLowerCase() ?? "").includes("5963") && (project?.address?.toLowerCase() ?? "").includes("virtudes");
  const simpleProgress = is2446 || is448Rajah || is7305SunNLake || is2725Embers || is2812 || is14Trout || is5963Virtudes;
  const is2434 = project?.id === "7c90af5f-39f4-428a-8cce-22db6ac3eadb";
  const is1405Cortez = project?.id === "ed024506-b782-401f-9fd6-6c6691430a0c";
  const is35SW = (project?.address?.toLowerCase() ?? "").includes("35 sw 19th");
  const is477 = (project?.address?.toLowerCase() ?? "").includes("477 rayford");
  const is127Cape = (project?.address?.toLowerCase() ?? "").includes("127 nw 24th");
  const is127 =
    (project?.address?.toLowerCase() ?? "").includes("127 nw 24th") ||
    (project?.address?.toLowerCase() ?? "").includes("35 sw 19th");



  const steamwall2446 = 5006;
  const steamwall2434 = 5012;
  const constructionBase = Number(project?.construction_cost) || 0;
  const steamwall = is2446 ? steamwall2446 : is2434 ? steamwall2434 : is2812 ? 5400 : 0;
  const constructionTotal = constructionBase + steamwall;
  // Solo etiqueta (no afecta totales ni pendiente)
  const steamwallLabel = steamwall;
  const constructionLabelTotal = constructionBase + steamwallLabel;
  const normalizedAddress = project?.address?.toLowerCase() ?? "";
  const is472Rajah = normalizedAddress.includes("472") && normalizedAddress.includes("rajah");
  const is568Cypress = normalizedAddress.includes("568") && normalizedAddress.includes("cypress");
  const is365Progress = normalizedAddress.includes("365") && normalizedAddress.includes("progress");
  const is621Flamingo = normalizedAddress.includes("621") && normalizedAddress.includes("flamingo");
  const totalCost =
    constructionTotal + (Number(project?.lot_cost) || 0) + (is621Flamingo ? 3500 : 0) || Number(project?.total_cost) || 0;
  const deposited = Number(project?.amount_deposited) || 0;
  const pending = totalCost - deposited;
  const overDeposited = deposited > totalCost && totalCost > 0;
  const activeStageLabel =

    is365Progress
      ? "Colocando trusses"
      : activeStage?.stage_group?.startsWith("CO")
        ? activeStage.stage_group
        : progress >= 100
          ? "Finalizada"
          : activeStage?.stage_name ?? "Finalizada";
  const is2217Embers = projectId === "d7e72435-c615-4524-a338-b936e6e10c58" ||
    project?.id === "d7e72435-c615-4524-a338-b936e6e10c58" ||
    (normalizedAddress.includes("2217") && normalizedAddress.includes("embers"));

  // Investment record of the signed-in owner (per-owner financials)
  const myInvestment = useMemo(() => {
    if (!investments.length) return null;
    if (myLlc) {
      const match = investments.find((i) => i.owner_llc.trim() === myLlc.trim());
      if (match) return match;
    }
    return investments.length === 1 ? investments[0] : null;
  }, [investments, myLlc]);

  // Determine current investor share (%)
  const myPct = useMemo(() => {
    if (myInvestment) return Number(myInvestment.percentage) || null;
    if (!project) return null;
    if (myLlc && project.owner_llc && project.owner_llc.trim() === myLlc.trim()) {
      return Number(project.owner_pct_1) || null;
    }
    if (myLlc && project.owner_llc_2 && project.owner_llc_2.trim() === myLlc.trim()) {
      return Number(project.owner_pct_2) || null;
    }
    return null;
  }, [project, myLlc, myInvestment]);
  const hasMultipleOwners = !!(project?.owner_llc_2 && project.owner_llc_2.trim());
  const myOwnerships = ownerships.filter(
    (ownership) => normalizeLlc(ownership.llc_name) === normalizeLlc(myLlc),
  );
  const isRajahSeller =
    project?.id === RAJAH_472_PROJECT_ID && RAJAH_472_SELLERS.has(normalizeLlc(myLlc));
  const displayStatus = isRajahSeller || myOwnerships.some((ownership) => ownership.stage.trim().toLowerCase() === "venta")
    ? "VENDIDA"
    : project?.status;

  useEffect(() => {
    if (!myInvestment) { setMyPayments([]); return; }
    (async () => {
      const { data } = await supabase
        .from("investment_payments")
        .select("id,paid_on,amount,description")
        .eq("investment_id", myInvestment.id)
        .order("paid_on", { ascending: false });
      setMyPayments(data ?? []);
    })();
  }, [myInvestment]);


  if (!project) return <div className="min-h-screen bg-background"><AppHeader /><div className="p-12 text-center text-muted-foreground">Cargando...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver a proyectos
        </Link>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl mb-6 bg-muted">
          <img
            src={project.hero_image_url || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80"}
            alt={project.address}
            className="h-full w-full object-cover"
          />
          {(
            <div className="absolute inset-0 z-40 pointer-events-none">
              <div
                className="absolute top-4 right-4 inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase shadow-2xl ring-2 ring-white"
                style={{
                  background: "#000000",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  opacity: 1,
                  visibility: "visible",
                }}
              >
                ESTADO ACTUAL
              </div>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{project.address}</h1>
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" /> Florida, USA</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">{displayStatus}</span>
            {myPct != null && (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-100 text-orange-800">
                Tu participación: {myPct}%
              </span>
            )}
          </div>
        </div>

        {(() => null)()}
        
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-muted/60 flex-wrap h-auto">
            <TabsTrigger value="overview">Información</TabsTrigger>
            {!is127 && <TabsTrigger value="portfolio">Fotos de obra</TabsTrigger>}
            <TabsTrigger value="docs">Documentación</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {is127 ? null : simpleProgress ? (
              <div className="card-soft p-6 flex flex-col items-center">
                <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avance de Obra</h3>
                <div className="mt-2 flex flex-row items-center justify-center gap-6">
                  <ProgressCircle value={progress} />
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-muted-foreground">Etapa actual</p>
                    <p className="text-base font-semibold text-foreground">{activeStageLabel}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="card-soft p-6 lg:col-span-1 flex flex-col items-center justify-center">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avance de Obra</h3>
                  <ProgressCircle value={progress} />
                  <p className="mt-3 text-sm text-muted-foreground text-center">Etapa actual</p>
                  <p className="text-base font-semibold text-foreground text-center">{activeStageLabel}</p>
                </div>
                <div className="card-soft p-6 lg:col-span-2">
                  <GanttChart
                    stages={stages}
                    mode={
                      normalizedAddress.includes("710") && normalizedAddress.includes("jaguar")
                        ? "actual"
                        : "both"
                    }
                    subtitle={
                      normalizedAddress.includes("710") && normalizedAddress.includes("jaguar")
                        ? "Tiempos reales"
                        : undefined
                    }
                    plannedVsActual={
                      normalizedAddress.includes("621") && normalizedAddress.includes("flamingo")
                        ? ({
                            "Hard Construction 1": { planned: { start: ym(2025, 11), end: ym(2026, 0) }, actual: { start: ym(2026, 2), end: ym(2026, 3) } },
                            "Hard Construction 2": { planned: { start: ym(2026, 1), end: ym(2026, 2) }, actual: { start: ym(2026, 4), end: ym(2026, 5) } },
                            "Hard Construction 3": { planned: { start: ym(2026, 4), end: ym(2026, 5) }, actual: { start: ym(2026, 6), end: ym(2026, 7) } },
                            "Hard Construction 4": { planned: { start: ym(2026, 5), end: ym(2026, 6) }, actual: { start: ym(2026, 7), end: ym(2026, 8) } },
                            "CO (Certificado de Ocupación)": { planned: { start: ym(2026, 6), end: ym(2026, 6) }, actual: { start: ym(2026, 9), end: ym(2026, 9) } },
                          } satisfies PlannedVsActual)
                        : normalizedAddress.includes("710") && normalizedAddress.includes("jaguar")
                        ? ({
                            "Hard Construction 1": { actual: { start: ym(2026, 3), end: ym(2026, 4) } },
                            "Hard Construction 2": { actual: { start: ym(2026, 5), end: ym(2026, 6) } },
                            "Hard Construction 3": { actual: { start: ym(2026, 7), end: ym(2026, 9) } },
                            "Hard Construction 4": { actual: { start: ym(2026, 10), end: ym(2026, 10) } },
                          } satisfies PlannedVsActual)
                        : undefined
                    }
                  />
                </div>
              </div>
            )}

            {!is127 && <ConstructionProgressBar stages={stages} />}

            {!is127 && !is14Trout && !is5963Virtudes && !is448Rajah && (
            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard
                label={hasMultipleOwners && myInvestment && !is621Flamingo ? "Total depositado (tu inversión)" : "Total depositado"}
                value={formatUSD(
                  is621Flamingo
                    ? deposited
                    : myInvestment
                      ? Number(myInvestment.total_deposited)
                      : deposited,
                )}
                accent="primary"
                sub={
                  hasMultipleOwners && myPct != null && !is621Flamingo
                    ? `Tu participación ${myPct}% = ${formatUSD(
                        is621Flamingo
                          ? (Number(myInvestment?.total_deposited) || 0)
                          : (Number(myInvestment?.total_deposited) || 0),
                      )}`
                    : undefined
                }
              />
              <StatCard
                label={hasMultipleOwners && myInvestment && !is621Flamingo ? "Total pendiente (tu inversión)" : "Total pendiente"}
                value={formatUSD(
                  is621Flamingo
                    ? 25000
                    : myInvestment
                      ? Number(myInvestment.total_pending)
                      : pending,
                )}
                accent="muted"
                sub={
                  hasMultipleOwners && myPct != null && !is621Flamingo
                    ? `Tu participación ${myPct}% = ${formatUSD(
                        is621Flamingo
                          ? (Number(myInvestment?.total_pending) || 0)
                          : (Number(myInvestment?.total_pending) || 0),
                      )}`
                    : undefined
                }
              />
            </div>
            )}

            {myPayments.length > 0 && (
              <div className="card-soft p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pagos realizados</h3>
                <div className="space-y-1">
                  {myPayments.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between text-sm rounded-md bg-muted/50 px-3 py-2">
                      <span className="text-muted-foreground">
                        {pay.paid_on}{pay.description ? ` · ${pay.description}` : ""}
                      </span>
                      <span className="font-semibold text-foreground">{formatUSD(Number(pay.amount))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {overDeposited && (
              <div role="alert" className="rounded-md border border-amber-400 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
                Atención: el total depositado ({formatUSD(deposited)}) supera el costo total ({formatUSD(totalCost)}).
              </div>
            )}

            {!is14Trout && !is5963Virtudes && !is448Rajah && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Costos del proyecto</h3>
              {is35SW || is127Cape ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label="Costo lote" value={formatUSD(project.lot_cost)} />
                  <StatCard label={is127Cape ? "Precio de venta" : "Precio de venta (estimado)"} value={formatUSD(project.expected_sale_price)} accent="muted" />
                </div>
              ) : is127 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label="Lote + Permiso" value={formatUSD(project.lot_cost)} />
                  <StatCard label="Precio de venta" value={formatUSD(project.expected_sale_price)} accent="muted" />
                </div>
              ) : (
              <div className={`grid grid-cols-1 gap-4 ${is621Flamingo || is2812 ? "sm:grid-cols-[2fr_1fr_1fr_1fr]" : "sm:grid-cols-[2fr_1fr_1fr]"}`}>
                <StatCard
                  label="Costo de construcción Draw 1 a Draw 6 incluido"
                  value={
                    steamwallLabel > 0 && !is2812
                      ? `${formatUSD(constructionBase)} + Steamwall (${formatUSD(steamwallLabel)}) = ${formatUSD(constructionLabelTotal)}`
                      : formatUSD(project.construction_cost)
                  }
                  sub={hasMultipleOwners && myPct != null
                    ? `Tu participación ${myPct}% = ${formatUSD(((steamwall > 0 && !is2812 ? constructionTotal : Number(project.construction_cost)) || 0) * (myPct / 100))}`
                    : undefined}
                  className="min-h-[140px] py-6"
                />
                <StatCard
                  label="Lote"
                  value={formatUSD(project.lot_cost)}
                  sub={hasMultipleOwners && myPct != null
                    ? `Tu participación ${myPct}% = ${formatUSD((Number(project.lot_cost) || 0) * (myPct / 100))}`
                    : undefined}
                />
                {is2812 && (
                  <StatCard
                    label="Gastos de contingencias"
                    value={formatUSD(steamwall)}
                    sub={hasMultipleOwners && myPct != null
                      ? `Steamwall · Tu participación ${myPct}% = ${formatUSD(steamwall * (myPct / 100))}`
                      : "Steamwall"}
                  />
                )}
                {is621Flamingo && (
                  <StatCard
                    label="Fee due diligence"
                    value={formatUSD(2500)}
                  >
                    <p className="text-sm font-semibold mt-3 text-foreground">Contingency</p>
                    <p className="text-lg font-bold text-foreground">{formatUSD(1000)}</p>
                  </StatCard>
                )}
                <StatCard
                  label="Costo Total"
                  value={formatUSD(totalCost)}
                  accent="muted"
                  sub={hasMultipleOwners && myPct != null
                    ? `Tu participación ${myPct}% = ${formatUSD(totalCost * (myPct / 100))}`
                    : undefined}
                />
              </div>
              )}
            </div>
            )}

            {!is2217Embers && !is14Trout && !is5963Virtudes && !is448Rajah && (
              <DrawSchedule stages={stages} lotCost={Number(project.lot_cost || 0)} myPct={myPct} hasMultipleOwners={hasMultipleOwners} projectId={project.id} maxDraw={is127 ? 1 : undefined} is365Progress={is365Progress} is621Flamingo={is621Flamingo} />
            )}

            <div className="card-soft p-6 bg-primary text-primary-foreground">
              <h3 className="font-semibold mb-4">{(project.address?.toLowerCase().includes("7305") || (project.address?.toLowerCase().includes("2725") && project.address?.toLowerCase().includes("ember"))) ? "Rentabilidad final" : is127Cape ? "Resultado de la venta" : "Rentabilidad esperada"}</h3>
              <div className={`grid sm:grid-cols-2 gap-4 text-sm ${is127Cape ? "lg:grid-cols-5" : is127 ? "lg:grid-cols-3" : "lg:grid-cols-5"}`}>
                <Stat dark label={project.address?.toLowerCase().includes("7305") ? "Precio de venta" : is35SW || is477 ? "Precio de venta" : is127 ? "Precio de venta" : "Precio est. de venta"} value={formatUSD(project.expected_sale_price)} />
                {is127Cape && (
                  <>
                    <Stat dark label="Closing costs (7,83%)" value={`(${formatUSD(4854.58)})`} />
                    <Stat dark label="Neto recibido" value={formatUSD(57145.42)} />
                  </>
                )}
                {!is127 && !is14Trout && !is5963Virtudes && !is448Rajah && (
                  <>
                    <Stat dark label={project.address?.toLowerCase().includes("7305") ? "Alquiler (mensual)" : (project.address?.toLowerCase().includes("2725") && project.address?.toLowerCase().includes("ember")) ? "Alquiler mensual neto" : "Alquiler est. (mensual)"} value={formatUSD(project.expected_rent_price ?? 0)} />
                    <Stat dark label="Costo construcción" value={formatUSD(is2446 || is2434 ? constructionTotal : project.construction_cost)} />
                  </>
                )}
                {!is14Trout && !is5963Virtudes && !is448Rajah && (
                  <Stat
                    dark
                    label={
                      is127Cape
                        ? "Costo lote"
                        : project.address?.toLowerCase().includes("127 nw 24th")
                          ? "Costo lote + permiso"
                          : "Costo lote"
                    }
                    value={formatUSD(project.lot_cost)}
                  />
                )}
                {is127Cape ? (
                  <Stat dark label="ROI estimado" value="14.29%" />
                ) : is35SW ? (
                  <Stat dark label="ROI estimado" value="17.60%" />
                ) : is127 ? (
                  <Stat dark label="ROI estimado" value={`${project.lot_cost ? (((Number(project.expected_sale_price || 0) - Number(project.lot_cost)) / Number(project.lot_cost)) * 100).toFixed(1) : 0}%`} />
                ) : project.address?.toLowerCase().includes("2725") && project.address?.toLowerCase().includes("ember") ? (
                  <Stat dark label="NOI" value="6.34%" />
                ) : project.address?.toLowerCase().includes("710") ? (
                  <Stat dark label="ROI estimado" value="11%" />
                ) : project.address?.toLowerCase().includes("7305") ? (
                  <Stat dark label="ROI" value="8%" />
                ) : is2446 ? (
                  <Stat dark label="ROI estimado" value={`${project.expected_sale_price ? (((project.expected_sale_price - (constructionTotal + (project.lot_cost || 0))) / project.expected_sale_price) * 100).toFixed(1) : 0}%`} />
                ) : is2812 ? (
                  <Stat dark label="ROI estimado" value="8.77%" />
                ) : is477 ? (
                  <Stat dark label="ROI estimado" value="6.15%" />
                ) : is365Progress ? (
                  <Stat dark label="ROI estimado" value="8.77%" />
                ) : is621Flamingo ? (
                  <Stat dark label="ROI estimado" value="9.51%" />
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

          {/* PORTFOLIO */}
          <TabsContent value="portfolio" className="mt-6 space-y-6">
            {(() => {
              const isFinal = (c: string | null) => (c ?? "").toUpperCase().includes("PROYECTO FINALIZADO");
              const isReal = (c: string | null) => (c ?? "").toUpperCase().includes("OBRA REAL");
              const finales = images.filter((i) => isFinal(i.caption));
              const reales = images.filter((i) => isReal(i.caption));
              const clean = (c: string | null) =>
                (c ?? "").replace(/^\s*(PROYECTO FINALIZADO|OBRA REAL)\s*[—-]?\s*/i, "").trim();

              const Grid = ({ items }: { items: Image[] }) => (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((img) => (
                    <div key={img.id} className="card-soft overflow-hidden">
                      <img
                        src={img.image_url}
                        alt={img.caption ?? "Portafolio"}
                        className="w-full h-56 object-cover cursor-zoom-in"
                        onClick={() => setLightboxIdx(images.findIndex((x) => x.id === img.id))}
                      />
                      {clean(img.caption) && (
                        <p className="p-3 text-xs text-muted-foreground">{clean(img.caption)}</p>
                      )}
                    </div>
                  ))}
                </div>
              );

              if (images.length === 0)
                return <p className="text-muted-foreground text-center py-12">Sin fotos aún.</p>;

              if (finales.length === 0 && reales.length === 0) return <Grid items={images} />;

              return (
                <div className="space-y-8">
                  {finales.length > 0 && (
                    <section className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">Proyección final</h3>
                      <Grid items={finales} />
                    </section>
                  )}
                  {reales.length > 0 && (
                    <section className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">Obra real</h3>
                      <Grid items={reales} />
                    </section>
                  )}
                </div>
              );
            })()}
            <div className="card-soft p-6">
              <h3 className="font-semibold text-foreground mb-4">Especificaciones</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <Spec icon={<Home className="h-4 w-4" />} label="Modelo" value={project.model_name ?? "—"} />
                <Spec label="Sqft total" value={project.sqft_total ? `${project.sqft_total.toLocaleString()} sqft` : "—"} />
                <Spec label="Sqft living" value={project.sqft_living ? `${project.sqft_living.toLocaleString()} sqft` : "—"} />
                <Spec icon={<Bed className="h-4 w-4" />} label="Habitaciones" value={String(project.bedrooms ?? "—")} />
                <Spec icon={<Bath className="h-4 w-4" />} label="Baños" value={String(project.bathrooms ?? "—")} />
                <Spec icon={<Car className="h-4 w-4" />} label="Garage" value={project.garage ? "SI" : "No"} />
                <Spec label="Constructor" value="Grow Up Investment" />
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
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <img
            src={images[lightboxIdx].image_url}
            alt=""
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Anterior"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white select-none"
            style={{ fontSize: "6rem", lineHeight: 1, fontFamily: "serif" }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white select-none"
            style={{ fontSize: "6rem", lineHeight: 1, fontFamily: "serif" }}
          >
            ›
          </button>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
            className="absolute top-4 right-4 text-white/90 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function DrawSchedule({
  stages,
  lotCost = 0,
  myPct,
  hasMultipleOwners,
  projectId,
  maxDraw,
  is365Progress,
  is621Flamingo,
}: {
  stages: Stage[];
  lotCost?: number;
  myPct?: number | null;
  hasMultipleOwners?: boolean;
  projectId?: string;
  maxDraw?: number;
  is365Progress?: boolean;
  is621Flamingo?: boolean;
}) {
  const DRAW_GROUPS = [
    "Soft Construction",
    "Hard Construction 1",
    "Hard Construction 2",
    "Hard Construction 3",
    "Hard Construction 4",
    "CO (Certificado de Ocupación)",
  ];
  const LABELS: Record<string, string> = {
    "CO (Certificado de Ocupación)": "C.O",
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
  let list = [
    { num: 0, group: "Compra Lote", amount: lotCost, completed: true, active: false },
    ...groupRows,
  ];
  if (typeof maxDraw === "number") list = list.filter((d) => d.num <= maxDraw);
  // 365 Progress: draws 0 a 3 ya abonados
  if (is365Progress) list = list.map((d) => (d.num <= 3 ? { ...d, completed: true, active: false } : d));
  if (is621Flamingo) list = list.map((d) => (d.num === 5 ? { ...d, completed: false, active: false } : d));
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
                  <p className="text-xs text-muted-foreground">
                    {formatUSD(d.amount)}
                    {hasMultipleOwners && myPct != null && (
                      <span className="text-foreground ml-1">· Participación {myPct}% = {formatUSD(d.amount * (myPct / 100))}</span>
                    )}
                  </p>
                  {d.num === 3 && projectId === "f6705699-6576-4ecf-99eb-8d54b41d382e" && (
                    <p className="text-xs text-foreground mt-0.5">
                      en esta etapa se abonó el steamwall ({formatUSD(61200)} Draw 3 + {formatUSD(5006)} Steamwall)
                    </p>
                  )}
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

function StatCard({ label, value, accent, sub, className, children }: { label: string; value: string; accent?: "primary" | "muted"; sub?: string; className?: string; children?: React.ReactNode }) {
  const cls = accent === "primary" ? "bg-primary text-primary-foreground" : accent === "muted" ? "bg-secondary/40 text-foreground" : "bg-card text-foreground";
  return (
    <div className={`card-soft p-5 ${cls} ${className || ""}`}>
      <p className={`text-xs uppercase tracking-wider ${accent === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {sub && (
        <p className={`text-xs mt-2 ${accent === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{sub}</p>
      )}
      {children}
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

  // 127 NW 24th Pl — venta de lote: solo el registro de la venta
  if (projectId === "2f2c8509-18d0-489c-b5bb-758120a21e3b") {
    const uploadedDocs = docs.filter((d) => !!d.file_path);
    return (
      <div className="card-soft p-6">
        <h3 className="font-semibold text-foreground mb-4">Documentos</h3>
        {uploadedDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin documentos disponibles.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {uploadedDocs.map((d) => {
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
                    <p className="text-sm font-medium text-foreground truncate">Registro de la Venta</p>
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
  }

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
