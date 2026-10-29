export const DEMO_EMAIL = "ejemplo@growupinvestments.com";
export const DEMO_LLC = "EJEMPLO INVERSOR LLC";
export const DEMO_MONEY = "$XXXX";

export function demoProjectRoi(isDemo: boolean, projectId: string): number | null {
  return isDemo && projectId === "973008eb-0d47-4906-8215-00868c3befba" ? 11 : null;
}

export function isDemoInvestor(email: string | null | undefined) {
  return email?.trim().toLowerCase() === DEMO_EMAIL;
}

export function maskDemoMoney(text: string) {
  return text.replace(/\$\s*-?\d[\d.,]*(?:\s*k)?/gi, DEMO_MONEY);
}

export function isDemoAddress(text: string) {
  return /^\s*(?:Dirección ficticia|Ubicación ficticia)\b/.test(text);
}