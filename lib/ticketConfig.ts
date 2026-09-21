import { getEnv } from "./utils";

/**
 * Where a submitted request lands in erxes Frontline.
 *
 * `cpCreateTicket` requires channelId, pipelineId and statusId, and none of
 * the three can be discovered from the client portal — cpGetChannels and
 * friends all need a staff login. So they have to be configured.
 *
 * Two sources, in order:
 *   1. `section.config` set in the web builder — the surface a site admin can
 *      actually reach, so it wins.
 *   2. `NEXT_PUBLIC_ERXES_TICKET_*` env, for a template deployed by hand.
 *
 * Run the ids down with a staff account in erxes admin → Frontline → Ticket
 * settings; the pipeline's own status list gives the "new" statusId.
 */

export type TicketRoute = {
  /** Label the visitor picks, e.g. "Complaint". */
  label: string;
  /** Value stored on the ticket so we can read the kind back. */
  value: string;
  pipelineId: string;
  statusId: string;
  description?: string;
};

export type TicketConfig = {
  channelId: string;
  routes: TicketRoute[];
  /** erxes tag type that holds the category list. */
  tagType: string;
  /** True when a submission would actually reach erxes. */
  isConfigured: boolean;
};

const DEFAULT_TAG_TYPE = "frontline:ticket";

type RawRoute = Partial<TicketRoute> & Record<string, unknown>;

const readRoutes = (raw: unknown): TicketRoute[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry: RawRoute, index: number) => ({
      label: String(entry?.label ?? `Request ${index + 1}`),
      value: String(entry?.value ?? entry?.label ?? `type-${index}`),
      pipelineId: String(entry?.pipelineId ?? ""),
      statusId: String(entry?.statusId ?? ""),
      description: entry?.description ? String(entry.description) : undefined,
    }))
    .filter((route) => route.pipelineId && route.statusId);
};

/**
 * A single pipeline configured through env, used when the builder config has
 * no routes of its own. Kept as one route rather than four so an unconfigured
 * template degrades to "one kind of request" instead of none.
 */
const envRoute = (): TicketRoute[] => {
  const env = getEnv();
  const pipelineId =
    process.env.NEXT_PUBLIC_ERXES_TICKET_PIPELINE_ID ||
    env.NEXT_PUBLIC_ERXES_TICKET_PIPELINE_ID ||
    "";
  const statusId =
    process.env.NEXT_PUBLIC_ERXES_TICKET_STATUS_ID ||
    env.NEXT_PUBLIC_ERXES_TICKET_STATUS_ID ||
    "";

  if (!pipelineId || !statusId) return [];

  return [{ label: "Request", value: "request", pipelineId, statusId }];
};

export const getTicketConfig = (config?: Record<string, unknown>): TicketConfig => {
  const env = getEnv();

  const channelId = String(
    config?.channelId ||
      process.env.NEXT_PUBLIC_ERXES_TICKET_CHANNEL_ID ||
      env.NEXT_PUBLIC_ERXES_TICKET_CHANNEL_ID ||
      "",
  );

  const routes = readRoutes(config?.routes);
  const resolved = routes.length ? routes : envRoute();

  return {
    channelId,
    routes: resolved,
    tagType: String(config?.tagType || DEFAULT_TAG_TYPE),
    // Short of a channel and one complete route, submitting would post an
    // invalid ticket — the form shows a configuration notice instead.
    isConfigured: Boolean(channelId && resolved.length),
  };
};

/** Which kind of request a ticket is: the pipeline it sits in says so. */
export const routeByPipeline = (
  routes: TicketRoute[],
): Record<string, TicketRoute> =>
  Object.fromEntries(routes.map((route) => [route.pipelineId, route]));
