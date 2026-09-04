import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, X } from "lucide-react";

import {
  requestEmailVerificationCode,
  verifyEmailVerificationCode,
} from "@/features/auth/lib/email-otp.functions";

interface EmailOtpDialogProps {
  open: boolean;
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

/**
 * Confirms a work email with a real six-digit code emailed by the platform.
 */
export function EmailOtpDialog({ open, email, onVerified, onClose }: EmailOtpDialogProps) {
  const sendCode = useServerFn(requestEmailVerificationCode);
  const checkCode = useServerFn(verifyEmailVerificationCode);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const requestedFor = useRef<string | null>(null);

  async function requestCode(isResend: boolean) {
    if (!email) return;
    setSending(true);
    setError("");
    try {
      const result = await sendCode({ data: { email } });
      setCooldown(result.retryInSeconds);
      setNotice(
        result.sent
          ? `We have emailed a six-digit code to ${email}. It expires in 10 minutes.`
          : `A code was sent moments ago. You can ask for another in ${result.retryInSeconds} seconds.`,
      );
      if (isResend) setCode("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not send the code. Reason: the email service did not respond. Solution: try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  }

  // Send the first code automatically when the dialog opens for an address.
  useEffect(() => {
    if (!open) {
      requestedFor.current = null;
      return;
    }
    if (requestedFor.current === email) return;
    requestedFor.current = email;
    setCode("");
    setNotice("");
    setError("");
    void requestCode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the six digits from the email exactly as they appear.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const result = await checkCode({ data: { email, code: code.trim() } });
      if (result.verified) {
        setCode("");
        onVerified();
      } else {
        setError(result.reason);
      }
    } catch {
      setError("We could not check that code just now. Please try again.");
    } finally {
      setVerifying(false);
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {notice || `Sending a six-digit code to ${email || "your work email"}…`}
        </p>
        <label htmlFor="otp" className="mt-3 block text-xs font-medium">
          One-time code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="Six digits"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-center text-base tracking-[0.4em] outline-none focus:border-brand"
        />
        {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={verifying || sending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Verify email
        </button>
        <button
          type="button"
          onClick={() => void requestCode(true)}
          disabled={sending || cooldown > 0}
          className="mt-2 w-full rounded-xl border border-border px-4 py-2 text-xs font-medium disabled:opacity-60"
        >
          {sending
            ? "Sending code…"
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
        </button>
      </form>
    </div>
  );
}
