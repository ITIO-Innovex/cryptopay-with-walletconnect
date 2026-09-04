import { createFileRoute } from "@tanstack/react-router";
import { MarketingLanding } from "@/components/site/MarketingLanding";

/** Logo size test page — medium wordmark (32px tall). Not linked in navigation. */
export const Route = createFileRoute("/home2")({
  head: () => ({
    meta: [
      { title: "Cryptope logo test — medium" },
      { name: "description", content: "Internal preview of the Cryptope home page with a medium logo." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Cryptope logo test — medium" },
      { property: "og:description", content: "Internal preview of the Cryptope home page with a medium logo." },
    ],
  }),
  component: () => <MarketingLanding logoSize="md" />,
});
