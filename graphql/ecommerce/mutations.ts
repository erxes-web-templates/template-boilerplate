import { gql } from '@apollo/client';

const productReviewAdd = gql`
  mutation cpProductReviewAdd(
    $productId: String
    $customerId: String
    $review: Float
    $description: String
    $info: JSON
  ) {
    cpProductReviewAdd(
      productId: $productId
      customerId: $customerId
      review: $review
      description: $description
      info: $info
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

const productReviewUpdate = gql`
  mutation cpProductReviewUpdate(
    $_id: String!
    $productId: String
    $customerId: String
    $review: Float
    $description: String
    $info: JSON
  ) {
    cpProductReviewUpdate(
      _id: $_id
      productId: $productId
      customerId: $customerId
      review: $review
      description: $description
      info: $info
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

const productReviewRemove = gql`
  mutation cpProductReviewRemove($_id: String!) {
    cpProductReviewRemove(_id: $_id)
  }
`;

const mutations = {
  productReviewAdd,
  productReviewUpdate,
  productReviewRemove,
};

export default mutations;
