import flamingoPhoto from "@/assets/621-flamingo-foto.png.asset.json";

export type Contribution = {
  id: string; investor_id: string; title: string; property_address: string; project_status: string; project_id: string | null;
  sale_price: number | null; total_cost: number | null; project_profit: number | null; project_roi: number | null; ownership_pct: number | null;
  capital: number; rate_pct: number; profit: number; total_to_collect: number;
  deposits: { date: string | null; amount: number; detail: string | null }[];
  documents: { name: string; path: string | null }[];
};

export const contributionPhoto = flamingoPhoto.url;

export function ownContributions(rows: Contribution[], userId: string) {
  return rows.filter((row) => row.investor_id === userId);
}