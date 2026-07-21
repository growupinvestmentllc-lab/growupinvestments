import logoAsset from "@/assets/logo_growup_horizontal_blanco.png.asset.json";

export function Logo({
  light = false,
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col leading-none">
      <img
        src={logoAsset.url}
        alt="GrowUp Investments"
        className={`h-8 w-auto object-contain ${light ? "" : "invert"} ${className}`}
      />
    </div>
  );
}