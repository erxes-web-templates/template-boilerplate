import { gql } from "@apollo/client";

const webDetail = gql`
  query CpGetWebDetail($id: String!) {
    cpGetWebDetail(_id: $id) {
      _id
      name
      description
      domain
      templateId
      templateType
      logo {
        url
      }
      favicon {
        url
      }
      copyright
      appearances {
        backgroundColor
        primaryColor
        secondaryColor
        accentColor
        fontSans
        fontHeading
        fontMono
      }
    }
  }
`;

const webPage = gql`
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

const webPages = gql`
  query CpWebPages(
    $webId: String!
    $searchValue: String
    $language: String
    $limit: Int
  ) {
    cpWebPages(
      webId: $webId
      searchValue: $searchValue
      language: $language
      limit: $limit
    ) {
      _id
      webId
      clientPortalId
      name
      slug
      type
      description
      coverImage
      createdAt
      updatedAt
    }
  }
`;

const webPost = gql`
  query CpWebPost(
    $id: String
    $slug: String
    $language: String
    $webId: String
  ) {
    cpWebPost(_id: $id, slug: $slug, language: $language, webId: $webId) {
      _id
      webId
      clientPortalId
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
      customFieldsData
      customFieldsMap
    }
  }
`;

const webPosts = gql`
  query CpWebPosts(
    $webId: String!
    $language: String
    $limit: Int
    $featured: Boolean
    $type: String
    $categoryIds: [String]
    $searchValue: String
    $status: WebPostStatus
    $tagIds: [String]
    $sortField: String
    $sortDirection: String
  ) {
    cpWebPosts(
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
    ) {
      _id
      webId
      clientPortalId
      type
      authorKind
      title
      slug
      excerpt
      categoryIds
      status
      tagIds
      featured
      thumbnail {
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
    }
  }
`;

const webMenus = gql`
  query CpWebMenus($webId: String!, $language: String, $kind: String) {
    cpWebMenus(webId: $webId, language: $language, kind: $kind) {
      _id
      webId
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

const webTranslations = gql`
  query CpWebTranslations($postId: String) {
    cpWebTranslations(postId: $postId) {
      _id
      language
      title
      content
      excerpt
    }
  }
`;

const queries = {
  webDetail,
  webPage,
  webPages,
  webPost,
  webPosts,
  webMenus,
  webTranslations,
};

export default queries;
