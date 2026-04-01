import { gql } from "@apollo/client";

const commonFields = `
  $name: String
  $paymentsData: JSON
  $productsData: JSON
  $stageId: String
  $assignedUserIds: [String]
  $startDate: Date
  $closeDate: Date
  $description: String
`;

const commonParams = `
  name: $name
  paymentsData: $paymentsData
  productsData: $productsData
  stageId: $stageId
  assignedUserIds: $assignedUserIds
  startDate: $startDate
  closeDate: $closeDate
  description: $description
`;

const dealsAdd = gql`
  mutation DealsAdd(${commonFields} $customerIds: [String] $companyIds: [String] $labelIds: [String], $tagIds: [String]) {
    dealsAdd(${commonParams} customerIds: $customerIds companyIds: $companyIds labelIds: $labelIds, tagIds: $tagIds) {
      _id
    }
  }
`;

const dealsEdit = gql`
  mutation DealsEdit($id: String!, ${commonFields}, $tagIds: [String]) {
    dealsEdit(
      _id: $id
      tagIds: $tagIds
      ${commonParams}
    ) {
      _id
    }
  }
`;

const changeLabel = gql`
  mutation salesPipelineLabelsLabel(
    $pipelineId: String!
    $targetId: String!
    $labelIds: [String!]!
  ) {
    salesPipelineLabelsLabel(
      pipelineId: $pipelineId
      targetId: $targetId
      labelIds: $labelIds
    )
  }
`;

const conformityEdit = gql`
  mutation conformityEdit(
    $mainType: String
    $mainTypeId: String
    $relType: String
    $relTypeIds: [String]
  ) {
    conformityEdit(
      mainType: $mainType
      mainTypeId: $mainTypeId
      relType: $relType
      relTypeIds: $relTypeIds
    ) {
      success
    }
  }
`;

const addPayment = gql`
  mutation AddPayment(
    $id: String!
    $proccessId: String
    $paymentsData: JSON
    $stageId: String
  ) {
    dealsEdit(
      _id: $id
      proccessId: $proccessId
      paymentsData: $paymentsData
      stageId: $stageId
    ) {
      _id
    }
  }
`;

const changeDeal = gql`
  mutation dealsChange(
    $itemId: String!
    $aboveItemId: String
    $destinationStageId: String!
    $sourceStageId: String
    $proccessId: String
  ) {
    dealsChange(
      itemId: $itemId
      aboveItemId: $aboveItemId
      destinationStageId: $destinationStageId
      sourceStageId: $sourceStageId
      proccessId: $proccessId
    ) {
      _id
      __typename
    }
  }
`;

const addLabel = gql`
  mutation salesPipelineLabelsAdd(
    $name: String!
    $colorCode: String!
    $pipelineId: String!
  ) {
    salesPipelineLabelsAdd(
      name: $name
      colorCode: $colorCode
      pipelineId: $pipelineId
    ) {
      _id
      __typename
    }
  }
`;

const addTag = gql`
  mutation tagsAdd(
    $name: String!
    $type: String!
    $colorCode: String
    $parentId: String
  ) {
    tagsAdd(
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
    ) {
      _id
      __typename
    }
  }
`;

const mutations = {
  dealsAdd,
  dealsEdit,
  changeLabel,
  conformityEdit,
  addPayment,
  changeDeal,
  addLabel,
  addTag,
};
export default mutations;
