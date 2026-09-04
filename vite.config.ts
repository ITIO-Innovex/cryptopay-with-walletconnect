// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";
import path from "path";

// Load ALL env vars (not just VITE_*) into process.env for server routes
// (e.g. SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY). Never expose these
// through the client envDefine block.
const serverEnv = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

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

/**
 * Static SPA build for the Docker/nginx deployment only (set in Dockerfile).
 * Lovable hosting needs the Nitro server bundle — disabling it there leaves
 * bare imports (e.g. "@tanstack/react-router") unresolved in the deployed
 * worker and every request returns 500 "This page didn't load".
 */
const staticSpaBuild = process.env.CRYPTOPE_SPA_BUILD === "1";

export default defineConfig({
  // Served on :8080; merchant (:3001) proxies /cryptope-ui → this app (see pgx_merchant/vite.config.ts).
  // Docker/prod (CRYPTOPE_SPA_BUILD=1): skip Nitro — SPA prerender emits dist/client/_shell.html
  // for nginx via scripts/ensure-spa-index.mjs. Everywhere else keep the default deploy bundle.
  ...(staticSpaBuild ? { nitro: false as const } : {}),
  vite: {
    base: publicBase,
    resolve: {
      alias: {
        // Force every entities import to the hoisted v4.5.0 copy; nested
        // copies (v6/v7) break SSR deep imports like ./lib/decode.js.
        "entities/lib/decode.js": path.resolve(__dirname, "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(__dirname, "node_modules/entities/lib/encode.js"),
        entities: path.resolve(__dirname, "node_modules/entities"),
      },
    },
    server: {
      host: true,
      port: CRYPTOPE_UI_PORT,
      strictPort: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    // Docker only: shell-only SPA output (dist/client/_shell.html for nginx).
    // Lovable hosting uses full SSR; the SPA prerender step is incompatible
    // with the Nitro worker bundle. WalletConnect/wagmi is loaded client-only
    // (src/components/WalletProviders.tsx), so SSR is safe.
    spa: {
      enabled: staticSpaBuild,
    },
  },
});
