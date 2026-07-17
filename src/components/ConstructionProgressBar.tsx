import { STAGE_GROUPS } from "@/lib/stages";
import { Check } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Stage = {
  id: string;
  stage_order: number;
  stage_name: string;
  stage_group: string | null;
  completed: boolean;
  active: boolean;
  estimated_date?: string | null;
};

type GroupStatus = "completed" | "active" | "pending";

function getGroupStatus(stages: Stage[], group: string): GroupStatus {
  const gs = stages.filter((s) => s.stage_group === group);
  if (gs.length === 0) return "pending";
  if (gs.every((s) => s.completed)) return "completed";
  if (gs.some((s) => s.active || s.completed)) return "active";
  return "pending";
}

function getGroupEstimatedDate(stages: Stage[], group: string): string | null {
  const gs = stages
    .filter((s) => s.stage_group === group)
    .sort((a, b) => a.stage_order - b.stage_order);
  for (let i = gs.length - 1; i >= 0; i--) {
    if (gs[i].estimated_date) return gs[i].estimated_date!;
  }
  return null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

const GROUP_SHORT_LABELS: Record<string, string> = {
  "Soft Construction": "Soft",
  "Hard Construction 1": "HC 1",
  "Hard Construction 2": "HC 2",
  "Hard Construction 3": "HC 3",
  "Hard Construction 4": "HC 4",
  "CO (Certificate of Occupancy)": "C.O.",
};

function GroupStagesList({ stages, group }: { stages: Stage[]; group: string }) {
  const gs = stages
    .filter((s) => s.stage_group === group)
    .sort((a, b) => a.stage_order - b.stage_order);
  if (gs.length === 0) {
    const def = STAGE_GROUPS.find((g) => g.group === group);
    const names = def?.stages ?? [];
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
        <ul className="space-y-1.5">
          {names.map((n) => (
            <li key={n} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 border bg-muted border-border text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              </span>
              <span className="text-muted-foreground">{n}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
      <ul className="space-y-1.5">
        {gs.map((s) => (
          <li key={s.id} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 border ${
                s.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : s.active
                  ? "bg-primary/15 border-primary text-primary"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {s.completed ? <Check className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className={`${s.active ? "text-primary font-medium" : s.completed ? "text-foreground" : "text-muted-foreground"}`}>
              {s.stage_name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GroupCircle({
  stages,
  group,
  isCompleted,
  isActive,
  index,
  size = "md",
}: {
  stages: Stage[];
  group: string;
  isCompleted: boolean;
  isActive: boolean;
  index: number;
  size?: "md" | "sm";
}) {
  const dims = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  const icon = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const btn = (
    <button
      type="button"
      aria-label={`Ver etapas de ${group}`}
      className={`${dims} rounded-full flex items-center justify-center font-semibold border-2 transition hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
        isCompleted
          ? "bg-primary text-primary-foreground border-primary"
          : isActive
          ? "bg-primary/15 text-primary border-primary"
          : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {isCompleted ? <Check className={icon} /> : <span>{index + 1}</span>}
    </button>
  );
  return (
    <Popover>
      <HoverCard openDelay={80} closeDelay={100}>
        <HoverCardTrigger asChild>
          <PopoverTrigger asChild>{btn}</PopoverTrigger>
        </HoverCardTrigger>
        <HoverCardContent className="w-72" align="center">
          <GroupStagesList stages={stages} group={group} />
        </HoverCardContent>
      </HoverCard>
      <PopoverContent className="w-72" align="center">
        <GroupStagesList stages={stages} group={group} />
      </PopoverContent>
    </Popover>
  );
}

export function ConstructionProgressBar({ stages }: { stages: Stage[] }) {
  const groups = STAGE_GROUPS.map((g) => ({
    group: g.group,
    label: GROUP_SHORT_LABELS[g.group] ?? g.group,
    status: getGroupStatus(stages, g.group),
    date: getGroupEstimatedDate(stages, g.group),
  }));

  return (
    <div className="card-soft p-5">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
        Progreso de Construcción
      </h3>

      {/* Desktop: horizontal */}
      <div className="hidden sm:block">
        <div className="flex items-start">
          {groups.map((g, i) => {
            const isCompleted = g.status === "completed";
            const isActive = g.status === "active";
            const isLast = i === groups.length - 1;

            return (
              <div key={g.group} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center flex-shrink-0 w-full">
                  <GroupCircle
                    stages={stages}
                    group={g.group}
                    isCompleted={isCompleted}
                    isActive={isActive}
                    index={i}
                    size="md"
                  />
                  <p
                    className={`mt-2 text-xs font-semibold text-center ${
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {g.label}
                  </p>
                  {g.date ? (
                    <p className="text-[10px] text-muted-foreground text-center mt-0.5">
                      {isCompleted ? "✓ " : ""}
                      {formatDate(g.date)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/60 text-center mt-0.5">—</p>
                  )}
                </div>

                {!isLast && (
                  <div className="flex-1 h-0.5 mt-5 mx-1">
                    <div
                      className={`h-full w-full ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical stepper */}
      <div className="sm:hidden space-y-0">
        {groups.map((g, i) => {
          const isCompleted = g.status === "completed";
          const isActive = g.status === "active";
          const isLast = i === groups.length - 1;

          return (
            <div key={g.group} className="flex gap-3">
              <div className="flex flex-col items-center">
                <GroupCircle
                  stages={stages}
                  group={g.group}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  index={i}
                  size="sm"
                />
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[28px] my-1 ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm font-semibold ${
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {g.label}
                  </p>
                  {isActive && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      Actual
                    </span>
                  )}
                </div>
                {g.date && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isCompleted ? "Completado · " : "Est. "}
                    {formatDate(g.date)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}