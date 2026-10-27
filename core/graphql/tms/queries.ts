import { gql } from "@apollo/client";

const BMS_ORDERS_QUERY = gql`
  query CpBmsOrders($customerId: String, $limit: Int) {
    cpBmsOrders(customerId: $customerId, limit: $limit) {
      totalCount
      list {
        _id
        branchId
        customerId
        tourId
        amount
        status
        note
        numberOfPeople
        type
        additionalCustomers
        isChild
        parent
      }
    }
  }
`;

const TOUR_GROUP_DETAIL_QUERY = gql`
  query CpBmToursGroupDetail($groupCode: String, $status: String) {
    cpBmToursGroupDetail(groupCode: $groupCode, status: $status) {
      _id
      items {
        _id
        branchId
        name
        refNumber
        groupCode
        content
        duration
        itineraryId
        itinerary {
          _id
          name
          groupDays {
            day
            title
            content
          }
        }
        pricingOptions {
          prices {
            price
            type
          }
          minPersons
          maxPersons
        }
        startDate
        endDate
        groupSize
        status
        cost
        createdAt
        modifiedAt
        viewCount
        advanceCheck
        advancePercent
        joinPercent
        tagIds
        info1
        info2
        info3
        info4
        info5
        extra
        images
        imageThumbnail
      }
    }
  }
`;

const queries = { BMS_ORDERS_QUERY, TOUR_GROUP_DETAIL_QUERY };
export default queries;
