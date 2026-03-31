import { gql } from "@apollo/client";

const customersMain = gql`
  query cpCustomers($ids: [String]) {
    cpCustomers(ids: $ids) {
      list {
        _id
        firstName
        lastName
        primaryEmail
        registrationNumber
        sex
      }
      totalCount
    }
  }
`;

const findCustomerByEmail = gql`
  query FindCustomerByEmail($email: String) {
    cpCustomers(searchValue: $email) {
      list {
        _id
        primaryEmail
      }
    }
  }
`;

const queries = { customersMain, findCustomerByEmail };
export default queries;
