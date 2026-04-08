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
  mutation CpDealsAdd(${commonFields} $customerIds: [String] $labelIds: [String], $tagIds: [String]) {
    cpDealsAdd(${commonParams} customerIds: $customerIds labelIds: $labelIds, tagIds: $tagIds) {
      _id
    }
  }
`;

const dealsEdit = gql`
  mutation CpDealsEdit($id: String!, ${commonFields}, $tagIds: [String]) {
    cpDealsEdit(
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
    cpDealsEdit(
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
  mutation CpSalesPipelineLabelsAdd(
    $name: String!
    $colorCode: String!
    $pipelineId: String!
  ) {
    cpSalesPipelineLabelsAdd(
      name: $name
      colorCode: $colorCode
      pipelineId: $pipelineId
    ) {
      _id
      __typename
    }
  }
`;

const tagsAdd = gql`
  mutation CpTagsAdd(
    $name: String!
    $type: String
    $colorCode: String
    $parentId: String
    $isGroup: Boolean
    $description: String
  ) {
    cpTagsAdd(
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
      isGroup: $isGroup
      description: $description
    ) {
      _id
      name
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
  tagsAdd,
};
export default mutations;
