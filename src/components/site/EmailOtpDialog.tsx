import { useState } from "react";
import { X } from "lucide-react";

const DEMO_OTP = "123456";

interface EmailOtpDialogProps {
  open: boolean;
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

/**
 * Demonstration-only OTP dialog. No code is sent; 123456 is accepted.
 */
export function EmailOtpDialog({ open, email, onVerified, onClose }: EmailOtpDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === DEMO_OTP) {
      setCode("");
      setError(false);
      onVerified();
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Verify your work email"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-semibold">Verify your work email</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter the 6-digit code for {email || "your work email"}. In this demonstration the code
          is 123456.
        </p>
        <label htmlFor="otp" className="mt-3 block text-xs font-medium">
          One-time code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-center text-base tracking-[0.4em] outline-none focus:border-brand"
        />
        {error && (
          <p className="mt-1.5 text-xs text-destructive">That code is not correct. Check the code and try again.</p>
        )}
        <button
          type="submit"
          className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Verify email
        </button>
      </form>
    </div>
  );
}
