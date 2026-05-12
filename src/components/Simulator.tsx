import { useState } from "react";
import { formatUSD } from "@/lib/stages";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function Simulator({ baseCost = 180000, basePrice = 250000 }: { baseCost?: number; basePrice?: number }) {
  const [price, setPrice] = useState(basePrice);
  const [cost, setCost] = useState(baseCost);
  const [commission, setCommission] = useState(6);
  const [closing, setClosing] = useState(2);
  const [other, setOther] = useState(0);

  const calc = (p: number) => {
    const net = p - p * (commission / 100) - p * (closing / 100) - other;
    const gain = net - cost;
    const roi = cost ? (gain / cost) * 100 : 0;
    return { net, gain, roi, price: p };
  };
  const conservative = calc(price * 0.9);
  const base = calc(price);
  const optimistic = calc(price * 1.1);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card-soft p-6 lg:col-span-1 space-y-5">
        <h3 className="font-semibold text-foreground">Parámetros</h3>
        <div>
          <Label>Precio de venta estimado: <span className="text-primary font-semibold">{formatUSD(price)}</span></Label>
          <Slider min={150000} max={600000} step={5000} value={[price]} onValueChange={(v) => setPrice(v[0])} className="mt-3" />
        </div>
        <div>
          <Label>Costo total invertido</Label>
          <Input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Comisión %</Label><Input type="number" value={commission} onChange={(e) => setCommission(Number(e.target.value))} /></div>
          <div><Label>Closing %</Label><Input type="number" value={closing} onChange={(e) => setClosing(Number(e.target.value))} /></div>
        </div>
        <div><Label>Otros gastos</Label><Input type="number" value={other} onChange={(e) => setOther(Number(e.target.value))} /></div>
      </div>
      <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
        <ScenarioCard title="Conservador" tone="red" {...conservative} />
        <ScenarioCard title="Base" tone="yellow" {...base} />
        <ScenarioCard title="Optimista" tone="green" {...optimistic} />
      </div>
    </div>
  );
}

function ScenarioCard({ title, tone, price, gain, roi }: { title: string; tone: "red" | "yellow" | "green"; price: number; net?: number; gain: number; roi: number }) {
  const tones = {
    red: "border-l-4 border-red-500",
    yellow: "border-l-4 border-yellow-500",
    green: "border-l-4 border-primary",
  } as const;
  return (
    <div className={`card-soft p-5 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-3 text-xs text-muted-foreground">Precio venta</p>
      <p className="text-lg font-bold text-foreground">{formatUSD(price)}</p>
      <p className="mt-3 text-xs text-muted-foreground">Ganancia neta</p>
      <p className={`text-lg font-bold ${gain >= 0 ? "text-primary" : "text-destructive"}`}>{formatUSD(gain)}</p>
      <p className="mt-3 text-xs text-muted-foreground">ROI</p>
      <p className="text-2xl font-bold text-foreground">{roi.toFixed(1)}%</p>
    </div>
  );
}