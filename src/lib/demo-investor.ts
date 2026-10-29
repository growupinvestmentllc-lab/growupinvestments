export const DEMO_EMAIL = "ejemplo@growupinvestments.com";
export const DEMO_LLC = "EJEMPLO INVERSOR LLC";
export const DEMO_MONEY = "$XXXX";

export function isDemoInvestor(email: string | null | undefined) {
  return email?.trim().toLowerCase() === DEMO_EMAIL;
}

export function maskDemoMoney(text: string) {
  return text.replace(/\$\s*-?\d[\d.,]*(?:\s*k)?/gi, DEMO_MONEY);
}

export function isDemoAddress(text: string) {
  return /^\s*(?:Dirección ficticia|Ubicación ficticia)\b/.test(text);
}