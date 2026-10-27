import { gql } from "@apollo/client";

const post = gql`
  query CpPost($id: String, $slug: String, $language: String, $clientPortalId: String) {
    cpPost(_id: $id, slug: $slug, language: $language, clientPortalId: $clientPortalId) {
      _id
      type
      authorKind
      authorId
      author {
        ... on User {
          _id
          details {
            avatar
            firstName
            lastName
            fullName
          }
        }
        ... on ClientPortalUser {
          _id
          firstName
          lastName
          fullName
          email
        }
      }
      clientPortalId
      title
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      featured
      thumbnail {
        url
        name
      }
      images {
        url
        name
      }
      videoUrl
      audio {
        url
        name
      }
      createdAt
      updatedAt
      categories {
        _id
        name
        slug
      }
      tags {
        _id
        name
        slug
      }
      customFieldsData
      customFieldsMap
    }
  }
`;

const posts = gql`
  query CpPosts(
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
  ) {
    cpPosts(
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
    ) {
      _id
      type
      authorKind
      authorId
      author {
        ... on User {
          _id
          details {
            avatar
            firstName
            lastName
            fullName
          }
        }
        ... on ClientPortalUser {
          _id
          firstName
          lastName
          fullName
          email
        }
      }
      clientPortalId
      title
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      featured
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
        slug
      }
      tags {
        _id
        name
        slug
      }
    }
  }
`;

const postListWithPagination = gql`
  query CpPostListWithPagination(
    $language: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: String
    $featured: Boolean
    $type: String
    $categoryIds: [String]
    $searchValue: String
    $status: PostStatus
    $tagIds: [String]
  ) {
    cpPostListWithPagination(
      language: $language
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      featured: $featured
      type: $type
      categoryIds: $categoryIds
      searchValue: $searchValue
      status: $status
      tagIds: $tagIds
    ) {
      currentPage
      totalCount
      totalPages
      posts {
        _id
        type
        authorKind
        authorId
        author {
          ... on User {
            _id
            details {
              avatar
              firstName
              lastName
              fullName
            }
          }
          ... on ClientPortalUser {
            _id
            firstName
            lastName
            fullName
            email
            customer {
              avatar
            }
          }
        }
        clientPortalId
        title
        slug
        excerpt
        categoryIds
        status
        tagIds
        featured
        thumbnail {
          url
        }
        scheduledDate
        autoArchiveDate
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
        customPostType {
          _id
          code
          label
        }
      }
    }
  }
`;

const categories = gql`
  query CpCmsCategories($language: String) {
    cpCmsCategories(language: $language) {
      _id
      clientPortalId
      name
      slug
      description
      parentId
      status
      createdAt
      updatedAt
    }
  }
`;

const tags = gql`
  query CpCmsTags(
    $language: String
    $limit: Int
    $searchValue: String
    $sortField: String
    $sortDirection: String
  ) {
    cpCmsTags(
      language: $language
      limit: $limit
      searchValue: $searchValue
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      clientPortalId
      name
      slug
      colorCode
      createdAt
      updatedAt
    }
  }
`;

const menus = gql`
  query CpMenus($language: String, $kind: String) {
    cpMenus(language: $language, kind: $kind) {
      _id
      clientPortalId
      label
      url
      kind
      icon
      order
      target
      parentId
      objectType
      objectId
    }
  }
`;

const pages = gql`
  query CpPages($language: String, $clientPortalId: String) {
    cpPages(language: $language, clientPortalId: $clientPortalId) {
      _id
      clientPortalId
      name
      slug
      type
      description
      status
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
    }
  }
`;

const customPostTypes = gql`
  query CpCustomPostTypes($searchValue: String) {
    cpCustomPostTypes(searchValue: $searchValue) {
      _id
      code
      label
    }
  }
`;

const customFieldGroups = gql`
  query CpCustomFieldGroups(
    $searchValue: String
    $pageId: String
    $categoryId: String
    $postType: String
  ) {
    cpCustomFieldGroups(
      searchValue: $searchValue
      pageId: $pageId
      categoryId: $categoryId
      postType: $postType
    ) {
      _id
      code
      label
    }
  }
`;

const queries = {
  post,
  posts,
  postListWithPagination,
  categories,
  tags,
  menus,
  pages,
  customPostTypes,
  customFieldGroups,
};

export default queries;
