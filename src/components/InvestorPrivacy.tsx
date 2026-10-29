import { useAuth } from "@/lib/use-auth";
import { DEMO_MONEY, isDemoInvestor, maskDemoMoney } from "@/lib/demo-investor";
import { formatUSD as ordinaryUSD } from "@/lib/stages";

export function useInvestorMoney() {
  const { user } = useAuth();
  const demo = isDemoInvestor(user?.email);
  return {
    demo,
    formatUSD: (value: number | null | undefined) => demo ? DEMO_MONEY : ordinaryUSD(value),
    formatUSDCents: (value: number) => demo ? DEMO_MONEY : value.toLocaleString("en-US", {
      style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
    }),
    mask: (text: string) => demo ? maskDemoMoney(text) : text,
  };
}

export function InvestorAddress({ children }: { children: string | null | undefined }) {
  const { user } = useAuth();
  return <span className={isDemoInvestor(user?.email) ? "demo-address" : undefined}>{children}</span>;
}