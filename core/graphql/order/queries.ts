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
    cpCurrentOrder(
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
  query CpFullOrders(
    $customerId: String
    $isPaid: Boolean
    $saleStatus: String
  ) {
    cpFullOrders(
      customerId: $customerId
      isPaid: $isPaid
      saleStatus: $saleStatus
    ) {
      _id
      createdAt
      status
      saleStatus
      customerId
      number
      cashAmount
      mobileAmount
      directDiscount
      directIsAmount
      billType
      registerNumber
      paidAmounts {
        _id
        type
        info
        amount
      }
      paidDate
      dueDate
      modifiedAt
      totalAmount
      finalAmount
      shouldPrintEbarimt
      printedEbarimt
      billId
      oldBillId
      type
      branchId
      deliveryInfo
      description
      isPre
      origin
      customer {
        _id
        firstName
        lastName
        primaryPhone
        primaryEmail
        primaryAddress
        addresses
      }
      customerType
      items {
        _id
        count
        unitPrice
        description
        productImgUrl
        productName
        status
        isTake
        isPackage
      }
      returnInfo
      slotCode
      extraInfo
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
    cpInvoices(contentType: $contentType, contentTypeId: $contentTypeId) {
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
    cpLastViewedItems(customerId: $customerId, limit: $limit) {
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

const cpLastViewedItems = gql`
  query CpLastViewedItems($customerId: String!, $limit: Int) {
    cpLastViewedItems(customerId: $customerId, limit: $limit) {
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
  cpLastViewedItems,
};

export default queries;
