import { gql } from "@apollo/client";

// Web Pages
const webPageAdd = gql`
  mutation CpWebPagesAdd($input: WebPageInput!) {
    cpWebPagesAdd(input: $input) {
      _id
      name
      slug
    }
  }
`;

const webPageEdit = gql`
  mutation CpWebPagesEdit($id: String!, $input: WebPageInput!) {
    cpWebPagesEdit(_id: $id, input: $input) {
      _id
      name
      slug
    }
  }
`;

const webPageRemove = gql`
  mutation CpWebPagesRemove($id: String!) {
    cpWebPagesRemove(_id: $id)
  }
`;

// Web Posts
const webPostAdd = gql`
  mutation CpWebPostsAdd($input: WebPostInput!) {
    cpWebPostsAdd(input: $input) {
      _id
      title
      slug
    }
  }
`;

const webPostEdit = gql`
  mutation CpWebPostsEdit($id: String!, $input: WebPostInput!) {
    cpWebPostsEdit(_id: $id, input: $input) {
      _id
      title
      slug
    }
  }
`;

const webPostRemove = gql`
  mutation CpWebPostsRemove($id: String!) {
    cpWebPostsRemove(_id: $id)
  }
`;

const webPostChangeStatus = gql`
  mutation CpWebPostsChangeStatus($id: String!, $status: WebPostStatus!) {
    cpWebPostsChangeStatus(_id: $id, status: $status) {
      _id
      status
    }
  }
`;

const webPostToggleFeatured = gql`
  mutation CpWebPostsToggleFeatured($id: String!) {
    cpWebPostsToggleFeatured(_id: $id) {
      _id
      featured
    }
  }
`;

// Web Menus
const webMenuAdd = gql`
  mutation CpWebAddMenu($input: WebMenuItemInput!) {
    cpWebAddMenu(input: $input) {
      _id
      label
      url
    }
  }
`;

const webMenuEdit = gql`
  mutation CpWebEditMenu($id: String!, $input: WebMenuItemInput!) {
    cpWebEditMenu(_id: $id, input: $input) {
      _id
      label
      url
    }
  }
`;

const webMenuRemove = gql`
  mutation CpWebRemoveMenu($id: String!) {
    cpWebRemoveMenu(_id: $id)
  }
`;

const mutations = {
  webPageAdd,
  webPageEdit,
  webPageRemove,
  webPostAdd,
  webPostEdit,
  webPostRemove,
  webPostChangeStatus,
  webPostToggleFeatured,
  webMenuAdd,
  webMenuEdit,
  webMenuRemove,
};

export default mutations;
