import { gql } from "@apollo/client";

const productreviews = gql`
  query cpProductReviews(
    $productIds: [String]
    $customerId: String
    $page: Int
    $perPage: Int
  ) {
    cpProductReviews(
      productIds: $productIds
      customerId: $customerId
      page: $page
      perPage: $perPage
    ) {
      _id
      productId
      customerId
      review
      description
      info
    }
  }
`;

const wishlist = gql`
  query CpWishlist($customerId: String!) {
    cpWishlist(customerId: $customerId) {
      _id
      customerId
      product {
        _id
        name
        description
        unitPrice
        remainder
        attachment {
          url
        }
      }
    }
  }
`;

const queries = {
  productreviews,
  wishlist,
};

export default queries;
