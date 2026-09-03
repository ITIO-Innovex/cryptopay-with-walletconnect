# Fix: "This page didn't load" on preview and cryptope.net

## What is actually happening

The sandbox dev server is healthy (all routes return 200 and render in a headless browser), which is why the earlier check looked fine. The failure is in the **deployed build** that both the preview URL and cryptope.net serve:

```text
GET https://id-preview--a9bddcb4-...lovable.app/  -> 500
GET https://cryptope.net/                         -> 500
Worker log: Error: No such module "assets/@tanstack/react-router"
            imported from "assets/server-DgmJkuTa.js"
```

Root cause (confirmed from the hosting logs and git history): commit `87137b0 "Dev Tech : 03-09-2026 Updated code live"` rewrote `vite.config.ts` for a separate Docker/nginx deployment. It sets `nitro: false`, which turns off the step that bundles the server for Lovable hosting. The deployed server file now tries to import `@tanstack/react-router` at runtime, that module does not exist in the hosting runtime, the request throws, and `src/server.ts` returns the "This page didn't load" page. Every route is affected because the crash happens before routing.

Two related regressions came in with the same commit:

1. `src/routes/__root.tsx` re-imports `wagmiConfig` / `WagmiProvider` at module scope. This was removed earlier because the wallet SDK touches browser globals (`HTMLElement`) during server rendering. Nothing else in the app uses wagmi hooks today, so it is only a crash risk.
2. `src/lib/domainUtils.ts` picks a brand from the hostname. Lovable preview hosts match nothing, so the preview would show "PGX" branding and poll `http://localhost:9003` for a domain map. cryptope.net correctly resolves to "Cryptope".

## Plan

### 1. Restore the Lovable hosting build (the actual fix)
- `vite.config.ts`: only disable the hosting bundle when the Docker build explicitly asks for it (e.g. `CRYPTOPE_SPA_BUILD=1`), otherwise leave it enabled. Lovable builds do not set that variable, so the server bundle is produced correctly again; the developer's Docker flow keeps working by setting it in the `Dockerfile`.
- Keep `spa.enabled: true` for now (the server only renders the shell, route components run in the browser). This matches the external developer's intent and keeps the wallet SDK away from server rendering. Full SSR can be re-enabled later once step 2 is in place.
- Keep the `base` handling; it already defaults to `/` when the Docker env vars are absent.

### 2. Make the wallet SDK safe on the server
- In `__root.tsx`, stop importing `wagmiConfig` at module scope. Load the Wagmi provider lazily on the client (`React.lazy` behind `ClientOnly`) so the server never evaluates `@reown/appkit-adapter-wagmi`. Behaviour in the browser is unchanged.

### 3. Correct branding on Lovable preview hosts
- In `domainUtils.ts`, treat `*.lovable.app` and `*.lovableproject.com` hosts as Cryptope (name, email, API base `https://api.cryptope.net`) instead of the PGX/localhost fallback. This stops the "PGX" label and the localhost polling on the preview. Live cryptope.net behaviour is unchanged.

### 4. Verify, then republish
- Run a production build in the sandbox and confirm the server bundle has no unresolved bare imports.
- Load `/`, `/checkout`, `/login`, `/contact`, `/legal/terms` against the dev server in a headless browser (desktop and 440px mobile) with no console errors.
- The preview URL rebuilds automatically on the next commit. cryptope.net needs a **Publish** afterwards, which I will ask you to confirm.

## Notes for you
- Nothing in the page content or design changes; this is a build/hosting repair.
- The `public/` folder (logos, favicon, robots.txt) no longer exists in this repo after the external commit. The site works without it, but favicons and `/bc_logo.png`-style assets will 404 until they are restored. Not included in this fix unless you want it.
- The external developer's Docker setup and `ensure-spa-index.mjs` script are left intact.

## Technical details
- `nitro: false` in `@lovable.dev/vite-tanstack-config` skips the `nitro/vite` deploy plugin, so `vite build` emits a server chunk with externalized dependencies. The hosting runtime has no runtime module resolution, hence `No such module "assets/@tanstack/react-router"`.
- Change: `nitro: process.env.CRYPTOPE_SPA_BUILD === "1" ? false : undefined` plus `ENV CRYPTOPE_SPA_BUILD=1` in `Dockerfile`.
- `__root.tsx`: `const WalletProviders = lazy(() => import("../components/WalletProviders"))` rendered inside `<ClientOnly fallback={children}>`; the new component wraps `WagmiProvider` and owns the `wagmiConfig` import.
- `domainUtils.ts`: add a `isLovableHost(hostname)` check in `getStaticDomainBranding` and `getStaticDomainConfig` before the generic fallback.
