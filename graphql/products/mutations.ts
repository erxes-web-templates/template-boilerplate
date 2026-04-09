import { gql } from '@apollo/client';

const wishlistAdd = gql`
  mutation CpWishlistAdd($productId: String!, $customerId: String!) {
    cpWishlistAdd(productId: $productId, customerId: $customerId) {
      _id
      productId
      customerId
    }
  }
`;

const wishlistRemove = gql`
  mutation CpWishlistRemove($id: String!) {
    cpWishlistRemove(_id: $id) {
      _id
    }
  }
`;

const addToLastView = gql`
  mutation CpLastViewedItemAdd($productId: String!, $customerId: String!) {
    cpLastViewedItemAdd(productId: $productId, customerId: $customerId) {
      _id
    }
  }
`;

const removeLastView = gql`
  mutation LastViewedItemRemove($id: String!) {
    lastViewedItemRemove(_id: $id) {
      _id
      productId
      customerId
    }
  }
`;
export const ReviewAdd = gql`
  mutation CpProductreviewAdd(
    $productId: String
    $customerId: String
    $review: Float
  ) {
    cpProductReviewAdd(
      productId: $productId
      customerId: $customerId
      review: $review
    ) {
      _id
      customerId
      productId
      review
    }
  }
`;
export const ReviewRemove = gql`
  mutation CpProductreviewRemove($id: String!) {
    cpProductReviewRemove(_id: $id) {
      _id
      review
    }
  }
`;
export const ReviewUpdate = gql`
  mutation CpProductreviewUpdate(
    $id: String!
    $productId: String
    $customerId: String
    $review: Float
  ) {
    cpProductReviewUpdate(
      _id: $id
      productId: $productId
      customerId: $customerId
      review: $review
    ) {
      _id
      review
    }
  }
`;

const mutations = {
  wishlistAdd,
  wishlistRemove,
  removeLastView,
  addToLastView,
  ReviewAdd,
  ReviewRemove,
  ReviewUpdate,
};

export default mutations;
