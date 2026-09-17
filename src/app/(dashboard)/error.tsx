"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log error to developer console for debugging
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <section className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-800/50 bg-red-900/20">
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h2 className="mb-1 text-sm font-semibold text-slate-100">Something went wrong</h2>
      <p className="mb-4 max-w-sm text-sm text-slate-400">
        {error.message || "This page could not be loaded. Please try again."}
      </p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={reset}>
          Try again
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { window.location.href = "/dashboard"; }}>
          Back to dashboard
        </Button>
      </div>
    </section>
  );
}
