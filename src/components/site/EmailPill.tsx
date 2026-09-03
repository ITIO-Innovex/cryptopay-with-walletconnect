import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

/**
 * Contact email pill with copy-to-clipboard. Email is passed in so branding
 * can swap the address without a second hardcoded constant.
 */
export function EmailPill({ email, compact = false }: { email: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      /* clipboard unavailable — mailto still works */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-border bg-card ${
        compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
      }`}
    >
      <Mail className={compact ? "h-3.5 w-3.5 text-brand" : "h-4 w-4 text-brand"} aria-hidden="true" />
      <a href={`mailto:${email}`} className="font-medium text-foreground hover:text-brand">
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email address copied" : "Copy email address"}
        className="ml-1 inline-flex items-center gap-1 rounded-lg border border-input px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-brand" aria-hidden="true" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden="true" /> Copy
          </>
        )}
      </button>
    </div>
  );
}
