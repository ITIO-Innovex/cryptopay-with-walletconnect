import { createFileRoute } from "@tanstack/react-router";
import { MarketingLanding } from "@/components/site/MarketingLanding";

/** Logo size test page — extra large wordmark (48px tall). Not linked in navigation. */
export const Route = createFileRoute("/home4")({
  head: () => ({
    meta: [
      { title: "Cryptope logo test — extra large" },
      { name: "description", content: "Internal preview of the Cryptope home page with an extra large logo." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Cryptope logo test — extra large" },
      { property: "og:description", content: "Internal preview of the Cryptope home page with an extra large logo." },
    ],
  }),
  component: () => <MarketingLanding logoSize="xl" />,
});
