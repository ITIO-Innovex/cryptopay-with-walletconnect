import logoAsset from "@/assets/cryptope-logo.png.asset.json";
import { useDomainBranding } from "@/hooks/useDomainBranding";

/** Logo height presets used by the /home1../home4 size comparison pages. */
export type BrandLogoSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<BrandLogoSize, string> = {
  sm: "h-6 max-w-[150px]",
  md: "h-8 max-w-[190px]",
  lg: "h-10 max-w-[240px]",
  xl: "h-12 max-w-[290px]",
};

/**
 * Renders the single official Cryptope wordmark (transparent PNG on the CDN).
 * No other logo file exists in the project.
 */
export function BrandLogo({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: BrandLogoSize;
}) {
  const branding = useDomainBranding();

  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={logoAsset.url}
        alt={`${branding.name || "Cryptope"} logo`}
        className={`w-auto object-contain ${SIZE_CLASS[size]}`}
      />
    </span>
  );
}
