import { createFileRoute } from "@tanstack/react-router";
import { MarketingLanding } from "@/components/site/MarketingLanding";

/** Logo size test page — small wordmark (24px tall). Not linked in navigation. */
export const Route = createFileRoute("/home1")({
  head: () => ({
    meta: [
      { title: "Cryptope logo test — small" },
      { name: "description", content: "Internal preview of the Cryptope home page with a small logo." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Cryptope logo test — small" },
      { property: "og:description", content: "Internal preview of the Cryptope home page with a small logo." },
    ],
  }),
  component: () => <MarketingLanding logoSize="sm" />,
});
