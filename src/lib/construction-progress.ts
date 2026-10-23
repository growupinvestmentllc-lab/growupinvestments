import { STAGE_GROUPS } from "./stages";

export type ConstructionStage = {
  stage_group: string | null;
  completed: boolean;
  active?: boolean;
  stage_name?: string;
  lot_clearing_completed?: boolean;
};

export const CONSTRUCTION_WEIGHTS: Readonly<Record<string, number>> = {
  "Soft Construction": 17,
  "Hard Construction 1": 17,
  "Hard Construction 2": 17,
  "Hard Construction 3": 17,
  "Hard Construction 4": 17,
  "CO (Certificado de Ocupación)": 15,
};

export function isConstructionGroupCompleted(stages: readonly ConstructionStage[], group: string) {
  const rows = stages.filter((stage) => stage.stage_group === group);
  const expected = STAGE_GROUPS.find((definition) => definition.group === group);
  return rows.length >= (expected?.stages.length ?? 1) && rows.every((stage) => stage.completed);
}

export function isLotClearingCompleted(stages: readonly ConstructionStage[]): boolean {
  return stages.some((stage) => stage.stage_group === "Hard Construction 1" &&
    stage.stage_name === "Limpieza de lote" && stage.lot_clearing_completed === true);
}

export function constructionProgress(stages: readonly ConstructionStage[]): number {
  const completedProgress = Object.entries(CONSTRUCTION_WEIGHTS).reduce((sum, [group, weight]) =>
    sum + (isConstructionGroupCompleted(stages, group) ? weight : 0), 0);
  return completedProgress + (isLotClearingCompleted(stages) &&
    !isConstructionGroupCompleted(stages, "Hard Construction 1") ? 3 : 0);
}

export function constructionStageLabel(stages: readonly ConstructionStage[]): string {
  if (isLotClearingCompleted(stages)) return "Limpieza de lote realizada";
  const progress = constructionProgress(stages);
  if (progress === 100) return "Obra 100% completada y entregada";
  if (progress === 17 && isConstructionGroupCompleted(stages, "Soft Construction")) return "Soft aprobada";
  const active = stages.find((stage) => stage.active && !stage.completed);
  return active?.stage_group?.startsWith("CO") ? active.stage_group : active?.stage_name ?? "Por iniciar";
}

export function isLotForSale(project: { address?: string | null; status?: string | null }): boolean {
  const status = project.status?.trim().toLowerCase() ?? "";
  const forSale = ["a la venta", "en venta", "lote disponible", "lote en venta"].includes(status);
  const lotAddress = /^(329\s+ne\s+13th|35\s+sw\s+19th|3604\s+74th|715\s+little\s+rock)\b/i.test(project.address?.trim() ?? "");
  return forSale && (lotAddress || status.includes("lote"));
}