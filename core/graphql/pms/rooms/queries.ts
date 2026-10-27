import { gql } from "@apollo/client";

const cpTags = gql`
  query RoomTags(
    $type: String
    $searchValue: String
    $parentId: String
    $ids: [String]
    $excludeIds: Boolean
    $isGroup: Boolean
    $instanceId: String
    $includeWorkspaceTags: Boolean
  ) {
    cpTags(
      type: $type
      searchValue: $searchValue
      parentId: $parentId
      ids: $ids
      excludeIds: $excludeIds
      isGroup: $isGroup
      instanceId: $instanceId
      includeWorkspaceTags: $includeWorkspaceTags
    ) {
      _id
      name
    }
  }
`;

const rooms = gql`
  query CpRooms(
    $ids: [String]
    $categoryId: String
    $tag: String
    $searchValue: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $tagIds: [String]
  ) {
    cpProducts(
      ids: $ids
      categoryId: $categoryId
      tag: $tag
      searchValue: $searchValue
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      tagIds: $tagIds
    ) {
      _id
      name
      type
      code
      status
      unitPrice
      categoryId
      category {
        _id
        code
        name
        order
        description
      }
      uom
      description
      attachment {
        url
        name
        size
        type
      }
      attachmentMore {
        url
        name
        size
        type
      }
    }
  }
`;

const roomCategories = gql`
  query roomCategories($parentId: String) {
    productCategories(parentId: $parentId) {
      _id
      code
      name
      order
      description
      attachment {
        url
      }
    }
  }
`;

const checkRooms = gql`
  query CpPmsCheckRooms(
    $pipelineId: String!
    $endDate: Date
    $startDate: Date
    $ids: [String]
  ) {
    cpPmsCheckRooms(
      pipelineId: $pipelineId
      endDate: $endDate
      startDate: $startDate
      ids: $ids
    ) {
      _id
      name
      type
      code
      status
      unitPrice
      categoryId
      uom
      description
      attachment {
        url
        name
        size
        type
      }
      attachmentMore {
        url
        name
        size
        type
      }
      category {
        _id
        code
        name
        order
        description
      }
    }
  }
`;

const cpProducts = gql`
  query CpProducts(
    $ids: [String]
    $categoryId: String
    $tag: String
    $searchValue: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $tagIds: [String]
  ) {
    cpProducts(
      ids: $ids
      categoryId: $categoryId
      tag: $tag
      searchValue: $searchValue
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      tagIds: $tagIds
    ) {
      _id
      name
      code
      description
      unitPrice
      categoryId
      category {
        _id
        name
      }
      attachment {
        url
      }
      attachmentMore {
        url
      }
    }
  }
`;

const queries = { rooms, roomCategories, checkRooms, cpProducts, cpTags };
export default queries;
