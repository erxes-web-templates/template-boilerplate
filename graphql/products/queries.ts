import { gql } from "@apollo/client";
import orderQueries from "../order/queries";

const commonFields = `
  _id
  name
  code

`;

const productCategories = gql`
  query cpPoscProductCategories ($parentId: String, $searchValue: String, $excludeEmpty: Boolean, $meta: String, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
    cpPoscProductCategories(parentId: $parentId, searchValue: $searchValue, excludeEmpty: $excludeEmpty, meta: $meta, page: $page, perPage: $perPage, sortField: $sortField, sortDirection: $sortDirection) {
      ${commonFields}
      order
      parentId
      attachment {
        url
      }
    }
  }
`;

const products = gql`
  query cpPoscProducts(
    $searchValue: String,
    $tag: String
    $ids: [String]
    $type: String,
    $categoryId: String,
    $page: Int,
    $perPage: Int,
    $isKiosk: Boolean,
    $groupedSimilarity: String
    $sortField: String
    $sortDirection: Int
    ) {
    cpPoscProducts(
      searchValue: $searchValue, 
      tag: $tag
      ids: $ids
      categoryId: $categoryId, 
      type: $type, 
      page: $page, 
      perPage: $perPage, 
      isKiosk: $isKiosk, 
      groupedSimilarity: $groupedSimilarity
      sortField: $sortField
      sortDirection: $sortDirection
    )  {
      ${commonFields}
      category {
        name
        _id
      }
      unitPrice
      type
      description
      remainder
      tagIds
      hasSimilarity
      attachment {
        url
      }
    }
  }
`;

const productsByTag = gql`
  query productsByTag($tag: String) {
    cpPoscProducts(tag: $tag) {
      _id
    }
  }
`;

const productsMeta = gql`
  query CpPoscProductsMeta($perPage: Int) {
    cpPoscProducts(perPage: $perPage, isKiosk: true) {
      _id
      modifiedAt
    }
  }
`;

const productSimilarities = gql`
  query CpPoscProductSimilarities($id: String!, $groupedSimilarity: String) {
    cpPoscProductSimilarities(_id: $id, groupedSimilarity: $groupedSimilarity) {
      products {
        _id
        description
        unitPrice
        name
        attachment {
          url
        }
        customFieldsData
      }
      groups {
        fieldId
        title
      }
    }
  }
`;

const productsCount = gql`
  query productsCount(
    $categoryId: String
    $type: String
    $searchValue: String
    $groupedSimilarity: String
    $isKiosk: Boolean
  ) {
    cpPoscProductsTotalCount(
      categoryId: $categoryId
      type: $type
      searchValue: $searchValue
      groupedSimilarity: $groupedSimilarity
      isKiosk: $isKiosk
    )
  }
`;

const getPriceInfo = gql`
  query getPriceInfo($productId: String!) {
    getPriceInfo(productId: $productId)
  }
`;

const getInitialCategory = gql`
  query InitialCategory($_id: String) {
    cpPoscProductCategoryDetail(_id: $_id) {
      _id
      name
      attachment {
        url
      }
    }
  }
`;

const getKioskCategory = getInitialCategory;

const productDetail = gql`
  query CpPoscProductDetail($_id: String) {
    cpPoscProductDetail(_id: $_id) {
      _id
      name
      description
      code
      type
      createdAt
      unitPrice
      remainder
      category {
        order
        name
        _id
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

const productReview = gql`
  query CpProductreview($productId: String!) {
    cpProductReview(productId: $productId) {
      average
      length
      productId
    }
  }
`;

const getLastProductView = orderQueries.getLastProductView;

const getProductReviews = gql`
  query CpProductreviews($productIds: [String], $customerId: String) {
    cpProductReviews(productIds: $productIds, customerId: $customerId) {
      _id
      customerId
      review
    }
  }
`;

const getProductAverageReview = productReview;

const msdProductsRemainder = gql`
  query msdProductsRemainder($posToken: String, $productCodes: [String]) {
    msdProductsRemainder(posToken: $posToken, productCodes: $productCodes)
  }
`;

const queries = {
  productCategories,
  products,
  productsCount,
  productSimilarities,
  productDetail,
  productsMeta,
  productReview,
  getLastProductView,
  getProductAverageReview,
  getProductReviews,
  msdProductsRemainder,
  productsByTag,
};
export default queries;
