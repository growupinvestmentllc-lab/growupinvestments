import { test } from "node:test";
import { deepStrictEqual } from "node:assert";
import { ownContributions, type Contribution } from "./capital-contributions";

test("Ignacio solo recibe su aporte, sin modificar sus valores", () => {
  const ignacio = { id: "aporte-ignacio", investor_id: "ignacio", capital: 50000, rate_pct: 11, profit: 5500, total_to_collect: 55500, ownership_pct: 16.9 } as Contribution;
  const other = { ...ignacio, id: "otro", investor_id: "las-tropas" };
  deepStrictEqual(ownContributions([ignacio, other], "ignacio"), [ignacio]);
  const row = ownContributions([ignacio, other], "ignacio")[0];
  deepStrictEqual([row.capital, row.rate_pct, row.profit, row.total_to_collect, row.ownership_pct], [50000, 11, 5500, 55500, 16.9]);
});