import offerings from "./investor-offerings.json";

export type InvestorOffering = (typeof offerings)[number];
export const IGNACIO_USER_ID = "4832f152-5dba-4838-a2f6-d97b870c9588";

export const opportunityGroups = [
  { title: "Casas terminadas", addresses: ["448 Rajah St", "2130 NE 26th St", "2812 NW 27th Ave", "14 Trout Way"] },
  { title: "Casas terminadas con contrato de alquiler", addresses: ["472 Rajah St", "2725 Embers Pkwy W", "477 Rayford St", "11224 & 11226 Kimberly Ave"] },
  { title: "Lotes en venta permisados", addresses: ["329 NE 13th St", "35 SW 19th Ct"] },
  { title: "Lotes en venta sin permisología", addresses: ["3604 74th St W", "715 Little Rock St E"] },
];

export function groupedInvestorOpportunities(userId: string | undefined) {
  if (userId !== IGNACIO_USER_ID) return [];
  return opportunityGroups.map((group) => ({
    title: group.title,
    items: group.addresses.flatMap((address) => {
      const row = offerings.find((o) => o.title === address);
      return row ? [row] : [];
    }),
  }));
}