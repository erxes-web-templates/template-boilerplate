type Maybe<T> = T | null | undefined;

export type Attachment = {
  url?: Maybe<string>;
};

export interface RoomCategory {
  _id: string;
  name?: Maybe<string>;
}

export interface RoomSummary {
  _id: string;
  name?: Maybe<string>;
  code?: Maybe<string>;
  description?: Maybe<string>;
  unitPrice?: Maybe<number>;
  categoryId?: Maybe<string>;
  category?: Maybe<RoomCategory>;
  attachment?: Maybe<Attachment>;
  attachmentMore?: Maybe<Attachment[]>;
}

export interface RoomsVariables {
  ids?: string[];
  categoryId?: string;
  tag?: string;
  searchValue?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export interface RoomsData {
  cpProducts: RoomSummary[];
}

export interface RoomTag {
  _id: string;
  name: string;
}

export interface TagsData {
  cpTags: RoomTag[];
}

export interface TagsVariables {
  type?: string;
  searchValue?: string;
  parentId?: string;
  ids?: string[];
  excludeIds?: boolean;
  isGroup?: boolean;
  instanceId?: string;
  includeWorkspaceTags?: boolean;
}
