import { useEffect, useState } from "react";
import {
  DOMAIN_MAP_UPDATED_EVENT,
  getDomainBranding,
  initializeDomainBranding,
  isDomainMapReady,
  type DomainBranding,
} from "@/lib/domainUtils";

export type DomainBrandingState = DomainBranding & { ready: boolean };

/**
 * Re-renders when Live multi_domains_map overlay applies.
 */
export function useDomainBranding(): DomainBrandingState {
  const [branding, setBranding] = useState<DomainBranding>(() => getDomainBranding());
  const [ready, setReady] = useState(() => isDomainMapReady());

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
