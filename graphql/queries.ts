import { gql } from "@apollo/client";

export const TOURS_QUERY = gql`
  query CpBmsTours($limit: Int, $status: String) {
    cpBmsTours(limit: $limit, status: $status) {
      totalCount
      list {
        _id
        content
        startDate
        endDate
        cost
        viewCount
        name
        images
        imageThumbnail
        itineraryId
        itinerary {
          images
        }
        refNumber
      }
    }
  }
`;

export const TOUR_DETAIL_QUERY = gql`
  query BmTourDetail($id: String!, $branchId: String) {
    bmTourDetail(_id: $id, branchId: $branchId) {
      _id
      branchId
      groupCode
      content
      cost
      name
      status
      startDate
      refNumber
      viewCount
      images
      imageThumbnail
    }
  }
`;

export const CP_GET_CONFIG = gql`
  query CpGetWebDetail($_id: String!) {
    cpGetWebDetail(_id: $_id) {
      _id
      clientPortalId
      name
      description
      keywords
      domain
      copyright
      logo {
        url
        name
      }
      favicon {
        url
        name
      }
      thumbnail {
        url
        name
      }
      externalLinks
      templateId
      templateType
      erxesAppToken
    }
  }
`;

export const GET_WEB_PAGE = gql`
  query CpWebPage(
    $id: String
    $slug: String
    $language: String
    $webId: String
  ) {
    cpWebPage(_id: $id, slug: $slug, language: $language, webId: $webId) {
      _id
      webId
      clientPortalId
      name
      slug
      type
      description
      coverImage
      content
      createdAt
      updatedAt
      pageItems {
        type
        content
        order
        contentType
        contentTypeId
        config
      }
      customFieldsData
      customFieldsMap
    }
  }
`;

export const GET_CMS_MENU = gql`
  query CmsMenu($id: String!) {
    cmsMenu(_id: $id) {
      _id
      url
      parentId
      parent {
        url
        _id
        contentType
        contentTypeID
        icon
        kind
        label
        parentId
        order
      }
    }
  }
`;

export const GET_CMS_MENU_LIST = gql`
  query CpMenus($kind: String, $language: String) {
    cpMenus(kind: $kind, language: $language) {
      _id
      parentId
      clientPortalId
      label
      contentType
      contentTypeId
      kind
      icon
      url
      order
      target
    }
  }
`;

export const GET_CMS_PAGES = gql`
  query CmsPages($clientPortalId: String!) {
    cmsPages(clientPortalId: $clientPortalId) {
      _id
      name
      type
      slug
      content
      createdAt
      updatedAt
    }
  }
`;

export const GET_CMS_POSTS = gql`
  query CpPosts(
    $webId: String
    $language: String
    $limit: Int
    $featured: Boolean
    $type: String
    $categoryIds: [String]
    $searchValue: String
    $status: PostStatus
    $tagIds: [String]
    $sortField: String
    $sortDirection: String
    $dateField: PostDateField
    $dateFrom: Date
    $dateTo: Date
  ) {
    cpPosts(
      webId: $webId
      language: $language
      limit: $limit
      featured: $featured
      type: $type
      categoryIds: $categoryIds
      searchValue: $searchValue
      status: $status
      tagIds: $tagIds
      sortField: $sortField
      sortDirection: $sortDirection
      dateField: $dateField
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      _id
      type
      webId
      title
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      featured
      publishedDate
      scheduledDate
      thumbnail {
        url
        name
      }
      images {
        url
        name
      }
      videoUrl
      createdAt
      updatedAt
      categories {
        _id
        name
      }
      tags {
        _id
        name
      }
    }
  }
`;

export const GET_CMS_POST = gql`
  query CmsPost($slug: String, $id: String, $language: String) {
    cmsPost(slug: $slug, _id: $id, language: $language) {
      _id
      authorKind
      authorId
      author {
        ... on User {
          _id
          details {
            avatar
            firstName
            lastName
            description
            fullName
          }
          isOwner
        }
      }
      title
      content
      excerpt
      categoryIds
      tagIds
      status
      featured
      createdAt
      images {
        url
        name
      }
      thumbnail {
        url
        name
      }
      audio {
        url
        name
      }
      videoUrl
      customFieldsData
      categories {
        _id
        name
      }
    }
  }
`;

export const GET_CMS_POST_LIST = gql`
  query PostList(
    $clientPortalId: String!
    $type: String
    $featured: Boolean
    $categoryIds: [String]
    $searchValue: String
    $status: PostStatus
    $page: Int
    $perPage: Int
    $tagIds: [String]
    $sortField: String
    $sortDirection: String
  ) {
    cmsPostList(
      clientPortalId: $clientPortalId
      featured: $featured
      type: $type
      categoryIds: $categoryIds
      searchValue: $searchValue
      status: $status
      page: $page
      perPage: $perPage
      tagIds: $tagIds
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      currentPage
      totalCount
      totalPages
      posts {
        _id
        type
        customPostType {
          _id
          code
          label
          __typename
        }
        authorKind
        author {
          ... on User {
            _id
            username
            email
            details {
              fullName
              shortName
              avatar
              firstName
              lastName
              middleName
              __typename
            }
            __typename
          }
          ... on ClientPortalUser {
            _id
            fullName
            firstName
            lastName
            email
            username
            customer {
              avatar
              __typename
            }
            __typename
          }
          __typename
        }
        categoryIds
        categories {
          _id
          name
          __typename
        }
        featured
        status
        tagIds
        tags {
          _id
          name
          __typename
        }
        authorId
        createdAt
        autoArchiveDate
        scheduledDate
        thumbnail {
          url
          __typename
        }
        title
        updatedAt
        __typename
      }
      __typename
    }
  }
`;

export const GET_FORM_DETAIL = gql`
  query FormDetail($id: String!) {
    formDetail(_id: $id) {
      _id
      title
      description
      buttonText
      numberOfPages
      leadData
      fields {
        _id
        code
        field
        column
        text
        validation
        name
        content
        contentType
        contentTypeId
        order
        options
        optionsValues
        description
        type
        isRequired
        pageNumber
      }
    }
  }
`;

export const INQUIRY_FORM = gql`
  query Forms($type: String, $brandId: String, $searchValue: String) {
    forms(type: $type, brandId: $brandId, searchValue: $searchValue) {
      _id
      name
      title
      code
      type
      description
      buttonText
      createdDate
      numberOfPages
      status
      googleMapApiKey
      fields {
        _id
        contentType
        contentTypeId
        name
        isVisible
        isVisibleInDetail
        canHide
        groupId
        lastUpdatedUserId
        optionsValues
        subFieldIds
        description
        options
        type
        validation
        regexValidation
        text
        content
        isRequired
        order
        associatedFieldId
        logicAction
        column
        pageNumber
        code
        searchable
        showInCard
        isVisibleToCreate
        productCategoryId
        field
        isDefinedByErxes
        relationType
        isDisabled
      }
    }
  }
`;

export const TOURS_GROUP_QUERY = gql`
  query CpBmToursGroup(
    $limit: Int
    $tags: [String]
    $status: String
    $branchId: String
  ) {
    cpBmToursGroup(
      limit: $limit
      tags: $tags
      status: $status
      branchId: $branchId
    ) {
      list {
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
  }
`;

export const TOUR_GROUP_DETAIL_QUERY = gql`
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
        itinerary {
          _id
          branchId
          color
          content
          extra
          duration
          driverCost
          totalCost
          status
          personCost
          name
          modifiedAt
          images
          guideCostExtra
          guideCost
          groupDays {
            day
            title
            images
            content
          }
          createdAt
        }
        imageThumbnail
      }
    }
  }
`;

export const GET_TAGS = gql`
  query Tags($type: String) {
    cpTags(type: $type) {
      _id
      name
      __typename
    }
  }
`;
