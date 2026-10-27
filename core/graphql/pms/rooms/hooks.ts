"use client";

import { useQuery, type QueryHookOptions } from "@apollo/client";
import queries from "./queries";
import type { RoomsData, RoomsVariables, TagsData, TagsVariables } from "./types";

export const useRoomsQuery = (options?: QueryHookOptions<RoomsData, RoomsVariables>) =>
  useQuery<RoomsData, RoomsVariables>(queries.cpProducts, options);

export const useTagsQuery = (options?: QueryHookOptions<TagsData, TagsVariables>) =>
  useQuery<TagsData, TagsVariables>(queries.cpTags, options);
