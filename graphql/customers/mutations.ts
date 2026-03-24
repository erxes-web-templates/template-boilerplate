import { gql } from "@apollo/client";

const addCpUser = gql`
  mutation clientPortalUsersInvite(
    $firstName: String
    $lastName: String
    $email: String
    $phone: String
    $type: String
    $clientPortalId: String
    $disableVerificationMail: Boolean
    $password: String
  ) {
    clientPortalUsersInvite(
      firstName: $firstName
      lastName: $lastName
      email: $email
      phone: $phone
      type: $type
      clientPortalId: $clientPortalId
      disableVerificationMail: $disableVerificationMail
      password: $password
    ) {
      _id
      firstName
      lastName
      email
      phone
      erxesCustomerId
    }
  }
`;

const addCustomer = gql`
  mutation customersAdd(
    $firstName: String
    $lastName: String
    $primaryEmail: String
    $primaryPhone: String
    $registrationNumber: String
    $state: String
    $sex: Int
  ) {
    customersAdd(
      firstName: $firstName
      lastName: $lastName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
      registrationNumber: $registrationNumber
      state: $state
      sex: $sex
    ) {
      _id
    }
  }
`;

const editCustomer = gql`
  mutation CustomersEdit(
    $id: String!
    $registrationNumber: String
    $sex: Int
  ) {
    customersEdit(
      _id: $id
      registrationNumber: $registrationNumber
      sex: $sex
    ) {
      _id
    }
  }
`;

const customersChangeState = gql`
  mutation customersChangeState($_id: String!, $value: String!) {
    customersChangeState(_id: $_id, value: $value) {
      _id
    }
  }
`;

const mutations = { addCpUser, addCustomer, editCustomer, customersChangeState };
export default mutations;
