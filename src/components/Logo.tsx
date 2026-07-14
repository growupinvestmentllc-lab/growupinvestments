export function Logo({ subtitle = true, light = false }: { subtitle?: boolean; light?: boolean }) {
  const main = light ? "text-secondary-foreground" : "text-primary";
  const subtle = light ? "text-secondary-foreground/70" : "text-primary/60";
  return (
    <div className="flex flex-col leading-none">
      <div className={`flex items-center gap-2 font-sans ${main}`}>
        <svg
          viewBox="0 0 40 32"
          className="h-6 w-auto"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
          aria-hidden="true"
        >
          {/* top-left bracket */}
          <polyline points="14,3 3,3 3,14" />
          {/* bottom-right bracket with inward tick (G) */}
          <polyline points="26,29 37,29 37,16 28,16" />
        </svg>
        <span className="text-2xl tracking-tight">
          <span className="font-extrabold">GROW</span>
          <span className="font-light ml-1">UP</span>
        </span>
      </div>
      {subtitle && (
        <span className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${subtle}`}>
          Smart investments. Real growth.
        </span>
      )}
    </div>
  );
}