"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "../../../types/sections";
import { getTicketConfig } from "../../../lib/ticketConfig";
import {
  useCurrentCustomerId,
  useSubmitRequest,
  useTicketTags,
} from "../../../hooks/useTickets";
import { SectionHeading } from "./_SectionHeading";

type FieldErrors = Partial<
  Record<"title" | "description" | "email" | "route", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = {
  title: "",
  description: "",
  name: "",
  email: "",
  phone: "",
  location: "",
  categoryTagId: "",
};

/**
 * Submit a request as an erxes ticket.
 *
 * Validation runs on submit rather than on blur: telling someone their
 * description is too short while they are still typing the first sentence
 * marks them wrong before they have had a chance to be right.
 *
 * channelId, pipelineId and statusId cannot be discovered from the portal —
 * listing channels needs a staff login — so they come from section config or
 * NEXT_PUBLIC_ERXES_TICKET_* env. Unconfigured, the form says so instead of
 * posting a ticket that would be rejected.
 */
const RequestFormSection = ({ section }: { section: Section }) => {
  const config = useMemo(
    () => getTicketConfig(section.config),
    [section.config],
  );

  const { customerId } = useCurrentCustomerId();
  const { tags } = useTicketTags(config.tagType);
  const { submit, loading } = useSubmitRequest(config);

  const [routeValue, setRouteValue] = useState(config.routes[0]?.value ?? "");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<{ reference: string; id?: string } | null>(
    null,
  );
  const [submitError, setSubmitError] = useState("");

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.title.trim()) {
      next.title = "Enter a short summary of your request.";
    }
    if (form.description.trim().length < 20) {
      next.description =
        "Describe what happened in at least a sentence or two, so we can act on it.";
    }
    // An anonymous submitter has no account to be reached through, so an email
    // is the only way they will hear back at all.
    if (!customerId && !form.email.trim()) {
      next.email = "Enter an email address so we can reply to you.";
    } else if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
      next.email = "Enter an email address in the format name@example.com.";
    }
    if (!routeValue) next.route = "Choose what kind of request this is.";
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const response = await submit({
      title: form.title.trim(),
      description: form.description.trim(),
      routeValue,
      categoryTagId: form.categoryTagId || undefined,
      extra: {
        contactName: form.name.trim() || undefined,
        contactEmail: form.email.trim() || undefined,
        contactPhone: form.phone.trim() || undefined,
        location: form.location.trim() || undefined,
        submittedAnonymously: !customerId,
      },
    });

    if (!response.ok) {
      setSubmitError(response.message ?? "Your request could not be sent.");
      return;
    }

    setResult({ reference: response.reference ?? "", id: response.id });
  };

  if (result) {
    return (
      <section id="request-form" className="py-20 md:py-28">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <SectionHeading eyebrow="Request sent" title="We have your request" />

          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Your reference</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-card-foreground">
              {result.reference}
            </p>
          </div>

          {/* An anonymous submission cannot be listed back: cpGetTickets
              filters on createdBy and every anonymous ticket shares the
              portal's id, so the reference is genuinely the only way back. */}
          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">
              {customerId
                ? "This request is saved to your account."
                : "Save this reference now."}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {customerId
                ? "You can follow its progress at any time under your requests."
                : "You submitted without signing in, so this reference is the only way back to this request. We cannot look it up for you by name."}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => {
              setResult(null);
              setForm(EMPTY_FORM);
            }}
          >
            Submit another
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="request-form" className="py-20 md:py-28">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <SectionHeading
          eyebrow={section.config?.eyebrow}
          title={section.config?.title ?? section.content}
          description={
            section.config?.description ??
            "Give us enough detail to act on. You will get a reference number as soon as you send it."
          }
        />

        {!config.isConfigured && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
            This form is not connected to a ticket channel yet, so it cannot
            accept submissions. Set the channel and at least one route in the
            section settings.
          </p>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {config.routes.length > 1 && (
            <fieldset>
              <legend className="text-sm font-medium text-foreground">
                What kind of request is this?
              </legend>
              <div className="mt-3 space-y-2">
                {config.routes.map((route) => (
                  <label
                    key={route.value}
                    className="flex items-start gap-3 rounded-2xl border border-border p-3"
                  >
                    <input
                      type="radio"
                      name="route"
                      className="mt-1"
                      value={route.value}
                      checked={routeValue === route.value}
                      onChange={() => setRouteValue(route.value)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {route.label}
                      </span>
                      {route.description && (
                        <span className="block text-sm text-muted-foreground">
                          {route.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              {errors.route && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {errors.route}
                </p>
              )}
            </fieldset>
          )}

          <div className="space-y-2">
            <Label htmlFor="request-title">Summary</Label>
            <Input
              id="request-title"
              value={form.title}
              onChange={(event) => set("title")(event.target.value)}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <p className="text-sm text-destructive" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-description">What happened</Label>
            <Textarea
              id="request-description"
              rows={6}
              value={form.description}
              onChange={(event) => set("description")(event.target.value)}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          {tags.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="request-category">Category</Label>
              <select
                id="request-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.categoryTagId}
                onChange={(event) => set("categoryTagId")(event.target.value)}
              >
                <option value="">Not sure</option>
                {tags.map((tag) => (
                  <option key={tag._id} value={tag._id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="request-location">Location (optional)</Label>
            <Input
              id="request-location"
              value={form.location}
              onChange={(event) => set("location")(event.target.value)}
            />
          </div>

          {!customerId && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="request-name">Your name</Label>
                <Input
                  id="request-name"
                  value={form.name}
                  onChange={(event) => set("name")(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-email">Email</Label>
                <Input
                  id="request-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => set("email")(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-phone">Phone (optional)</Label>
                <Input
                  id="request-phone"
                  value={form.phone}
                  onChange={(event) => set("phone")(event.target.value)}
                />
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <Button type="submit" disabled={loading || !config.isConfigured}>
            {loading ? "Sending…" : "Send request"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default RequestFormSection;
