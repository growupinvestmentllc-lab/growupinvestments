export type StageDef = { group: string; name: string };

export const STAGE_GROUPS: { group: string; stages: string[] }[] = [
  {
    group: "Soft Construction",
    stages: ["Diseño de la casa y planimetría"],
  },
  {
    group: "Hard Construction 1",
    stages: ["Limpieza de lote", "Fundación", "Stemwall", "Plomería underground", "Slab", "Levantamiento de paredes"],
  },
  {
    group: "Hard Construction 2",
    stages: [
      "Instalación Trusses y Sheathing",
      "Instalación ventanas y puertas",
      "Instalación de Rough",
      "Inspección de framing",
      "Trabajo del Stucco",
    ],
  },
  {
    group: "Hard Construction 3",
    stages: [
      "Instalación del Wall and Ceiling",
      "Instalación de Drywall",
      "Instalación piso",
      "Instalación rodapié y puertas",
    ],
  },
  {
    group: "Hard Construction 4",
    stages: [
      "Instalación cocinas y vanities",
      "Driveway",
      "Items finales mecánica",
      "Items finales plomería",
      "Items finales electricidad",
      "Landscaping",
    ],
  },
  {
    group: "CO (Certificate of Occupancy)",
    stages: ["Inspecciones finales", "Entrega de documentos finales"],
  },
];

export const ALL_STAGES: StageDef[] = STAGE_GROUPS.flatMap((g) =>
  g.stages.map((name) => ({ group: g.group, name })),
);

export function formatUSD(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}