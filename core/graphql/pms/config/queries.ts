import { gql } from "@apollo/client";

const CpPmsBranchList = gql`
  query CpPmsBranchList($page: Int, $perPage: Int) {
    cpPmsBranchList(page: $page, perPage: $perPage) {
      _id
      createdAt
      userId
      name
      description
      user1Ids
      user2Ids
      user3Ids
      user4Ids
      user5Ids
      paymentIds
      paymentTypes
      departmentId
      token
      erxesAppToken
      permissionConfig
      uiOptions
      pipelineConfig
      extraProductCategories
      roomCategories
      time
      discount
      checkintime
      checkouttime
      user {
        _id
        details {
          fullName
        }
      }
    }
  }
`;

const CpPmsBranchDetail = gql`
  query CpPmsBranchDetail($id: String!) {
    cpPmsBranchDetail(_id: $id) {
      _id
      createdAt
      userId
      user {
        _id
        isOwner
        details {
          fullName
          avatar
        }
      }
      name
      description
      user1Ids
      user2Ids
      user3Ids
      user4Ids
      user5Ids
      paymentIds
      paymentTypes
      departmentId
      token
      erxesAppToken
      permissionConfig
      uiOptions
      pipelineConfig
      extraProductCategories
      roomCategories
      time
      discount
      checkintime
      checkouttime
    }
  }
`;

const queries = { CpPmsBranchList, CpPmsBranchDetail };
export default queries;
