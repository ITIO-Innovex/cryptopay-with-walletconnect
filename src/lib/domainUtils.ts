/**
 * Domain-based branding for cryptope_ui.
 * Same contract as checkout_ui DomainBranding: static host rules + Live
 * multi_domains_map overlay. All window access is SSR-safe.
 */

export interface DomainBranding {
  logo: string;
  favicon: string;
  name: string;
}

export type DomainConfig = {
  apiBaseUrl: string;
  theme: string;
  primaryColor: string;
};

type DomainMapOverride = DomainBranding & {
  apiBaseUrl: string;
  frontendHost: string;
  backendHost?: string;
  expiresAt: number;
};

const DOMAIN_MAP_EVENT = "pgx-domain-map-updated";
const CACHE_KEY = "pgx.multiDomainsMap.v1";
const CACHE_TTL_MS = 60_000;

/**
 * Branding used during server rendering and for the first client render
 * (before the hostname is inspected) so server and client HTML match.
 * This repository is the Cryptope site, so Cryptope is the neutral default.
 */
const FALLBACK_BRANDING: DomainBranding = {
  logo: "",
  favicon: "",
  name: "Cryptope",
};

/** Hydration-safe initial branding — identical on server and client. */
export const getInitialDomainBranding = (): DomainBranding => FALLBACK_BRANDING;

let runtimeOverride: DomainMapOverride | null = null;
let mapReady = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readCache(): DomainMapOverride | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DomainMapOverride;
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    if (parsed.frontendHost !== currentFrontendHost()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(value: DomainMapOverride | null) {
  runtimeOverride = value;
  if (!isBrowser()) return;
  try {
    if (!value) sessionStorage.removeItem(CACHE_KEY);
    else sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Host[:port] only — rejects anything that is not a hostname. */
function sanitizeFeHost(raw: string | null | undefined): string {
  if (!raw) return "";
  const v = String(raw).trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9.-]*(:\d{1,5})?$/.test(v) && !/^\[::1\](:\d{1,5})?$/.test(v)) {
    return "";
  }
  return v;
}

function currentFrontendHost(): string {
  if (!isBrowser()) return "";
  try {
    const fromQuery = sanitizeFeHost(new URLSearchParams(window.location.search).get("feHost"));
    if (fromQuery) return fromQuery;
  } catch {
    /* ignore */
  }
  const { hostname, port } = window.location;
  if (port && port !== "80" && port !== "443") {
    return `${hostname}:${port}`.toLowerCase();
  }
  return hostname.toLowerCase();
}

function extractHost(urlOrHost: string): string {
  if (!urlOrHost) return "";
  try {
    if (/^https?:\/\//i.test(urlOrHost)) {
      const u = new URL(urlOrHost);
      const p = u.port;
      if (p && p !== "80" && p !== "443") return `${u.hostname}:${p}`.toLowerCase();
      return u.hostname.toLowerCase();
    }
  } catch {
    /* fall through */
  }
  let v = urlOrHost.trim().toLowerCase().replace(/^https?:\/\//, "");
  const slash = v.indexOf("/");
  if (slash >= 0) v = v.substring(0, slash);
  return v;
}

function hostOnly(hostWithOptionalPort: string): string {
  if (!hostWithOptionalPort) return "";
  const v = String(hostWithOptionalPort).trim().toLowerCase();
  if (v.startsWith("[")) {
    const end = v.indexOf("]");
    return end > 0 ? v.substring(0, end + 1) : v;
  }
  const colon = v.lastIndexOf(":");
  if (colon > 0) {
    const maybePort = v.substring(colon + 1);
    if (maybePort && /^\d+$/.test(maybePort)) return v.substring(0, colon);
  }
  return v;
}

export function apiBaseFromDomainHost(hostOrUrl: string): string {
  if (!hostOrUrl) return "";
  const trimmed = hostOrUrl.trim().replace(/\/$/, "");
  let hostname = "";
  let port = "";
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      hostname = (u.hostname || "").toLowerCase();
      port = u.port || "";
    } else {
      const hostPort = extractHost(trimmed) || trimmed.toLowerCase();
      hostname = hostOnly(hostPort);
      const m = String(hostPort).match(/:(\d+)$/);
      port = m ? m[1] : "";
    }
  } catch {
    hostname = hostOnly(trimmed);
  }
  if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return `http://${hostname}:${port || "9003"}`;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${hostname || trimmed}`;
}

function absoluteAssetUrl(apiBase: string, pathOrNull: string | null | undefined, fallback: string): string {
  if (!pathOrNull) return fallback;
  if (/^https?:\/\//i.test(pathOrNull) || pathOrNull.startsWith("data:")) return pathOrNull;
  if (pathOrNull.startsWith("/")) return `${apiBase.replace(/\/$/, "")}${pathOrNull}`;
  return `${apiBase.replace(/\/$/, "")}/api/user/multi-domains-map/asset/${pathOrNull}`;
}

function isLocalDevHost(hostname: string, port: string): boolean {
  const local =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]";
  if (!local) return false;
  return (
    !port ||
    port === "3000" ||
    port === "3001" ||
    port === "3003" ||
    port === "8080" ||
    port === "5173"
  );
}

/**
 * Lovable preview / published hosts for the Cryptope site
 * (id-preview--*.lovable.app, *.lovableproject.com, *.lovable.app).
 * They must brand as Cryptope, not fall through to the PGX/localhost default.
 */
function isLovableHost(hostname: string): boolean {
  return hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com");
}

export const getStaticDomainBranding = (): DomainBranding => {
  if (!isBrowser()) return FALLBACK_BRANDING;
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port;
  const mappedHost = hostOnly(currentFrontendHost()) || hostname;

  if (isLocalDevHost(hostname, port) || isLocalDevHost(mappedHost, port)) {
    return { logo: "/bc_logo.png", favicon: "/bc_favicon.png", name: "BoxCharge" };
  }
  if (mappedHost.includes("boxchrge.com") || hostname.includes("boxchrge.com")) {
    return { logo: "/bc_logo.png", favicon: "/bc_favicon.png", name: "BoxCharge" };
  }
  if (
    mappedHost.includes("cryptope") ||
    hostname.includes("cryptope") ||
    isLovableHost(hostname)
  ) {
    return { logo: "", favicon: "", name: "Cryptope" };
  }
  if (mappedHost.includes("i15.biz") || hostname.includes("i15.biz")) {
    return { logo: "/pgx_logo.png", favicon: "/pgx_favicon.png", name: "PGX" };
  }
  return { logo: "/pgx_logo.png", favicon: "/pgx_favicon.png", name: "PGX" };
};

export const getStaticDomainConfig = (): DomainConfig => {
  const hostname = isBrowser() ? window.location.hostname.toLowerCase() : "";
  const port = isBrowser() ? window.location.port : "";
  const explicitApiBaseUrl =
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.VITE_BASE_URL || import.meta.env?.VITE_API_BASE_URL)) ||
    "";

  if (isLocalDevHost(hostname, port)) {
    return {
      apiBaseUrl: explicitApiBaseUrl || "http://localhost:9003",
      theme: "boxcharge",
      primaryColor: "#1976d2",
    };
  }
  if (hostname.includes("boxchrge.com")) {
    return {
      apiBaseUrl: explicitApiBaseUrl || "https://api.boxchrge.com",
      theme: "boxcharge",
      primaryColor: "#1976d2",
    };
  }
  if (hostname.includes("cryptope") || isLovableHost(hostname)) {
    return {
      apiBaseUrl: explicitApiBaseUrl || "https://api.cryptope.net",
      theme: "cryptope",
      primaryColor: "#111827",
    };
  }
  if (hostname.includes("i15.biz")) {
    return {
      apiBaseUrl: explicitApiBaseUrl || "https://ms-api.i15.biz",
      theme: "pgx",
      primaryColor: "#2563eb",
    };
  }
  return {
    apiBaseUrl: explicitApiBaseUrl || "http://localhost:9003",
    theme: "pgx",
    primaryColor: "#2563eb",
  };
};

export const getDomainBranding = (): DomainBranding => {
  if (runtimeOverride) {
    return {
      logo: runtimeOverride.logo,
      favicon: runtimeOverride.favicon,
      name: runtimeOverride.name,
    };
  }
  return getStaticDomainBranding();
};

export const updateFavicon = (faviconPath: string): void => {
  if (!isBrowser() || !faviconPath) return;
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach((link) => link.remove());

  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = faviconPath;
  document.head.appendChild(link);
};

export const updatePageTitle = (brandName: string): void => {
  if (!isBrowser() || !brandName) return;
  document.title = `${brandName} — Payment page software`;
};

export const updateMetaTags = (brandName: string): void => {
  if (!isBrowser() || !brandName) return;
  const description = `${brandName} — payment page software for digital asset payments`;
  const title = `${brandName} Payment Page`;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", description);
};

function applyBranding(branding: DomainBranding) {
  if (branding.favicon) updateFavicon(branding.favicon);
  updatePageTitle(branding.name);
  updateMetaTags(branding.name);
}

export async function refreshDomainMapOverride(): Promise<DomainBranding> {
  const staticConfig = getStaticDomainConfig();
  const staticBranding = getStaticDomainBranding();
  const frontendHost = currentFrontendHost();
  const backendHost = extractHost(staticConfig.apiBaseUrl);

  if (!isBrowser() || !frontendHost) {
    mapReady = true;
    return getDomainBranding();
  }

  try {
    const params = new URLSearchParams({ frontendHost });
    if (backendHost) params.set("backendHost", backendHost);
    const url = `${staticConfig.apiBaseUrl.replace(/\/$/, "")}/api/user/multi-domains-map/resolve?${params}`;
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) {
      mapReady = true;
      return getDomainBranding();
    }
    const data = await res.json();
    if (!data?.matched) {
      writeCache(null);
      mapReady = true;
      applyBranding(staticBranding);
      return staticBranding;
    }

    const apiBase = apiBaseFromDomainHost(
      data.baseUrl || data.backendApiDomainName || data.apiBaseHint || staticConfig.apiBaseUrl,
    );
    const override: DomainMapOverride = {
      frontendHost,
      backendHost: extractHost(apiBase),
      apiBaseUrl: apiBase,
      name: data.domainBrandName || data.domainsName || staticBranding.name,
      logo: absoluteAssetUrl(apiBase, data.logoPath || data.logoFileName, staticBranding.logo),
      favicon: absoluteAssetUrl(apiBase, data.faviconPath || data.faviconFileName, staticBranding.favicon),
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    writeCache(override);
    applyBranding(override);
    mapReady = true;
    window.dispatchEvent(new CustomEvent(DOMAIN_MAP_EVENT, { detail: override }));
    return override;
  } catch {
    mapReady = true;
    return getDomainBranding();
  }
}

export const initializeDomainBranding = (): DomainBranding => {
  if (!isBrowser()) return FALLBACK_BRANDING;
  runtimeOverride = readCache();
  const branding = getDomainBranding();
  applyBranding(branding);
  void refreshDomainMapOverride();
  return branding;
};

export const getDomainConfig = (): DomainConfig => {
  const staticConfig = getStaticDomainConfig();
  if (runtimeOverride?.apiBaseUrl) {
    return { ...staticConfig, apiBaseUrl: runtimeOverride.apiBaseUrl };
  }
  return staticConfig;
};

export const getApiBaseUrl = () => {
  const config = getDomainConfig();
  let base = config.apiBaseUrl || "http://localhost:9003";
  if (/^https:\/\/(localhost|127\.0\.0\.1)/i.test(base)) {
    base = base.replace(/^https:/i, "http:");
  }
  return base;
};

export const isDomainMapReady = () => mapReady || !!runtimeOverride;

export const DOMAIN_MAP_UPDATED_EVENT = DOMAIN_MAP_EVENT;

export function contactEmailForBrand(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("cryptope")) return "gateway@cryptope.net";
  if (n.includes("boxcharge") || n.includes("boxchrge")) return "support@boxchrge.com";
  if (n.includes("pgx")) return "support@i15.biz";
  return "support@localhost";
}

/**
 * Origin of the merchant dashboard. Used after SS3 login to open SS5
 * (/dashboard/overview) on the parent host, and for signup / forgot-password.
 */
export function merchantAppOrigin(): string {
  if (!isBrowser()) return "";
  try {
    if (window.top && window.top !== window) {
      try {
        const origin = window.top.location.origin;
        if (origin) return origin;
      } catch {
        /* cross-origin iframe — fall through */
      }
    }
  } catch {
    /* ignore */
  }
  const fe = sanitizeFeHost(new URLSearchParams(window.location.search).get("feHost"));
  if (fe) {
    return `${window.location.protocol}//${fe}`;
  }
  if (window.location.pathname.startsWith("/cryptope-ui")) {
    return window.location.origin;
  }
  const port = window.location.port;
  if (port === "8080" || port === "5173") {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return window.location.origin;
}

export function merchantLoginUrl(): string {
  return `${merchantAppOrigin().replace(/\/$/, "")}/`;
}

export function merchantSignupUrl(): string {
  return `${merchantAppOrigin().replace(/\/$/, "")}/signup`;
}

/** Load /bc_logo.png (etc.) from the merchant host, not the iframe origin. */
export function resolvePublicAssetUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("data:")) return pathOrUrl;
  const origin = merchantAppOrigin().replace(/\/$/, "");
  if (pathOrUrl.startsWith("/")) return `${origin}${pathOrUrl}`;
  return pathOrUrl;
}

/** Navigate the top window so the merchant SPA handles auth (not the iframe). */
export function navigateToMerchant(path: string = "/"): void {
  if (!isBrowser()) return;
  const url = `${merchantAppOrigin().replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    if (window.top && window.top !== window) {
      window.top.location.assign(url);
      return;
    }
  } catch {
    /* ignore */
  }
  window.location.assign(url);
}
