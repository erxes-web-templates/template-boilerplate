import { gql } from "@apollo/client";

// channelId, pipelineId and statusId are all required by the resolver, and
// none of them can be discovered from the client portal — listing channels,
// pipelines or statuses needs a staff login. They come from section config or
// env instead; see `lib/ticketConfig.ts`.
//
// The resolver optional-chains cpUser, falling back to the client portal's own
// id, so this succeeds for an anonymous visitor too. That has a consequence
// worth knowing: every anonymous ticket then shares one `createdBy`, so an
// anonymous submission can never be listed back — only opened by reference.
const CREATE_TICKET = gql`
  mutation CpCreateTicket(
    $name: String!
    $description: String
    $channelId: String!
    $pipelineId: String!
    $statusId: String!
    $priority: Int
    $tagIds: [String]
    $attachments: [AttachmentInput]
    $customerFieldData: JSON
    $propertiesData: JSON
  ) {
    cpCreateTicket(
      name: $name
      description: $description
      channelId: $channelId
      pipelineId: $pipelineId
      statusId: $statusId
      priority: $priority
      tagIds: $tagIds
      attachments: $attachments
      customerFieldData: $customerFieldData
      propertiesData: $propertiesData
    ) {
      _id
      number
      name
      createdAt
      status {
        _id
        name
        order
        type
      }
    }
  }
`;

// Lets a signed-in visitor reply on their own ticket. Unlike cpCreateTicket
// this resolver does NOT optional-chain cpUser, so it throws for an anonymous
// caller — gate it on being signed in.
const CREATE_TICKET_NOTE = gql`
  mutation CpTicketCreateNote($content: String, $contentId: String) {
    cpTicketCreateNote(content: $content, contentId: $contentId) {
      _id
      content
      createdBy
      createdAt
    }
  }
`;

const mutations = { CREATE_TICKET, CREATE_TICKET_NOTE };

export default mutations;
