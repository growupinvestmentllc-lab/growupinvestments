import { test } from "node:test";
import { strictEqual, deepStrictEqual } from "node:assert";
import { ALL_STAGES } from "./stages";
import { constructionProgress, constructionStageLabel, isLotForSale } from "./construction-progress";

const stages = (completed: string[] = []) => ALL_STAGES.map((s) => ({
  stage_group: s.group, stage_name: s.name, completed: completed.includes(s.group), active: false,
}));

for (const [group, weight] of [["Soft Construction", 17], ["Hard Construction 1", 17], ["Hard Construction 2", 17], ["Hard Construction 3", 17], ["Hard Construction 4", 17], ["CO (Certificado de Ocupación)", 15]] as const) {
  test(`${group} completada suma exactamente ${weight}%`, () => strictEqual(constructionProgress(stages([group])), weight));
}
test("las seis etapas completas suman 100%", () => strictEqual(constructionProgress(stages(ALL_STAGES.map((s) => s.group))), 100));
test("la etapa en curso y las tareas parciales no suman", () => {
  const rows = stages(["Soft Construction"]);
  rows[1].completed = true;
  rows[2].active = true;
  strictEqual(constructionProgress(rows), 17);
});
test("Soft aprobada muestra 17% y no Finalizada con HC1 activa", () => {
  const rows = stages(["Soft Construction"]);
  rows[1].active = true;
  strictEqual(constructionProgress(rows), 17);
  strictEqual(constructionStageLabel(rows), "Soft aprobada");
});
test("no hay avance sin etapas ni con un grupo incompleto", () => {
  strictEqual(constructionProgress([]), 0);
  strictEqual(constructionProgress([{ stage_group: "Hard Construction 1", completed: true }]), 0);
});
test("el cálculo compartido conserva el registro para todos los inversores", () => {
  const rows = stages(["Soft Construction", "Hard Construction 1"]);
  const before = structuredClone(rows);
  strictEqual(constructionProgress(rows), 34);
  strictEqual(constructionProgress(rows), 34);
  deepStrictEqual(rows, before);
});
test("los lotes en venta no muestran avance, pero sí una casa en construcción", () => {
  for (const address of ["329 NE 13th St", "35 SW 19th Ct", "3604 74th St W", "715 Little Rock St E"]) strictEqual(isLotForSale({ address, status: "A la venta" }), true);
  strictEqual(isLotForSale({ address: "329 NE 13th St", status: "En construcción" }), false);
  strictEqual(isLotForSale({ address: "477 Rayford St", status: "A la venta" }), false);
});