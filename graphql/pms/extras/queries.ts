import { gql } from "@apollo/client";

const uoms = gql`
  query uoms {
    uoms {
      _id
      name
      code
      isForSubscription
    }
  }
`;

const extras = gql`
  query Extras(
    $categoryId: String
    $searchValue: String
    $perPage: Int
    $page: Int
    $ids: [String]
  ) {
    products(
      type: "product"
      categoryId: $categoryId
      searchValue: $searchValue
      perPage: $perPage
      page: $page
      ids: $ids
    ) {
      _id
      name
      unitPrice
    }
  }
`;

const categories = gql`
  query ProductCategories($parentId: String, $withChild: Boolean) {
    cpProductCategories(parentId: $parentId, withChild: $withChild) {
      _id
      code
      name
      order
    }
  }
`;

const queries = { uoms, extras, categories };
export default queries;
