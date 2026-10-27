"use client";

import { useEffect, useState } from "react";

const DEFAULT_MESSAGES = [
  "Loading the page…",
  "Fetching the latest content…",
  "Almost ready…",
];

const STEP_MS = 1800;

/**
 * Full-page loader that steps through a few messages, then stays on the last
 * one rather than looping back to the first on a slow load. It shows before
 * the site config (and the owner's site text) has loaded, so the messages are
 * passed in rather than read from useSiteText.
 */
export default function PageLoader({
  messages = DEFAULT_MESSAGES,
}: {
  messages?: string[];
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= messages.length - 1) return;
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [step, messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p
          key={step}
          className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-500"
        >
          {messages[step]}
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {messages.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-6 rounded-full transition-colors duration-500 ${
                i <= step ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
