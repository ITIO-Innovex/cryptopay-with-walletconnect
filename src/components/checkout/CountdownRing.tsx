import { useId, useState } from "react";

interface CountdownRingProps {
  /** Seconds remaining. */
  secondsLeft: number;
  /** Total seconds in the window, used to compute the depleting arc. */
  total: number;
  size?: number;
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Circular progress ring that depletes as the payment window elapses, with a
 * hover tooltip explaining what happens on expiry.
 */
export function CountdownRing({ secondsLeft, total, size = 56 }: CountdownRingProps) {
  const [hover, setHover] = useState(false);
  const titleId = useId();
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, secondsLeft / total));
  const offset = c * (1 - progress);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-labelledby={titleId}
        className="-rotate-90"
      >
        <title id={titleId}>Time remaining: {formatTimer(secondsLeft)}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-brand">
        {formatTimer(secondsLeft)}
      </span>
      {hover && (
        <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-card">
          When time expires, payment will be canceled
        </div>
      )}
    </div>
  );
}
