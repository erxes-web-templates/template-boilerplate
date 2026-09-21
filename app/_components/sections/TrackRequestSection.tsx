"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "../../../types/sections";
import { getTicketConfig } from "../../../lib/ticketConfig";
import { useRequestByIdOrReference } from "../../../hooks/useTickets";
import { STAGE_TRACK } from "../../../lib/ticketMapping";
import { SectionHeading } from "./_SectionHeading";

/**
 * Look up a request by its reference.
 *
 * Resolved and shown in place rather than navigating away, because this
 * template has no /requests route — the lookup hook takes either an id or an
 * exact reference and returns nothing on a partial match, so a guessed prefix
 * cannot open somebody else's request.
 *
 * The query runs against a submitted value, not the input: firing a lookup on
 * every keystroke would send a request per character and report "not found"
 * while someone is still halfway through typing.
 */
const TrackRequestSection = ({ section }: { section: Section }) => {
  const config = useMemo(
    () => getTicketConfig(section.config),
    [section.config],
  );

  const [reference, setReference] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const { request, loading, notFound } = useRequestByIdOrReference(
    query,
    config,
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = reference.trim();
    if (!value) {
      setError("Enter the reference from your confirmation.");
      setQuery("");
      return;
    }
    setError("");
    setQuery(value);
  };

  const stageIndex = request ? STAGE_TRACK.indexOf(request.stage) : -1;

  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <SectionHeading
          eyebrow={section.config?.eyebrow}
          title={section.config?.title ?? section.content}
          description={
            section.config?.description ??
            "Enter the reference from your confirmation to see where it has got to."
          }
        />

        <form className="mt-8" onSubmit={handleSubmit} noValidate>
          <Label htmlFor="request-reference">Reference</Label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input
              id="request-reference"
              className="sm:flex-1"
              value={reference}
              placeholder="REQ-2026-0417"
              onChange={(event) => setReference(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "request-reference-error" : undefined}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Looking…" : "Find it"}
            </Button>
          </div>
          {error && (
            <p
              className="mt-2 text-sm text-destructive"
              id="request-reference-error"
              role="alert"
            >
              {error}
            </p>
          )}
        </form>

        {notFound && (
          <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No request matches that reference. Check it against your
            confirmation — it has to match exactly.
          </p>
        )}

        {request && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{request.reference}</p>
            <h3 className="mt-1 text-lg font-semibold text-card-foreground">
              {request.title}
            </h3>

            <p className="mt-4 text-sm font-medium text-foreground">
              {request.statusLabel}
            </p>

            {stageIndex >= 0 && (
              <ol className="mt-3 flex flex-wrap gap-2">
                {STAGE_TRACK.map((stage, index) => (
                  <li
                    key={stage}
                    className={
                      index <= stageIndex
                        ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-accent-foreground"
                        : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    }
                  >
                    {stage}
                  </li>
                ))}
              </ol>
            )}

            {request.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {request.description}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackRequestSection;
