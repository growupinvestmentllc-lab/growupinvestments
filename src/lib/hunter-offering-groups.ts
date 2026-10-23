import { compareProjectOrder } from "./project-order";

type CategorizedOffering = { kind: string; title: string; progress_pct?: number | null };

const FERREYRA_USER_ID = "243bed34-113d-4e9e-a53c-6a3dacee5211";

export function visibleHunterOfferings<T extends CategorizedOffering>(items: T[], userId: string | undefined) {
  if (userId !== "7a5fb21e-e8ce-46df-8847-8bf3940d9ab2") return items;
  return items.filter((o) => o.title !== "448 Rajah St");
}

export function isSoldHunterOffering(o: CategorizedOffering, userId: string | undefined) {
  return userId === FERREYRA_USER_ID && o.title === "448 Rajah St";
}

export function groupHunterOfferings<T extends CategorizedOffering>(items: T[], userId?: string) {
  const permitted = new Set(["329 NE 13th St", "35 SW 19th Ct"]);
  const completed = items.filter((o) => o.kind === "construccion").sort((a, b) => compareProjectOrder(
    { status: isSoldHunterOffering(a, userId) ? "Vendida" : "En construcción", progress: a.progress_pct },
    { status: isSoldHunterOffering(b, userId) ? "Vendida" : "En construcción", progress: b.progress_pct },
  ));
  return {
    completed,
    rented: items.filter((o) => o.kind === "rbi"),
    permitted: items.filter((o) => o.kind === "lote" && permitted.has(o.title)),
    unpermitted: items.filter((o) => o.kind === "lote" && !permitted.has(o.title)),
  };
}