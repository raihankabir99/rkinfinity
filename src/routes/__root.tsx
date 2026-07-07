import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Chatbot } from "@/components/Chatbot";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useDocumentMetadata } from "@/hooks/useDocumentMetadata";
import { GlobalErrorBoundary, installClientErrorReporting } from "@/components/GlobalErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <img
          src="/assets/rkinfinity-logo.png"
          alt="rkInfinity logo"
          className="mx-auto mb-6 h-24 w-24 rounded-full object-contain ring-1 ring-[color:var(--gold,_oklch(0.78_0.14_85))]/60 shadow-[0_0_28px_oklch(0.78_0.14_85/0.45)]"
        />
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you'''re looking for doesn'''t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function PendingComponent() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="h-24 w-24 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  pendingComponent: PendingComponent,
});

function RootComponent() {
  useVisitorTracking();
  useDocumentMetadata();
  useEffect(() => {
    installClientErrorReporting();
  }, []);
  return (
    <GlobalErrorBoundary>
      <Outlet />
      <FloatingWhatsApp />
      <Chatbot />
      <Toaster position="bottom-center" theme="dark" richColors />
    </GlobalErrorBoundary>
  );
}
