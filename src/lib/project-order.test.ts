import { test } from "node:test";
import { deepStrictEqual } from "node:assert";
import { sortProjects, orderProjectsWithStages } from "./project-order";

test("las vendidas aparecen antes de las casas en construcción en todas las variantes de estado", () => {
  const rows = [
    { id: "obra", status: "En construcción", progress: 100 },
    { id: "vendida", status: "VENDIDA", progress: 0 },
    { id: "vendido", status: "Vendido", progress: 0 },
    { id: "alquiler", status: "Alquilada", progress: 100 },
  ];
  deepStrictEqual(sortProjects(rows).map((r) => r.id), ["vendida", "vendido", "obra", "alquiler"]);
  deepStrictEqual(rows.map((r) => r.id), ["obra", "vendida", "vendido", "alquiler"]);
});

test("las casas en construcción se ordenan de mayor a menor avance y conservan el orden en empates", () => {
  const rows = [
    { id: "inicio", status: "Inicio de obra", progress: 8 },
    { id: "avanzada", status: "En construcción", progress: 90 },
    { id: "media", status: "En construcción", progress: 31 },
    { id: "empate", status: "En construcción", progress: 31 },
  ];
  deepStrictEqual(sortProjects(rows).map((r) => r.id), ["avanzada", "media", "empate", "inicio"]);
});

test("Admin usa las etapas realizadas y el mismo avance visible de 1405 sin modificar registros", () => {
  const rows = [
    { id: "inicio", address: "708 Jaguar", status: "En construcción" },
    { id: "cortez", address: "1405 Cortez", status: "En construcción" },
  ];
  deepStrictEqual(orderProjectsWithStages(rows, []).map((r) => r.id), ["cortez", "inicio"]);
  deepStrictEqual(Object.keys(rows[0]), ["id", "address", "status"]);
});