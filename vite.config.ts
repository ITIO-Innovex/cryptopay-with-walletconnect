// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const CRYPTOPE_UI_PORT = Number(process.env.CRYPTOPE_UI_PORT || 8080);

/** Production nginx mounts this app under /cryptope-ui/ (see deploy/production/nginx). */
function normalizeBase(raw: string | undefined): string {
  const fallback = "/";
  if (!raw || !String(raw).trim()) return fallback;
  let p = String(raw).trim();
  try {
    if (/^https?:\/\//i.test(p)) {
      p = new URL(p).pathname || fallback;
    }
  } catch {
    return fallback;
  }
  if (!p.startsWith("/")) p = `/${p}`;
  if (!p.endsWith("/")) p = `${p}/`;
  return p;
}

const publicBase = normalizeBase(
  process.env.VITE_BASE_PATH || process.env.CRYPTOPE_PUBLIC_BASE,
);

export default defineConfig({
  // Served on :8080; merchant (:3001) proxies /cryptope-ui → this app (see pgx_merchant/vite.config.ts).
  // Docker/prod: skip Nitro SSR (WalletConnect/lit needs DOM). Client assets + ensure-spa-index.mjs.
  // Skip Nitro deploy bundle — SPA prerender emits dist/client/_shell.html for nginx.
  nitro: false,
  vite: {
    base: publicBase,
    server: {
      host: true,
      port: CRYPTOPE_UI_PORT,
      strictPort: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    spa: {
      enabled: true,
    },
  },
});
