// erxes Ticket -> RequestView. Kept free of "use client" so server components
// can map a ticket too.
import type {
  RequestStage,
  RequestView,
  Ticket,
  TicketStatus,
} from "../types/tickets";

/**
 * erxes stamps every status with a numeric `type` (TICKET_STATUS_TYPES in
 * frontline_api). Mapping on it is what makes the template survive an admin
 * renaming "in progress" to something else in their own language.
 */
export const STAGE_BY_STATUS_TYPE: Record<number, RequestStage> = {
  1: "new",
  2: "open",
  3: "inProgress",
  4: "resolved",
  5: "closed",
  6: "cancelled",
};

/** erxes' default statuses, ordered 0..5. Last-resort fallback only. */
export const STAGE_BY_ORDER: RequestStage[] = [
  "new",
  "open",
  "inProgress",
  "resolved",
  "closed",
  "cancelled",
];

const STAGE_BY_NAME: Record<string, RequestStage> = {
  new: "new",
  open: "open",
  "in progress": "inProgress",
  inprogress: "inProgress",
  resolved: "resolved",
  closed: "closed",
  cancelled: "cancelled",
  canceled: "cancelled",
};

/** The track a request visibly travels. Cancelled is terminal and off it. */
export const STAGE_TRACK: RequestStage[] = [
  "new",
  "open",
  "inProgress",
  "resolved",
];

export const toStage = (status?: TicketStatus | null): RequestStage => {
  if (status?.type != null && STAGE_BY_STATUS_TYPE[status.type]) {
    return STAGE_BY_STATUS_TYPE[status.type];
  }

  const byName = status?.name
    ? STAGE_BY_NAME[status.name.trim().toLowerCase()]
    : undefined;
  if (byName) return byName;

  return STAGE_BY_ORDER[status?.order ?? 0] ?? "new";
};

/** Nothing further is expected to happen on these. */
export const isSettled = (stage: RequestStage): boolean =>
  stage === "resolved" || stage === "closed" || stage === "cancelled";

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value ? value : undefined;

export const toRequestView = (ticket: Ticket): RequestView => {
  const extra = (ticket.customerFieldData ?? {}) as Record<string, unknown>;

  return {
    _id: ticket._id,
    // erxes' own ticket number is the reference a visitor quotes. Fall back to
    // a short slice of the id so a reference is never blank.
    reference: ticket.number || ticket._id.slice(-8).toUpperCase(),
    title: ticket.name ?? "",
    description: ticket.description ?? "",
    stage: toStage(ticket.status),
    statusLabel: ticket.status?.name ?? "",
    statusColor: ticket.status?.color ?? undefined,
    category: str(extra.category),
    categoryTagIds: ticket.tagIds ?? [],
    createdAt: ticket.createdAt ?? undefined,
    updatedAt: ticket.statusChangedDate ?? ticket.updatedAt ?? undefined,
    attachments: ticket.attachments ?? [],
    extra,
  };
};

/**
 * cpGetTickets ignores sortField/sortDirection — the resolver hands the filter
 * to defaultPaginate, which only reads {ids, page, perPage, excludeIds}. So
 * ordering is ours to do.
 */
export const byNewestFirst = (a: Ticket, b: Ticket): number =>
  (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
