import { gql } from "@apollo/client";

export const orderItemFields = `
    _id
    unitPrice
    orderId
    productName
    count
    productId
    isPackage
    isTake
    status
    productImgUrl
    discountAmount
    discountPercent
    bonusCount
`;

export const currentOrder = gql`
  query CurrentOrder(
    $customerId: String
    $saleStatus: String
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $statuses: [String]
  ) {
    fullOrders(
      customerId: $customerId
      saleStatus: $saleStatus
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      statuses: $statuses
    ) {
      _id
      deliveryInfo
      description
      paidDate
      billType
      registerNumber
      totalAmount
      mobileAmount
      saleStatus
      number
      items {
        ${orderItemFields}
      }
    }
  }
`;

export const fullOrders = gql`
  query FullOrders(
    $customerId: String
    $statuses: [String]
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    fullOrders(
      customerId: $customerId
      statuses: $statuses
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      createdAt
      paidDate
      status
      totalAmount
      number
      items {
        productName
        productImgUrl
      }
    }
  }
`;

const ordersCheckCompany = gql`
  query ordersCheckCompany($registerNumber: String!) {
    ordersCheckCompany(registerNumber: $registerNumber)
  }
`;

export const orderFields = `
  _id
  createdAt
  modifiedAt
  number
  status
  paidDate
  mobileAmount
  totalAmount
  slotCode
  registerNumber
  customerId
  printedEbarimt
  billType
  billId
  origin
  type
  deliveryInfo
  description
`;

const customerFields = `
  _id
  primaryPhone
  firstName
  primaryEmail
  lastName
`;

const putResponseFields = `
  totalAmount
  customerTin
  customerName
  id
  qrData
  lottery
`;

const orderDetail = gql`
  query OrderDetail($id: String, $customerId: String) {
    orderDetail(_id: $id, customerId: $customerId) {
      ${orderFields}

      items {
        ${orderItemFields}
      }

      customer {
        firstName
        lastName
        primaryEmail
        primaryPhone
        code
      }

      user {
        ${customerFields}
      }

      putResponses {
        ${putResponseFields}
      }
    }
  }
`;

const invoices = `
  query Invoices($contentType: String, $contentTypeId: String) {
    invoices(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      amount
      status
    }
  }
`;

const orderItemDetail = gql`
  query OrderItemDetail($id: String) {
    posProductDetail(_id: $id) {
      remainder
      category {
        name
      }
    }
  }
`;

const addresses = gql`
  query Addresses {
    clientPortalCurrentUser {
      customer {
        addresses
      }
    }
  }
`;

const getLastProductView = gql`
  query LastViewedItems($customerId: String!, $limit: Int) {
    lastViewedItems(customerId: $customerId, limit: $limit) {
      _id
      productId

      product {
        _id
        createdAt
        attachment {
          url
        }
        unitPrice
        name
        description
      }
    }
  }
`;

const queries = {
  orderItemDetail,
  currentOrder,
  ordersCheckCompany,
  fullOrders,
  orderDetail,
  invoices,
  addresses,
  getLastProductView,
};

export default queries;
