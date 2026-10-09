import { test } from "node:test";
import { deepStrictEqual, strictEqual, ok } from "node:assert";
import { groupedInvestorOpportunities, IGNACIO_USER_ID } from "./investor-opportunities";

test("Ignacio ve las cuatro casas terminadas solicitadas", () => {
  deepStrictEqual(groupedInvestorOpportunities(IGNACIO_USER_ID)[0].items.map((o) => o.title), ["448 Rajah St", "2130 NE 26th St", "2812 NW 27th Ave", "14 Trout Way"]);
});
test("Las cuatro casas con contrato permanecen juntas", () => {
  deepStrictEqual(groupedInvestorOpportunities(IGNACIO_USER_ID)[1].items.map((o) => o.title), ["472 Rajah St", "2725 Embers Pkwy W", "477 Rayford St", "11224 & 11226 Kimberly Ave"]);
});
test("Los lotes permisados son 329 y 35 SW", () => {
  deepStrictEqual(groupedInvestorOpportunities(IGNACIO_USER_ID)[2].items.map((o) => o.title), ["329 NE 13th St", "35 SW 19th Ct"]);
});
test("Los lotes sin permisología son 3604 y 715", () => {
  deepStrictEqual(groupedInvestorOpportunities(IGNACIO_USER_ID)[3].items.map((o) => o.title), ["3604 74th St W", "715 Little Rock St E"]);
});
test("Las doce oportunidades tienen foto y no se duplican", () => {
  const rows = groupedInvestorOpportunities(IGNACIO_USER_ID).flatMap((g) => g.items);
  strictEqual(new Set(rows.map((o) => o.id)).size, 12);
  for (const row of rows) ok(row.image_url || row.gallery?.length);
});
test("El catálogo solicitado no reemplaza las oportunidades de otros inversores", () => {
  deepStrictEqual(groupedInvestorOpportunities("otro-inversor"), []);
  deepStrictEqual(groupedInvestorOpportunities(undefined), []);
});