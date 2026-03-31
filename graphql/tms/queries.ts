import { gql } from "@apollo/client";

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

const queries = { TOUR_GROUP_DETAIL_QUERY };
export default queries;
