import { createFileRoute } from "@tanstack/react-router";
import { MarketingLanding } from "@/components/site/MarketingLanding";

/** Logo size test page — large wordmark (40px tall). Not linked in navigation. */
export const Route = createFileRoute("/home3")({
  head: () => ({
    meta: [
      { title: "Cryptope logo test — large" },
      { name: "description", content: "Internal preview of the Cryptope home page with a large logo." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Cryptope logo test — large" },
      { property: "og:description", content: "Internal preview of the Cryptope home page with a large logo." },
    ],
  }),
  component: () => <MarketingLanding logoSize="lg" />,
});
