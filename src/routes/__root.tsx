import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ClientOnly,
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { installCryptopeGlobalLogBeacon, reportCryptopeGlobalLogError } from "../lib/globalLogBeacon";
import { initializeDomainBranding } from "../lib/domainUtils";

// WalletConnect / wagmi touch browser globals (HTMLElement) at import time, so
// the provider module is loaded lazily and only in the browser. Do NOT import
// `../lib/walletconnect` statically from this file — it breaks server rendering.
const WalletProviders = lazy(() => import("../components/WalletProviders"));

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    reportCryptopeGlobalLogError(error, "tanstack_root_error_component");
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Crypto Checkout Page" },
      { name: "description", content: "Crypto Checkout Page" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Crypto Checkout Page" },
      { property: "og:description", content: "Crypto Checkout Page" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Crypto Checkout Page" },
      { name: "twitter:description", content: "Crypto Checkout Page" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/1bd29bcf-57ec-4943-b56e-68dfb9f52a94" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/1bd29bcf-57ec-4943-b56e-68dfb9f52a94" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    installCryptopeGlobalLogBeacon();
    initializeDomainBranding();
  }, []);

  // Required: nested routes render here. Removing <Outlet /> breaks all child routes.
  const app = (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );

  return (
    // Server / pre-hydration: render the app without wallet providers.
    // Browser: wrap it in wagmi once the provider chunk has loaded.
    <ClientOnly fallback={app}>
      <Suspense fallback={app}>
        <WalletProviders>{app}</WalletProviders>
      </Suspense>
    </ClientOnly>
  );
}
