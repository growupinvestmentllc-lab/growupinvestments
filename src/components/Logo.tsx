import logoAsset from "@/assets/logo_growup_horizontal_blanco.png.asset.json";

export function Logo({ subtitle = true, light = false }: { subtitle?: boolean; light?: boolean }) {
  const subtle = light ? "text-secondary-foreground/70" : "text-primary/60";
  return (
    <div className="flex flex-col leading-none">
      <img
        src={logoAsset.url}
        alt="GrowUp Investments"
        className={`h-8 w-auto object-contain ${light ? "" : "invert"}`}
      />
      {subtitle && (
        <span className={`mt-2 text-[10px] uppercase tracking-[0.2em] ${subtle}`}>
          Smart investments. Real growth.
        </span>
      )}
    </div>
  );
}