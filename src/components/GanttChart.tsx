import { STAGE_GROUPS } from "@/lib/stages";
import { Check } from "lucide-react";

type Stage = {
  id: string;
  stage_order: number;
  stage_name: string;
  stage_group: string | null;
  completed: boolean;
  active: boolean;
  estimated_date?: string | null;
};

const GROUP_SHORT: Record<string, string> = {
  "Soft Construction": "Soft",
  "Hard Construction 1": "Hard C1",
  "Hard Construction 2": "Hard C2",
  "Hard Construction 3": "Hard C3",
  "Hard Construction 4": "Hard C4",
  "CO (Certificate of Occupancy)": "C.O.",
};

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

type GroupStatus = "completed" | "active" | "pending";

function groupStatus(stages: Stage[], group: string): GroupStatus {
  const gs = stages.filter((s) => s.stage_group === group);
  if (gs.length === 0) return "pending";
  if (gs.every((s) => s.completed)) return "completed";
  if (gs.some((s) => s.active || s.completed)) return "active";
  return "pending";
}

function monthIndex(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  return d.getFullYear() * 12 + d.getMonth();
}

function fmtMonth(absMonth: number): string {
  const m = ((absMonth % 12) + 12) % 12;
  return MONTH_LABELS[m];
}

export function GanttChart({ stages }: { stages: Stage[] }) {
  if (!stages.length) return null;

  // Determine each group's month range using estimated_date of its stages.
  const groupRanges = STAGE_GROUPS.map((g, idx) => {
    const gs = stages
      .filter((s) => s.stage_group === g.group)
      .map((s) => s.estimated_date)
      .filter((d): d is string => !!d)
      .map(monthIndex);
    return {
      group: g.group,
      label: GROUP_SHORT[g.group] ?? g.group,
      status: groupStatus(stages, g.group),
      start: gs.length ? Math.min(...gs) : null,
      end: gs.length ? Math.max(...gs) : null,
      order: idx,
    };
  });

  // Compute overall timeline. If no estimated dates anywhere, fallback to evenly distributed months starting current month.
  const allMonths = groupRanges.flatMap((g) => (g.start !== null ? [g.start, g.end!] : []));
  let minMonth: number;
  let maxMonth: number;
  if (allMonths.length) {
    minMonth = Math.min(...allMonths);
    maxMonth = Math.max(...allMonths);
  } else {
    const now = new Date();
    minMonth = now.getFullYear() * 12 + now.getMonth();
    maxMonth = minMonth + STAGE_GROUPS.length - 1;
  }
  // Ensure at least groups-length span so each group can have a visible bar in fallback
  if (maxMonth - minMonth + 1 < 3) maxMonth = minMonth + 2;
  const totalMonths = maxMonth - minMonth + 1;

  // For groups without dates, evenly distribute one slot
  const slotPerGroup = totalMonths / STAGE_GROUPS.length;

  return (
    <div className="card-soft p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Cronograma de Obra
        </h3>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Fases por mes · estado actual destacado
        </p>
      </div>

      {/* Months header */}
      <div className="grid mb-3" style={{ gridTemplateColumns: "70px 1fr" }}>
        <div />
        <div
          className="grid text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest"
          style={{ gridTemplateColumns: `repeat(${totalMonths}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalMonths }).map((_, i) => (
            <div key={i} className="text-center truncate">{fmtMonth(minMonth + i)}</div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {groupRanges.map((g) => {
          const isCompleted = g.status === "completed";
          const isActive = g.status === "active";

          // Compute bar position
          let startCol: number;
          let span: number;
          if (g.start !== null && g.end !== null) {
            startCol = g.start - minMonth + 1;
            span = g.end - g.start + 1;
          } else {
            startCol = Math.round(g.order * slotPerGroup) + 1;
            span = Math.max(1, Math.round(slotPerGroup));
          }

          return (
            <div
              key={g.group}
              className={`grid items-center gap-2 ${isActive ? "bg-primary/5 -mx-2 px-2 py-2 rounded-lg" : ""}`}
              style={{ gridTemplateColumns: "70px 1fr" }}
            >
              <div className={`flex items-center gap-1.5 ${!isCompleted && !isActive ? "opacity-60" : ""}`}>
                {isCompleted ? (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={4} />
                  </div>
                ) : isActive ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
                )}
                <span
                  className={`text-[11px] truncate ${
                    isActive
                      ? "font-black text-primary"
                      : isCompleted
                      ? "font-bold text-foreground"
                      : "font-bold text-muted-foreground"
                  }`}
                >
                  {g.label}
                </span>
              </div>

              <div
                className="grid relative"
                style={{
                  gridTemplateColumns: `repeat(${totalMonths}, minmax(0, 1fr))`,
                  height: isActive ? "14px" : "10px",
                }}
              >
                {/* Grid lines */}
                <div
                  className="absolute inset-0 grid pointer-events-none"
                  style={{ gridTemplateColumns: `repeat(${totalMonths}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: totalMonths }).map((_, i) => (
                    <div key={i} className="border-l border-border/40 first:border-l-0" />
                  ))}
                </div>
                {/* Bar */}
                <div
                  className={`h-full rounded-full ${
                    isCompleted
                      ? "bg-primary/70"
                      : isActive
                      ? "bg-primary shadow-md ring-2 ring-primary/20"
                      : "bg-muted-foreground/20"
                  }`}
                  style={{ gridColumn: `${startCol} / span ${span}` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-around gap-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary/70" />
          <span className="text-muted-foreground">Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-foreground font-semibold">Fase Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
          <span className="text-muted-foreground">Pendiente</span>
        </div>
      </div>
    </div>
  );
}