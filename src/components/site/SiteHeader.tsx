import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

function feHostSearch(): { feHost?: string } {
  if (typeof window === "undefined") return {};
  const feHost = new URLSearchParams(window.location.search).get("feHost")?.trim();
  return feHost ? { feHost } : {};
}

/**
 * Shared marketing header. Log in stays on the replica SS3 merchant log-in page.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const loginSearch = feHostSearch();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link to="/" search={loginSearch} aria-label="Home" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm sm:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/login"
            search={loginSearch}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            to="/contact"
            search={loginSearch}
            rel="nofollow"
            className="rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Talk to us
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 sm:hidden">
          <ul className="flex flex-col gap-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-lg px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                search={loginSearch}
                className="block rounded-lg px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                search={loginSearch}
                rel="nofollow"
                className="mt-1 block rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                Talk to us
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
