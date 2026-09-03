/**
 * Fail-open Global Log error beacon for cryptope-ui (SS3).
 * Parity with SS1 (pgx-admin) / SS2 (pgx-merchant): instance + server identity.
 * Enable with VITE_GLOBALLOG_CLIENT_ENABLED=true
 */
const ENABLED = String(import.meta.env.VITE_GLOBALLOG_CLIENT_ENABLED || "false").toLowerCase() === "true";
const SERVICE_NAME = "cryptope-ui";

function ingestUrl(): string {
  return import.meta.env.VITE_GLOBALLOG_INGEST_URL || "http://127.0.0.1:1099/api/internal/logs/ingest";
}

function browserInstanceId(): string {
  try {
    const key = "globallog.instanceId";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `${SERVICE_NAME}@${window.location.hostname}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `${SERVICE_NAME}@${typeof window !== "undefined" ? window.location.hostname : "unknown"}`;
  }
}

function baseFields() {
  return {
    serviceName: SERVICE_NAME,
    sourceType: "FRONTEND",
    logType: "EXCEPTION",
    logLevel: "ERROR",
    environment: import.meta.env.MODE || "local",
    serverName: typeof window !== "undefined" ? window.location.hostname : undefined,
    instanceId: typeof window !== "undefined" ? browserInstanceId() : undefined,
    apiEndpoint: typeof window !== "undefined" ? window.location.pathname : undefined,
  };
}

function postBeacon(payload: Record<string, unknown>) {
  if (!ENABLED) return;
  try {
    const body = JSON.stringify({ ...baseFields(), ...payload });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ingestUrl(), new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(ingestUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* fail-open */
  }
}

/** One-shot install of window error listeners (safe to call multiple times). */
let installed = false;

export function installCryptopeGlobalLogBeacon() {
  if (!ENABLED || typeof window === "undefined" || installed) return;
  installed = true;

  window.addEventListener("error", (event) => {
    postBeacon({
      message: event.message || "window.error",
      exceptionClass: event.error?.name || "Error",
      exceptionMessage: event.error?.message || event.message,
      stackTrace: event.error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { name?: string; message?: string; stack?: string } | string | undefined;
    postBeacon({
      message: typeof reason === "string" ? reason : reason?.message || "unhandledrejection",
      exceptionClass: typeof reason === "string" ? "UnhandledRejection" : reason?.name || "UnhandledRejection",
      exceptionMessage: typeof reason === "string" ? reason : reason?.message,
      stackTrace: typeof reason === "string" ? undefined : reason?.stack,
    });
  });
}

/** Report a caught React/route error without throwing. */
export function reportCryptopeGlobalLogError(error: Error, boundary?: string) {
  postBeacon({
    message: error.message,
    exceptionClass: error.name || "Error",
    exceptionMessage: error.message,
    stackTrace: error.stack,
    tags: boundary ? { boundary } : undefined,
  });
}
