import { gql } from '@apollo/client';

const customers = gql`
  query customers(
    $page: Int
    $perPage: Int
    $searchValue: String
    $ids: [String]
  ) {
    customers(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      ids: $ids
    ) {
      _id
      firstName
      lastName
      primaryEmail
      emails
      primaryPhone
      phones
    }
  }
`;

const queries = { customers };
export default queries;
