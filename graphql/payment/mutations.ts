import { gql } from '@apollo/client';

const createInvoice = gql`
  mutation CpInvoiceCreate($input: InvoiceInput!) {
    cpInvoiceCreate(input: $input) {
      _id
      invoiceNumber
      amount
      remainingAmount
      phone
      email
      description
      status
      data
      contentTypeId
      transactions {
        _id
        paymentId
        paymentKind
        status
        details
        response
      }
    }
  }
`;

const invoiceCreate = createInvoice;

export const addTransaction = gql`
  mutation CpPaymentTransactionsAdd($input: PaymentTransactionInput!) {
    cpPaymentTransactionsAdd(input: $input) {
      _id
      amount
      invoiceId
      paymentId
      paymentKind
      status
      response
      details
    }
  }
`;

const transactionsAdd = addTransaction;

const checkInvoice = gql`
  mutation InvoicesCheck($id: String!) {
    invoicesCheck(_id: $id)
  }
`;

const mutations = {
  createInvoice,
  invoiceCreate,
  addTransaction,
  transactionsAdd,
  checkInvoice,
};

export default mutations;
