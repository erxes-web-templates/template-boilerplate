type Maybe<T> = T | null | undefined;

export type Attachment = {
  url?: Maybe<string>;
};

export interface ProductCategory {
  _id: string;
  name: string;
  code?: Maybe<string>;
  order?: Maybe<number>;
  parentId?: Maybe<string>;
  attachment?: Maybe<Attachment>;
}

export interface ProductCategoriesVariables {
  parentId?: string;
  searchValue?: string;
  excludeEmpty?: boolean;
  meta?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export interface ProductCategoriesData {
  cpPoscProductCategories: ProductCategory[];
}

export interface ProductSummary {
  _id: string;
  name?: Maybe<string>;
  code?: Maybe<string>;
  unitPrice?: Maybe<number>;
  type?: Maybe<string>;
  description?: Maybe<string>;
  remainder?: Maybe<number>;
  tagIds?: Maybe<string[]>;
  hasSimilarity?: Maybe<boolean>;
  category?: Maybe<{
    _id: string;
    name?: Maybe<string>;
  }>;
  attachment?: Maybe<Attachment>;
}

export interface ProductsVariables {
  searchValue?: string;
  tag?: string;
  ids?: string[];
  type?: string;
  categoryId?: string;
  page?: number;
  perPage?: number;
  isKiosk?: boolean;
  groupedSimilarity?: string;
  sortField?: string;
  sortDirection?: number;
}

export interface ProductsData {
  cpPoscProducts: ProductSummary[];
}

export interface ProductsByTagData {
  cpPoscProducts: Array<{
    _id: string;
  }>;
}

export interface ProductsByTagVariables {
  tag?: string;
}

export interface ProductsMetaData {
  posProducts: Array<{
    _id: string;
    modifiedAt?: Maybe<string>;
  }>;
}

export interface ProductsMetaVariables {
  perPage?: number;
}

export interface ProductsCountData {
  posProductsTotalCount: number;
}

export interface ProductsCountVariables {
  categoryId?: string;
  type?: string;
  searchValue?: string;
  groupedSimilarity?: string;
  isKiosk?: boolean;
}

export interface ProductSimilarityProduct {
  _id: string;
  description?: Maybe<string>;
  unitPrice?: Maybe<number>;
  name?: Maybe<string>;
  attachment?: Maybe<Attachment>;
  customFieldsData?: Maybe<Record<string, unknown>>;
}

export interface ProductSimilarityGroup {
  fieldId?: Maybe<string>;
  title?: Maybe<string>;
}

export interface ProductSimilaritiesPayload {
  products: ProductSimilarityProduct[];
  groups: ProductSimilarityGroup[];
}

export interface ProductSimilaritiesData {
  cpPoscProductSimilarities?: Maybe<ProductSimilaritiesPayload>;
}

export interface ProductSimilaritiesVariables {
  id: string;
  groupedSimilarity?: string;
}

export interface ProductDetail {
  _id: string;
  name?: Maybe<string>;
  description?: Maybe<string>;
  code?: Maybe<string>;
  type?: Maybe<string>;
  createdAt?: Maybe<string>;
  unitPrice?: Maybe<number>;
  remainder?: Maybe<number>;
  category?: Maybe<{
    order?: Maybe<number>;
    name?: Maybe<string>;
    _id: string;
  }>;
  attachment?: Maybe<Attachment>;
  attachmentMore?: Maybe<Attachment[]>;
}

export interface ProductDetailData {
  cpPoscProductDetail?: Maybe<ProductDetail>;
}

export interface ProductDetailVariables {
  _id?: string;
}

export interface ProductReviewSummary {
  average?: Maybe<number>;
  length?: Maybe<number>;
  productId?: Maybe<string>;
}

export interface ProductReviewData {
  cpProductReview?: Maybe<ProductReviewSummary>;
}

export interface ProductReviewVariables {
  productId: string;
}

export interface LastViewedProduct {
  _id: string;
  productId?: Maybe<string>;
  product?: Maybe<{
    _id: string;
    createdAt?: Maybe<string>;
    attachment?: Maybe<Attachment>;
    unitPrice?: Maybe<number>;
    name?: Maybe<string>;
  }>;
}

export interface LastProductViewData {
  cpLastViewedItems: LastViewedProduct[];
}

export interface LastProductViewVariables {
  customerId: string;
  limit?: number;
}

export interface ProductAverageReviewData {
  cpProductReview?: Maybe<ProductReviewSummary>;
}

export interface ProductAverageReviewVariables {
  productId: string;
}

export interface ProductReviewsData {
  cpProductReviews: Array<{
    _id: string;
    customerId?: Maybe<string>;
    review?: Maybe<string>;
  }>;
}

export interface ProductReviewsVariables {
  productIds?: string[];
  customerId?: string;
}

export interface MsdProductsRemainderData {
  msdProductsRemainder: unknown;
}

export interface MsdProductsRemainderVariables {
  posToken?: string;
  productCodes?: string[];
}
