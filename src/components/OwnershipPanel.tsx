import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/stages";
import { Users } from "lucide-react";

const db = supabase as any;

export type Ownership = {
  id: string;
  project_id: string;
  llc_name: string;
  percentage: number;
  stage: string;
  from_date: string | null;
  to_date: string | null;
  exit_date: string | null;
  exit_price: number | null;
  exit_cost_base: number | null;
  notes: string | null;
};

export const STAGE_LABELS: Record<string, string> = {
  construccion: "Construcción",
  alquiler: "Alquiler",
  venta: "Vendida",
};

/** Carga todas las participaciones visibles y la LLC del usuario actual. */
export function useOwnerships() {
  const [rows, setRows] = useState<Ownership[]>([]);
  const [myLlc, setMyLlc] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await db.from("property_ownerships").select("*").order("stage").order("llc_name");
      setRows(data ?? []);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      const { data: prof } = await db.from("profiles").select("llc_name").eq("id", auth.user.id).single();
      setMyLlc(prof?.llc_name ?? null);
    })();
  }, []);

  return { rows, myLlc };
}

function fmtDate(d?: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function OwnershipPanel({
  ownerships,
  myLlc,
  stage,
  amounts,
}: {
  ownerships: Ownership[];
  myLlc: string | null;
  /** Etapa a destacar como vigente (construccion | alquiler | venta) */
  stage: string;
  /** Totales de la casa; se muestra también la parte proporcional del usuario */
  amounts?: { label: string; value: number }[];
}) {
  if (ownerships.length === 0) return null;

  const current = ownerships.filter((o) => o.stage === stage && !o.to_date);
  const history = ownerships.filter((o) => !current.includes(o));
  const mine = current.find((o) => myLlc && o.llc_name.toUpperCase() === myLlc.toUpperCase());
  const pct = mine ? Number(mine.percentage) : 0;

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5" /> Titularidad · {STAGE_LABELS[stage] ?? stage}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {current.map((o) => (
          <span
            key={o.id}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              mine && o.id === mine.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
            }`}
          >
            {o.llc_name} · {Number(o.percentage)}%
          </span>
        ))}
        {current.length === 0 && <span className="text-xs text-muted-foreground">Sin titularidad vigente cargada.</span>}
      </div>

      {mine && amounts && amounts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Tu parte ({pct}% · {mine.llc_name})
          </p>
          <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {amounts.map((a) => (
              <div key={a.label} className="rounded-lg bg-card border border-border px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">{a.label}</p>
                <p className="text-xs text-muted-foreground mt-1">Total {formatUSD(a.value)}</p>
                <p className="text-sm font-bold text-foreground">{formatUSD((a.value * pct) / 100)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Historial de titularidad</p>
          {history.map((o) => {
            const gain =
              o.exit_price != null && o.exit_cost_base != null
                ? Number(o.exit_price) - Number(o.exit_cost_base)
                : null;
            return (
              <p key={o.id} className="text-xs text-muted-foreground">
                {STAGE_LABELS[o.stage] ?? o.stage}: <span className="text-foreground font-medium">{o.llc_name}</span> {Number(o.percentage)}%
                {o.exit_date ? ` · salida ${fmtDate(o.exit_date)}` : ""}
                {o.exit_price != null ? ` · venta ${formatUSD(o.exit_price)}` : ""}
                {gain != null ? ` · resultado ${formatUSD(gain)}` : ""}
                {o.notes ? ` · ${o.notes}` : ""}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
