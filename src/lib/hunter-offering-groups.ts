type CategorizedOffering = { kind: string; title: string };

export function groupHunterOfferings<T extends CategorizedOffering>(items: T[]) {
  const permitted = new Set(["329 NE 13th St", "35 SW 19th Ct"]);
  return {
    completed: items.filter((o) => o.kind === "construccion"),
    rented: items.filter((o) => o.kind === "rbi"),
    permitted: items.filter((o) => o.kind === "lote" && permitted.has(o.title)),
    unpermitted: items.filter((o) => o.kind === "lote" && !permitted.has(o.title)),
  };
}