export function Logo({ subtitle = true, light = false }: { subtitle?: boolean; light?: boolean }) {
  const main = light ? "text-secondary-foreground" : "text-primary";
  const subtle = light ? "text-secondary-foreground/70" : "text-primary/60";
  return (
    <div className="flex flex-col leading-none">
      <div className={`flex items-center gap-2 font-sans ${main}`}>
        <svg
          aria-hidden="true"
          viewBox="0 0 141 94"
          className="h-7 w-[42px] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
        >
          <path d="M 8,8 L 133,8 L 133,86 L 78,86 L 78,58 L 55,58 L 55,86 L 8,86 Z" />
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