import { gql } from "@apollo/client";

const BM_ORDER_ADD = gql`
  mutation cpBmsOrderAdd($order: BmsOrderInput) {
    cpBmsOrderAdd(order: $order) {
      _id
      branchId
      customerId
      tourId
      amount
      status
      note
      numberOfPeople
      type
      additionalCustomers
      isChild
      parent
    }
  }
`;

const BM_ORDER_EDIT = gql`
  mutation cpBmsOrderEdit($id: String!, $order: BmsOrderInput) {
    cpBmsOrderEdit(_id: $id, order: $order) {
      _id
      status
      parent
    }
  }
`;

const mutations = { BM_ORDER_ADD, BM_ORDER_EDIT };
export default mutations;
