import { gql } from "@apollo/client";

const incrementViewCount = gql`
  mutation CpPostsIncrementViewCount($id: String!) {
    cpPostsIncrementViewCount(_id: $id)
  }
`;

const mutations = {
  incrementViewCount,
};

export default mutations;
