import { constructionProgress } from "./construction-progress";

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
  rows: T[], stages: { project_id: string; stage_group: string | null; completed: boolean }[],
) {
  const byProject = new Map<string, typeof stages>();
  stages.forEach((stage) => {
    const rows = byProject.get(stage.project_id) ?? [];
    rows.push(stage);
    byProject.set(stage.project_id, rows);
  });
  return [...rows].sort((a, b) => compareProjectOrder(
    { status: a.status, progress: constructionProgress(byProject.get(a.id) ?? []) },
    { status: b.status, progress: constructionProgress(byProject.get(b.id) ?? []) },
  ));
}
