import { test, expect } from "bun:test";
import { ownContributions, type Contribution } from "./capital-contributions";

test("Ignacio solo recibe su aporte, sin modificar sus valores", () => {
  const ignacio = { id: "aporte-ignacio", investor_id: "ignacio", capital: 50000, rate_pct: 11, profit: 5500, total_to_collect: 55500, ownership_pct: 16.9 } as Contribution;
  const other = { ...ignacio, id: "otro", investor_id: "las-tropas" };
  expect(ownContributions([ignacio, other], "ignacio")).toEqual([ignacio]);
  expect(ownContributions([ignacio, other], "ignacio")[0]).toMatchObject({ capital: 50000, rate_pct: 11, profit: 5500, total_to_collect: 55500, ownership_pct: 16.9 });
});