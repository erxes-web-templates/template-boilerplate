interface CmsMenuList {
  _id: string;
  parentId: string;
  clientPortalId: string;
  label: string;
  objectType?: string;
  objectId?: string;
  kind: string;
  icon: string;
  url: string;
  order: number;
  target?: string;
}

interface CmsMenuListVariables {
  kind: string;
  language?: string;
}

type MenuItem = {
  _id?: string;
  label: string;
  url?: string;
  parentId?: string;
  icon?: string;
  kind: string;
  contentType?: string;
  contentTypeID?: string;
  order: number;
  clientPortalId: string;
};

type CPDetail = {
  _id: string;
  name: string;
  description: string;
  copyright: string;
  logo?: { url: string; name?: string } | string;
  styles: {
    baseColor: string;
    backgroundColor: string;
    headingFont: string;
    baseFont: string;
  };
  appearances?: {
    backgroundColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontSans?: string;
    fontHeading?: string;
    fontMono?: string;
  };
  externalLinks: {
    phones: string[];
    emails: string[];
    address: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    whatsapp: string;
    instagram: string;
    youtube: string;
  };
};

type CmsPost = {
  _id: string;
  slug: string;
  title: string;
  content: string;
  thumbnail: {
    url: string;
    name: string;
  };
};

export type { CmsMenuList, CmsMenuListVariables, MenuItem, CPDetail, CmsPost };
