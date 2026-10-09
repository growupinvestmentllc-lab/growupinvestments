import { test } from "node:test";
import { deepStrictEqual } from "node:assert";
import { groupHunterOfferings } from "./hunter-offering-groups";

const lots = ["329 NE 13th St", "35 SW 19th Ct", "3604 74th St W", "715 Little Rock St E"].map((title) => ({ title, kind: "lote" }));

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