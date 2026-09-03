import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Keep query values as raw strings. Default JSON parse/stringify turns large
 * transIDs into unsafe Numbers (precision loss) and rewrites the URL
 * (e.g. 300072409354365856 → "300072409354365800").
 */
function parseSearch(searchStr: string): Record<string, string> {
  const q = searchStr.startsWith("?") ? searchStr.slice(1) : searchStr;
  return Object.fromEntries(new URLSearchParams(q));
}

function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value == null || value === "") continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Vite `base` (e.g. /cryptope-ui/) → TanStack basepath without trailing slash.
  const baseUrl = String(import.meta.env.BASE_URL || "/");
  const basepath = baseUrl.replace(/\/+$/, "") || undefined;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    ...(basepath && basepath !== "" ? { basepath } : {}),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    parseSearch,
    stringifySearch,
  });

  return router;
};
