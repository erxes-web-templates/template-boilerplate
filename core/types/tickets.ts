// erxes Frontline ticket shapes, as returned through the client portal.

export type TicketStatus = {
  _id: string;
  name?: string | null;
  order?: number | null;
  /** Stable lifecycle marker. Prefer this over `name`, which admins rename. */
  type?: number | null;
  color?: string | null;
};

export type TicketAttachment = {
  url: string;
  name?: string | null;
  type?: string | null;
  size?: number | null;
};

export type Ticket = {
  _id: string;
  number?: string | null;
  pipelineId?: string | null;
  name?: string | null;
  description?: string | null;
  state?: string | null;
  priority?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  statusChangedDate?: string | null;
  status?: TicketStatus | null;
  tagIds?: string[] | null;
  customerFieldData?: Record<string, unknown> | null;
  propertiesData?: Record<string, unknown> | null;
  attachments?: TicketAttachment[] | null;
};

export type TicketNote = {
  _id: string;
  content?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
};

export type TicketTag = {
  _id: string;
  name?: string | null;
  colorCode?: string | null;
  parentId?: string | null;
};

/** The lifecycle a request moves through, in order. */
export type RequestStage =
  | "new"
  | "open"
  | "inProgress"
  | "resolved"
  | "closed"
  | "cancelled";

/** A ticket flattened into what a template actually renders. */
export type RequestView = {
  _id: string;
  reference: string;
  title: string;
  description: string;
  stage: RequestStage;
  statusLabel: string;
  statusColor?: string;
  category?: string;
  categoryTagIds: string[];
  createdAt?: string;
  updatedAt?: string;
  attachments: TicketAttachment[];
  /** Values the template stored itself, under customerFieldData. */
  extra: Record<string, unknown>;
};
