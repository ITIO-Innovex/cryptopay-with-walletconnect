import { Link } from "@tanstack/react-router";

/** Text-only styled wordmark used across the site. */
export function Wordmark() {
  return (
    <span className="text-xl font-semibold tracking-tight">
      <span className="text-foreground">crypto</span>
      <span className="text-brand">pe</span>
      <span className="text-muted-foreground">.net</span>
    </span>
  );
}

/**
 * Shared site header. Section links point at the home page anchors so the
 * same header works on the home page and on every policy / auth page.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link to="/" aria-label="Cryptope home">
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <a href="/#features" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            Features
          </a>
          <a href="/#how" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            How it works
          </a>
          <a href="/#pricing" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            Pricing
          </a>
          <a href="/#faq" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            FAQ
          </a>
          <Link to="/login" className="text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link
            to="/contact"
            rel="nofollow"
            className="rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Talk to us
          </Link>
        </nav>
      </div>
    </header>
  );
}
