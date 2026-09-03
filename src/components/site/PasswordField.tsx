import { useState } from "react";
import { Check, Eye, EyeOff, Lock, X } from "lucide-react";

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "number", label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { id: "symbol", label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function isStrongPassword(value: string) {
  return PASSWORD_RULES.every((r) => r.test(value));
}

interface PasswordFieldProps {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  showRules?: boolean;
  error?: string;
}

export function PasswordField({
  id,
  label,
  hint,
  value,
  onChange,
  showRules = false,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-brand">
        <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          required
          placeholder="••••••••"
          title={hint}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="current-password"
          className="w-full bg-transparent py-2.5 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

      {showRules && value.length > 0 && (
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(value);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 text-xs ${
                  ok ? "text-brand" : "text-muted-foreground"
                }`}
              >
                {ok ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
