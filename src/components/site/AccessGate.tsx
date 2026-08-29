import { useEffect, useState, type ReactNode } from "react";

const ACCESS_CODE = "123456";
const STORAGE_KEY = "cryptope_access";

/**
 * Lightweight demo access gate. Asks visitors for a shared access code before
 * showing the site. Frontend-only — this is a soft gate, not authentication.
 */
export function AccessGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-card"
      >
        <div className="text-2xl font-semibold tracking-tight">
          <span className="text-foreground">crypto</span>
          <span className="text-brand">pe</span>
        </div>
        <h1 className="mt-4 text-lg font-semibold text-foreground">Enter access code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This preview is private. Enter the access code you were given to continue.
        </p>
        <label htmlFor="access-code" className="mt-5 block text-sm font-medium text-foreground">
          Access code
        </label>
        <input
          id="access-code"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="••••••"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
        {error && (
          <p className="mt-2 text-sm text-destructive">
            That access code is not valid. Check the code and try again.
          </p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
