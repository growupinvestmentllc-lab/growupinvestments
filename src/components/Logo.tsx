export function Logo({ subtitle = true, light = false }: { subtitle?: boolean; light?: boolean }) {
  const main = light ? "text-secondary-foreground" : "text-primary";
  const subtle = light ? "text-secondary-foreground/70" : "text-primary/60";
  return (
    <div className="flex flex-col leading-none">
      <div className={`flex items-baseline gap-1 font-sans ${main}`}>
        <span className="text-2xl font-light">[</span>
        <span className="text-2xl font-extrabold tracking-tight">GROW</span>
        <span className="text-2xl font-light tracking-tight">UP</span>
      </div>
      {subtitle && (
        <span className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${subtle}`}>
          Smart investments. Real growth.
        </span>
      )}
    </div>
  );
}