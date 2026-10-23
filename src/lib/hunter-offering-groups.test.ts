import { test } from "node:test";
import { deepStrictEqual } from "node:assert";
import { groupHunterOfferings, isSoldHunterOffering, visibleHunterOfferings } from "./hunter-offering-groups";

const lots = ["329 NE 13th St", "35 SW 19th Ct", "3604 74th St W", "715 Little Rock St E"].map((title) => ({ title, kind: "lote" }));

test("Guzman no ve 448 Rajah, pero Ferreyra la conserva y las otras propuestas no cambian", () => {
  const rajah = { title: "448 Rajah St", kind: "construccion" };
  const other = { title: "2130 NE 26th St", kind: "construccion" };
  const items = [rajah, other];
  deepStrictEqual(visibleHunterOfferings(items, "7a5fb21e-e8ce-46df-8847-8bf3940d9ab2"), [other]);
  deepStrictEqual(visibleHunterOfferings(items, "243bed34-113d-4e9e-a53c-6a3dacee5211"), [rajah, other]);
  deepStrictEqual(items, [rajah, other]);
});

test("Hunter separa 329 y 35 SW como lotes permisados", () => {
  deepStrictEqual(groupHunterOfferings(lots).permitted.map((o) => o.title), ["329 NE 13th St", "35 SW 19th Ct"]);
});
test("Hunter separa 3604 y 715 como lotes sin permisología", () => {
  deepStrictEqual(groupHunterOfferings(lots).unpermitted.map((o) => o.title), ["3604 74th St W", "715 Little Rock St E"]);
});
test("Hunter mantiene las casas terminadas separadas de las alquiladas sin modificar sus datos", () => {
  const house = { title: "448 Rajah St", kind: "construccion", price: 349900 };
  const rented = { title: "477 Rayford St", kind: "rbi", price: 340000 };
  const groups = groupHunterOfferings([house, rented, ...lots]);
  deepStrictEqual(groups.completed, [house]);
  deepStrictEqual(groups.rented, [rented]);
});
test("448 Rajah se marca VENDIDA solo para Ferreyra, no para otros hunters", () => {
  const rajah = { title: "448 Rajah St", kind: "construccion" };
  deepStrictEqual(isSoldHunterOffering(rajah, "243bed34-113d-4e9e-a53c-6a3dacee5211"), true);
  deepStrictEqual(isSoldHunterOffering(rajah, "7a5fb21e-e8ce-46df-8847-8bf3940d9ab2"), false);
  deepStrictEqual(isSoldHunterOffering({ title: "477 Rayford St", kind: "rbi" }, "243bed34-113d-4e9e-a53c-6a3dacee5211"), false);
  deepStrictEqual(isSoldHunterOffering(rajah, undefined), false);
});

test("Hunter ordena primero la vendida y después las casas de mayor a menor avance sin mezclar lotes", () => {
  const rows = [
    { title: "Casa inicial", kind: "construccion", progress_pct: 20 },
    { title: "Casa avanzada", kind: "construccion", progress_pct: 90 },
    { title: "448 Rajah St", kind: "construccion", progress_pct: 0 },
    ...lots,
  ];
  const groups = groupHunterOfferings(rows, "243bed34-113d-4e9e-a53c-6a3dacee5211");
  deepStrictEqual(groups.completed.map((o) => o.title), ["448 Rajah St", "Casa avanzada", "Casa inicial"]);
  deepStrictEqual(groups.permitted.map((o) => o.title), ["329 NE 13th St", "35 SW 19th Ct"]);
});