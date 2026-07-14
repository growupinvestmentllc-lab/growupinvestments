export function Logo({ subtitle = true, light = false }: { subtitle?: boolean; light?: boolean }) {
  const main = light ? "text-secondary-foreground" : "text-primary";
  const subtle = light ? "text-secondary-foreground/70" : "text-primary/60";
  return (
    <div className="flex flex-col leading-none">
      <div className={`flex items-center gap-2 font-sans ${main}`}>
        <svg
          viewBox="0 0 44 32"
          className="h-7 w-auto"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* upper bracket (G rotated 180°): top edge, right side down to middle, then tick left */}
          <path d="M6 4 H38 a2 2 0 0 1 2 2 V15 a1 1 0 0 1 -1 1 H26" />
          {/* lower bracket (G): bottom edge, left side up to middle, then tick right */}
          <path d="M38 28 H6 a2 2 0 0 1 -2 -2 V17 a1 1 0 0 1 1 -1 H18" />
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