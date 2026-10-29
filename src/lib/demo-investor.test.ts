import { describe, expect, it } from "vitest";
import { isDemoInvestor, maskDemoMoney, isDemoAddress, demoProjectRoi } from "./demo-investor";

describe("demo investor privacy", () => {
  it("shows 11% only for the second project in the demo account", () => {
    expect(demoProjectRoi(true, "973008eb-0d47-4906-8215-00868c3befba")).toBe(11);
    expect(demoProjectRoi(false, "973008eb-0d47-4906-8215-00868c3befba")).toBeNull();
    expect(demoProjectRoi(true, "a85c8831-dce0-4f70-bfe1-6c4e9f03b5bc")).toBeNull();
  });
  it("only enables masking for the requested demo account", () => {
    expect(isDemoInvestor("ejemplo@growupinvestments.com")).toBe(true);
    expect(isDemoInvestor("bluecoast@llc.com")).toBe(false);
    expect(isDemoInvestor(null)).toBe(false);
  });
  it("masks money while retaining percentages and dates", () => {
    expect(maskDemoMoney("$1,883 / $941.50 · 50% · 28/02/2027")).toBe("$XXXX / $XXXX · 50% · 28/02/2027");
    expect(maskDemoMoney("$2k · ($25.550) · $0")).toBe("$XXXX · ($XXXX) · $XXXX");
  });
  it("marks only fictitious addresses for blur", () => {
    expect(isDemoAddress("Dirección ficticia 01, Florida")).toBe(true);
    expect(isDemoAddress("Dirección ficticia 02, Florida")).toBe(true);
    expect(isDemoAddress("Ubicación ficticia 01")).toBe(true);
    expect(isDemoAddress("2725 Embers Pkwy W")).toBe(false);
  });
});