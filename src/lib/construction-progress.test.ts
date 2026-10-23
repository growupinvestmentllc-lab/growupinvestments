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

const withClearing = (completed: string[] = [], cleared = true) => stages(completed).map((stage) => ({
  ...stage, lot_clearing_completed: stage.stage_name === "Limpieza de lote" && cleared,
}));
test("limpieza inicial No no suma aunque la tarea antigua esté completa", () => {
  const rows = withClearing(["Soft Construction"], false);
  const clearing = rows.find((s) => s.stage_name === "Limpieza de lote");
  if (clearing) clearing.completed = true;
  strictEqual(constructionProgress(rows), 17);
});
test("limpieza Sí suma exactamente 3% sin HC1 completa", () => strictEqual(constructionProgress(withClearing()), 3));
test("Soft 17% más limpieza 3% da 20%", () => strictEqual(constructionProgress(withClearing(["Soft Construction"])), 20));
test("HC1 completa incluye limpieza sin duplicar: Soft más HC1 da 34%", () => strictEqual(constructionProgress(withClearing(["Soft Construction", "Hard Construction 1"])), 34));
test("todas las etapas y limpieza completas dan 100%, no 103%", () => strictEqual(constructionProgress(withClearing(ALL_STAGES.map((s) => s.group))), 100));
test("limpieza Sí determina la etapa actual", () => strictEqual(constructionStageLabel(withClearing(["Soft Construction"])), "Limpieza de lote realizada"));
test("volver a No quita solo los 3% y mantiene Soft", () => strictEqual(constructionProgress(withClearing(["Soft Construction"], false)), 17));
test("calcular limpieza no modifica ningún registro", () => {
  const rows = withClearing(["Soft Construction"]);
  const before = structuredClone(rows);
  constructionProgress(rows);
  constructionStageLabel(rows);
  deepStrictEqual(rows, before);
});