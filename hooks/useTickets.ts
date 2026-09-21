"use client";

import { useMutation, useQuery } from "@apollo/client";
import authQueries from "../graphql/auth/queries";
import { mutations, queries } from "../graphql/tickets";
import {
  byNewestFirst,
  toRequestView,
} from "../lib/ticketMapping";
import type { TicketConfig } from "../lib/ticketConfig";
import type {
  RequestView,
  Ticket,
  TicketNote,
  TicketTag,
} from "../types/tickets";

/**
 * The signed-in visitor's erxes customer id, or "" when nobody is signed in.
 *
 * cpCreateTicket stamps createdBy as `cp:<erxesCustomerId || _id ||
 * clientPortalId>`, so this is the same value the list query has to filter on.
 */
export const useCurrentCustomerId = (): { customerId: string; loading: boolean } => {
  const { data, loading } = useQuery(authQueries.currentUser, {
    fetchPolicy: "cache-first",
  });

  const user = data?.clientPortalCurrentUser;

  return {
    customerId: user?.erxesCustomerId || user?._id || "",
    loading,
  };
};

/**
 * The visitor's own requests.
 *
 * cpGetTickets does NOT scope to the caller — it applies createdBy only when
 * the filter carries it. Querying without one returns every ticket in the
 * channel, so this stays skipped until a customer id is known. That is a
 * privacy control, not an optimisation: do not relax the skip.
 */
export const useMyRequests = (config: TicketConfig) => {
  const { customerId, loading: userLoading } = useCurrentCustomerId();

  const { data, loading, error, refetch } = useQuery<{
    cpGetTickets: Ticket[] | null;
  }>(queries.MY_TICKETS_QUERY, {
    variables: {
      filter: {
        createdBy: customerId,
        channelId: config.channelId || undefined,
        perPage: 100,
      },
    },
    skip: !customerId,
    fetchPolicy: "cache-and-network",
  });

  const requests: RequestView[] = [...(data?.cpGetTickets ?? [])]
    .sort(byNewestFirst)
    .map(toRequestView);

  return {
    requests,
    // Signed out is not an error — it is the anonymous path.
    isSignedIn: Boolean(customerId),
    loading: userLoading || loading,
    error,
    refetch,
  };
};

/** A single request. Works signed out, which is what makes tracking possible. */
export const useRequest = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{
    cpGetTicket: Ticket | null;
  }>(queries.TICKET_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });

  const ticket = data?.cpGetTicket ?? null;

  return {
    request: ticket ? toRequestView(ticket) : null,
    loading,
    error,
    refetch,
  };
};

/** A 24-character hex string, i.e. a Mongo id rather than a ticket number. */
const looksLikeId = (value: string) => /^[a-f0-9]{24}$/i.test(value.trim());

/**
 * Resolve a request from whatever the visitor pasted — an id from a tracking
 * link, or the reference number off their confirmation.
 *
 * The reference path goes through cpGetTickets' `searchValue`, which the
 * resolver turns into `{$or: [{name: regex}, {number: regex}]}`. Two
 * consequences drive the code below:
 *
 *   * It is a REGEX, not an exact match. Searching "REQ" would return every
 *     request whose number starts that way, so the result is re-checked for an
 *     exact, case-insensitive match on `number` and anything ambiguous is
 *     rejected rather than guessed at.
 *   * It is not scoped to the caller. That is what makes anonymous tracking
 *     possible at all, but it also means a reference is effectively a secret:
 *     anyone holding one can read that request. Keep references out of public
 *     listings, and do not shorten them.
 */
export const useRequestByIdOrReference = (value: string, config: TicketConfig) => {
  const trimmed = (value ?? "").trim();
  const isId = looksLikeId(trimmed);

  const byId = useQuery<{ cpGetTicket: Ticket | null }>(
    queries.TICKET_DETAIL_QUERY,
    { variables: { id: trimmed }, skip: !trimmed || !isId },
  );

  const bySearch = useQuery<{ cpGetTickets: Ticket[] | null }>(
    queries.MY_TICKETS_QUERY,
    {
      variables: {
        filter: {
          searchValue: trimmed,
          channelId: config.channelId || undefined,
          perPage: 25,
        },
      },
      skip: !trimmed || isId,
    },
  );

  let ticket: Ticket | null = null;

  if (isId) {
    ticket = byId.data?.cpGetTicket ?? null;
  } else {
    const matches = (bySearch.data?.cpGetTickets ?? []).filter(
      (candidate) =>
        (candidate.number ?? "").trim().toLowerCase() === trimmed.toLowerCase(),
    );
    // Exactly one exact match, or nothing. A partial reference must not open
    // somebody else's request.
    ticket = matches.length === 1 ? matches[0] : null;
  }

  const loading = isId ? byId.loading : bySearch.loading;

  return {
    request: ticket ? toRequestView(ticket) : null,
    loading,
    notFound: !loading && Boolean(trimmed) && !ticket,
    error: isId ? byId.error : bySearch.error,
  };
};

/** Staff replies, and the visitor's own, as ticket notes. */
export const useRequestNotes = (ticketId: string) => {
  const { data, loading, refetch } = useQuery<{
    cpTicketGetNotes: TicketNote[] | null;
  }>(queries.TICKET_NOTES_QUERY, {
    variables: { ticketId },
    skip: !ticketId,
  });

  return { notes: data?.cpTicketGetNotes ?? [], loading, refetch };
};

/** Categories, as erxes tags, so the form offers exactly what admin defined. */
export const useTicketTags = (tagType: string) => {
  const { data, loading } = useQuery<{ cpTags: TicketTag[] | null }>(
    queries.TICKET_TAGS_QUERY,
    { variables: { type: tagType }, skip: !tagType },
  );

  return { tags: data?.cpTags ?? [], loading };
};

export type SubmitRequestInput = {
  title: string;
  description: string;
  /** Which configured route (and so which pipeline) this belongs to. */
  routeValue: string;
  categoryTagId?: string;
  priority?: number;
  attachments?: { url: string; name: string; type?: string; size?: number }[];
  /** Contact details and anything else the form collected. */
  extra?: Record<string, unknown>;
};

export type SubmitResult = {
  ok: boolean;
  id?: string;
  reference?: string;
  message?: string;
};

export const useSubmitRequest = (config: TicketConfig) => {
  const [mutate, state] = useMutation(mutations.CREATE_TICKET);

  const submit = async (input: SubmitRequestInput): Promise<SubmitResult> => {
    const route =
      config.routes.find((r) => r.value === input.routeValue) ??
      config.routes[0];

    if (!config.isConfigured || !route) {
      return {
        ok: false,
        message:
          "This form is not connected yet. Set the ticket channel and pipeline in the site settings.",
      };
    }

    try {
      const { data } = await mutate({
        variables: {
          name: input.title,
          description: input.description,
          channelId: config.channelId,
          pipelineId: route.pipelineId,
          statusId: route.statusId,
          priority: input.priority,
          tagIds: input.categoryTagId ? [input.categoryTagId] : undefined,
          attachments: input.attachments?.length ? input.attachments : undefined,
          // customerFieldData is the template's own store — it persists
          // whatever we put in it. propertiesData is silently dropped for any
          // key without a matching erxes field definition, so the values live
          // here and are mirrored there only as a convenience for staff.
          customerFieldData: {
            requestType: route.value,
            requestTypeLabel: route.label,
            ...(input.extra ?? {}),
          },
          propertiesData: input.extra ?? {},
        },
      });

      const created = data?.cpCreateTicket;
      return {
        ok: true,
        id: created?._id,
        reference: created?.number ?? created?._id?.slice(-8)?.toUpperCase(),
      };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong sending your request.",
      };
    }
  };

  return { submit, loading: state.loading };
};

/**
 * Reply on a request. cpTicketCreateNote does not optional-chain cpUser, so it
 * throws for an anonymous caller — callers must gate on being signed in.
 */
export const useReplyToRequest = () => {
  const [mutate, state] = useMutation(mutations.CREATE_TICKET_NOTE);

  const reply = async (ticketId: string, content: string) => {
    try {
      await mutate({ variables: { contentId: ticketId, content } });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Reply failed.",
      };
    }
  };

  return { reply, loading: state.loading };
};
