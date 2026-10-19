type CategorizedOffering = { kind: string; title: string };

export function visibleHunterOfferings<T extends CategorizedOffering>(items: T[], userId: string | undefined) {
  if (userId !== "7a5fb21e-e8ce-46df-8847-8bf3940d9ab2") return items;
  return items.filter((o) => o.title !== "448 Rajah St");
}

export function groupHunterOfferings<T extends CategorizedOffering>(items: T[]) {
  const permitted = new Set(["329 NE 13th St", "35 SW 19th Ct"]);
  return {
    completed: items.filter((o) => o.kind === "construccion"),
    rented: items.filter((o) => o.kind === "rbi"),
    permitted: items.filter((o) => o.kind === "lote" && permitted.has(o.title)),
    unpermitted: items.filter((o) => o.kind === "lote" && !permitted.has(o.title)),
  };
}