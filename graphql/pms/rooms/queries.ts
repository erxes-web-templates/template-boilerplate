import { gql } from "@apollo/client";

const cpTags = gql`
  query RoomTags($searchValue: String, $type: String) {
    cpTags(searchValue: $searchValue, type: $type) {
      _id
      name
    }
  }
`;

const rooms = gql`
  query rooms(
    $pipelineId: String
    $boardId: String
    $categoryId: String
    $perPage: Int
    $page: Int
  ) {
    products(
      pipelineId: $pipelineId
      boardId: $boardId
      categoryId: $categoryId
      perPage: $perPage
      page: $page
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
