import { gql } from '@apollo/client';

const customerAdd = gql`
  mutation customersAdd(
    $firstName: String
    $lastName: String
    $primaryEmail: String
    $primaryPhone: String
  ) {
    customersAdd(
      firstName: $firstName
      lastName: $lastName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
    ) {
      _id
    }
  }
`;

const mutations = { customerAdd };
export default mutations;
