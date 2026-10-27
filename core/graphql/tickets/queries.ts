import { gql } from "@apollo/client";

// erxes Frontline tickets, reached through the Client Portal surface (cp*).
// These authenticate with the portal token plus, when someone is signed in,
// their client-auth-token. The staff-side getTickets/createTicket equivalents
// need a real staff login and are not reachable from a template.
//
// Two things about the ticket model shape the queries below:
//
//   * `status` is an OBJECT, not a string. Each pipeline carries its own copy
//     of erxes' default statuses, so always select `type` (an Int that is
//     stable across renames) rather than matching on `name`.
//   * `pipelineId` is what says which kind of request a ticket is, because a
//     template routes each request type to its own pipeline.

const TICKET_FIELDS = `
  _id
  number
  pipelineId
  name
  description
  state
  priority
  createdAt
  updatedAt
  statusChangedDate
  status {
    _id
    name
    order
    type
    color
  }
  tagIds
  customerFieldData
  propertiesData
  attachments {
    url
    name
    type
    size
  }
`;

// A visitor's own submissions.
//
// IMPORTANT: cpGetTickets does NOT scope to the caller. The resolver applies
// `createdBy` only when the filter carries it (and stamps the `cp:` prefix
// itself). Calling this without a createdBy returns EVERY ticket in the
// channel — every other visitor's submissions included. `useMyTickets` skips
// the query entirely until it knows who is asking; do not call it directly.
const MY_TICKETS_QUERY = gql`
  query CpGetTickets($filter: ICpTicketFilter) {
    cpGetTickets(filter: $filter) {
      ${TICKET_FIELDS}
    }
  }
`;

// Single ticket by id. Note this resolver has no scoping at all — anyone
// holding the id can read it. That is what makes the anonymous "track by
// link" flow possible, and also why a reference alone should be treated as
// a capability: do not surface ids in public listings.
const TICKET_DETAIL_QUERY = gql`
  query CpGetTicket($id: String!) {
    cpGetTicket(_id: $id) {
      ${TICKET_FIELDS}
    }
  }
`;

const TICKET_COUNT_QUERY = gql`
  query CpGetTicketTotalCount($filter: ICpTicketFilter) {
    cpGetTicketTotalCount(filter: $filter)
  }
`;

// Request categories live as erxes tags so the form can never offer a
// category the admin has not defined.
const TICKET_TAGS_QUERY = gql`
  query CpTags($type: String) {
    cpTags(type: $type) {
      _id
      name
      colorCode
      parentId
    }
  }
`;

// Staff replies on a ticket come back as notes, newest first.
const TICKET_NOTES_QUERY = gql`
  query CpTicketGetNotes($ticketId: String!) {
    cpTicketGetNotes(ticketId: $ticketId) {
      _id
      content
      createdBy
      createdAt
    }
  }
`;

const queries = {
  MY_TICKETS_QUERY,
  TICKET_DETAIL_QUERY,
  TICKET_COUNT_QUERY,
  TICKET_TAGS_QUERY,
  TICKET_NOTES_QUERY,
};

export default queries;
