export function Logo({ subtitle = true, light = false }: { subtitle?: boolean; light?: boolean }) {
  const main = light ? "text-secondary-foreground" : "text-primary";
  const subtle = light ? "text-secondary-foreground/70" : "text-primary/60";
  return (
    <div className="flex flex-col leading-none">
      <div className={`flex items-center gap-2 font-sans ${main}`}>
        <svg
          aria-hidden="true"
          viewBox="0 0 70 47"
          className="h-7 w-[44px] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        >
          <path d="M 2,2 L 68,2 L 68,10 L 38,10 L 38,18 L 68,18 L 68,29 L 38,29 L 38,37 L 68,37 L 68,45 L 2,45 Z" />
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