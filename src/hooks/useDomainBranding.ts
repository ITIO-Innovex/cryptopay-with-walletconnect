import { useEffect, useState } from "react";
import {
  DOMAIN_MAP_UPDATED_EVENT,
  getDomainBranding,
  getInitialDomainBranding,
  initializeDomainBranding,
  isDomainMapReady,
  type DomainBranding,
} from "@/lib/domainUtils";

export type DomainBrandingState = DomainBranding & { ready: boolean };

/**
 * Domain-based branding for the current host.
 *
 * The first render uses the hydration-safe fallback (same on server and
 * client); the real hostname-based brand and the Live multi_domains_map
 * overlay are applied in an effect, and the hook re-renders when the
 * overlay updates.
 */
export function useDomainBranding(): DomainBrandingState {
  const [branding, setBranding] = useState<DomainBranding>(() => getInitialDomainBranding());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBranding(initializeDomainBranding());
    setReady(isDomainMapReady());
    const onUpdate = () => {
      setBranding(getDomainBranding());
      setReady(true);
    };
    window.addEventListener(DOMAIN_MAP_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(DOMAIN_MAP_UPDATED_EVENT, onUpdate);
  }, []);

  return { ...branding, ready };
}
