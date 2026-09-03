import { useEffect, useState } from "react";
import { useDomainBranding } from "@/hooks/useDomainBranding";
import { resolvePublicAssetUrl } from "@/lib/domainUtils";

function Wordmark({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("cryptope")) {
    return (
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-foreground">crypto</span>
        <span className="text-brand">pe</span>
        <span className="text-muted-foreground">.net</span>
      </span>
    );
  }
  if (lower.includes("boxcharge") || lower.includes("boxchrge")) {
    return (
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-foreground">Box</span>
        <span className="text-brand">Charge</span>
      </span>
    );
  }
  return <span className="text-xl font-semibold tracking-tight text-foreground">{name}</span>;
}

/**
 * Live domain logo only after the image actually loads. Relative paths are
 * resolved against the merchant host so /bc_logo.png is not requested from :8080.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  const branding = useDomainBranding();
  const src = resolvePublicAssetUrl(branding.logo);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(false);
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setOk(true);
    };
    img.onerror = () => {
      if (!cancelled) setOk(false);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <span className={`inline-flex max-w-[200px] items-center gap-2 ${className}`}>
      {ok && src ? (
        <img src={src} alt={branding.name} className="h-8 w-auto max-w-[180px] object-contain" />
      ) : (
        <Wordmark name={branding.name || "PGX"} />
      )}
    </span>
  );
}
