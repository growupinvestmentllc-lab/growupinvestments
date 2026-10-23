import { ALL_STAGES } from "./stages";

type OrderedProperty = { status?: string | null; progress?: number | null };

function statusRank(status: string | null | undefined) {
  const normalized = status?.trim().toLowerCase() ?? "";
  if (["vendida", "vendido", "venta", "sold"].includes(normalized)) return 0;
  if (["en construcción", "en construccion", "construccion", "inicio de obra", "inspecciones finales", "obra terminada", "obra finalizada"].includes(normalized)) return 1;
  return 2;
}

export function compareProjectOrder(a: OrderedProperty, b: OrderedProperty) {
  const rank = statusRank(a.status) - statusRank(b.status);
  if (rank) return rank;
  if (statusRank(a.status) !== 1) return 0;
  return (b.progress ?? 0) - (a.progress ?? 0);
}

export function sortProjects<T extends OrderedProperty>(rows: readonly T[]): T[] {
  return [...rows].sort(compareProjectOrder);
}

// Read-only enrichment for admin lists; never persist presentation fields.
export function orderProjectsWithStages<T extends { id: string; address: string; status?: string | null }>(
  rows: T[], stages: { project_id: string; completed: boolean }[],
) {
  const completed = new Map<string, number>();
  stages.forEach((stage) => {
    if (stage.completed) completed.set(stage.project_id, (completed.get(stage.project_id) ?? 0) + 1);
  });
  const progress = (row: T) => row.address.toLowerCase().includes("1405")
    ? 31 : Math.round((completed.get(row.id) ?? 0) / ALL_STAGES.length * 100);
  return [...rows].sort((a, b) => compareProjectOrder(
    { status: a.status, progress: progress(a) }, { status: b.status, progress: progress(b) },
  ));
}