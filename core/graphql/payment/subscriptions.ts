import { gql } from '@apollo/client';

export const invoice = gql`
  subscription invoiceUpdated($invoiceId: String!) {
    invoiceUpdated(_id: $invoiceId)
  }
`;

export const transaction = gql`
  subscription transactionUpdated($invoiceId: String!) {
    transactionUpdated(invoiceId: $invoiceId)
  }
`;

const subscriptions = {
  invoice,
  transaction
};

export default subscriptions;
