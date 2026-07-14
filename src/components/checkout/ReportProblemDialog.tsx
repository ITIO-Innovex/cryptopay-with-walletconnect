import { useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Send, X } from "lucide-react";
import { z } from "zod";

interface ReportProblemDialogProps {
  open: boolean;
  /** Pre-filled transaction context, if known. */
  defaultTxHash?: string;
  onClose: () => void;
}

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const reportSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, { message: "Please describe the problem in at least 10 characters." })
    .max(1000, { message: "Description must be under 1000 characters." }),
  txHash: z.string().trim().max(120).optional(),
});

/**
 * Lets a buyer report a problem with their payment (wrong network, missing
 * deposit, etc.) and attach a screenshot for the support team to review. The
 * submission is mocked client-side and structured to wire to a backend later.
 */
export function ReportProblemDialog({ open, defaultTxHash, onClose }: ReportProblemDialogProps) {
  const [description, setDescription] = useState("");
  const [txHash, setTxHash] = useState(defaultTxHash ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Screenshot must be a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Screenshot must be 5 MB or smaller.");
      return;
    }
    setError(null);
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    const parsed = reportSchema.safeParse({ description, txHash });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setError(null);
    // Mock submit — payload ready to send to a backend later.
    // BACKEND: POST /api/checkout/session/:id/report (multipart).
    // See INTEGRATION.md §6. `reportSchema` above is the authoritative payload shape.
    setSubmitted(true);
  };

  const reset = () => {
    setDescription("");
    setTxHash(defaultTxHash ?? "");
    setFileName(null);
    setPreviewUrl(null);
    setError(null);
    setSubmitted(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Report a problem"
      onClick={close}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-foreground">Report a problem</h3>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-brand" strokeWidth={1.5} />
            <h4 className="mt-4 text-lg font-semibold text-foreground">Report sent</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Your report{fileName ? " and screenshot" : ""} were sent to our team. We&apos;ll review
              it and get back to you by email.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what went wrong and attach a screenshot of your wallet/transaction.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="report-desc" className="block text-sm font-medium text-foreground">
                  What happened?
                </label>
                <textarea
                  id="report-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="e.g. I sent USDT on the wrong network and it isn't showing here."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label htmlFor="report-hash" className="block text-sm font-medium text-foreground">
                  Transaction hash <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="report-hash"
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x… or your wallet's transaction ID"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-foreground">Screenshot</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ImagePlus className="h-4 w-4" />
                  {fileName ? "Change screenshot" : "Upload screenshot"}
                </button>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="mt-3 max-h-40 w-full rounded-xl border border-border object-contain"
                  />
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                Send report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
