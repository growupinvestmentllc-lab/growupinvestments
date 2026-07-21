import logoAsset from "@/assets/logo_growup_horizontal_blanco.png.asset.json";

export function Logo({
  light = false,
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <img
      src={logoAsset.url}
      alt="GrowUp Investments"
      className={`w-auto object-contain ${light ? "" : "invert"} ${className || "h-8"}`}
    />
  );
}