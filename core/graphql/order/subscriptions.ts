import { gql } from '@apollo/client';

const ordersOrdered = gql`
  subscription ordersOrdered(
    $statuses: [String]
    $customerId: String
    $token: String
  ) {
    ordersOrdered(
      statuses: $statuses
      customerId: $customerId
      posToken: $token
    ) {
      _id
    }
  }
`;

const subscriptions = { ordersOrdered };

export default subscriptions;
