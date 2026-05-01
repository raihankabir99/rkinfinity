import React from "react";

type State = { error: Error | null };

export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Fire & forget — never block UI.
    try {
      void fetch("/api/public/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: `${error.stack ?? ""}\n\nReact: ${info.componentStack ?? ""}`,
          path: typeof window !== "undefined" ? window.location.pathname : undefined,
          level: "error",
        }),
      });
    } catch {
      /* swallow */
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We've logged the issue and will look into it. Please refresh the page.
            </p>
            <button
              onClick={() => location.reload()}
              className="mt-6 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Install global handlers once on the client to capture uncaught errors / promise rejections.
export function installClientErrorReporting() {
  if (typeof window === "undefined") return;
  if ((window as any).__rkErrInstalled) return;
  (window as any).__rkErrInstalled = true;

  const post = (payload: Record<string, unknown>) => {
    try {
      void fetch("/api/public/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch { /* noop */ }
  };

  window.addEventListener("error", (ev) => {
    post({
      message: ev.message || "window.error",
      stack: ev.error?.stack,
      path: window.location.pathname,
      level: "error",
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const reason = ev.reason;
    post({
      message: typeof reason === "string" ? reason : reason?.message ?? "Unhandled promise rejection",
      stack: reason?.stack,
      path: window.location.pathname,
      level: "error",
    });
  });
}
