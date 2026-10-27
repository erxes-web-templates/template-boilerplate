import type { ApolloQueryResult, QueryOptions } from "@apollo/client";
import type { DocumentNode } from "graphql";
import queries from "./queries";
import { getClient } from "../../lib/client";
import type {
  LastProductViewData,
  LastProductViewVariables,
  MsdProductsRemainderData,
  MsdProductsRemainderVariables,
  ProductAverageReviewData,
  ProductAverageReviewVariables,
  ProductCategoriesData,
  ProductCategoriesVariables,
  ProductDetailData,
  ProductDetailVariables,
  ProductReviewData,
  ProductReviewVariables,
  ProductSimilaritiesData,
  ProductSimilaritiesVariables,
  ProductReviewsData,
  ProductReviewsVariables,
  ProductsByTagData,
  ProductsByTagVariables,
  ProductsCountData,
  ProductsCountVariables,
  ProductsData,
  ProductsMetaData,
  ProductsMetaVariables,
  ProductsVariables,
} from "./types";

type ServerQueryOptions<TData, TVariables> = Omit<
  QueryOptions<TVariables, TData>,
  "query"
>;

const runQuery = <TData, TVariables>(
  document: DocumentNode,
  options?: ServerQueryOptions<TData, TVariables>
): Promise<ApolloQueryResult<TData>> => {
  const client = getClient();
  return client.query<TData, any>({
    query: document,
    ...(options ?? {}),
  }) as unknown as Promise<ApolloQueryResult<TData>>;
};

export const fetchProductCategories = (
  options?: ServerQueryOptions<
    ProductCategoriesData,
    ProductCategoriesVariables
  >
) =>
  runQuery<ProductCategoriesData, ProductCategoriesVariables>(
    queries.productCategories,
    options
  );

export const fetchProducts = (
  options?: ServerQueryOptions<ProductsData, ProductsVariables>
) => runQuery<ProductsData, ProductsVariables>(queries.products, options);

export const fetchProductsByTag = (
  options?: ServerQueryOptions<ProductsByTagData, ProductsByTagVariables>
) =>
  runQuery<ProductsByTagData, ProductsByTagVariables>(
    queries.productsByTag,
    options
  );

export const fetchProductsMeta = (
  options?: ServerQueryOptions<ProductsMetaData, ProductsMetaVariables>
) =>
  runQuery<ProductsMetaData, ProductsMetaVariables>(
    queries.productsMeta,
    options
  );

export const fetchProductsCount = (
  options?: ServerQueryOptions<ProductsCountData, ProductsCountVariables>
) =>
  runQuery<ProductsCountData, ProductsCountVariables>(
    queries.productsCount,
    options
  );

export const fetchProductSimilarities = (
  options?: ServerQueryOptions<
    ProductSimilaritiesData,
    ProductSimilaritiesVariables
  >
) =>
  runQuery<ProductSimilaritiesData, ProductSimilaritiesVariables>(
    queries.productSimilarities,
    options
  );

export const fetchProductDetail = (
  options?: ServerQueryOptions<ProductDetailData, ProductDetailVariables>
) =>
  runQuery<ProductDetailData, ProductDetailVariables>(
    queries.productDetail,
    options
  );

export const fetchProductReview = (
  options?: ServerQueryOptions<ProductReviewData, ProductReviewVariables>
) =>
  runQuery<ProductReviewData, ProductReviewVariables>(
    queries.productReview,
    options
  );

export const fetchProductAverageReview = (
  options?: ServerQueryOptions<
    ProductAverageReviewData,
    ProductAverageReviewVariables
  >
) =>
  runQuery<ProductAverageReviewData, ProductAverageReviewVariables>(
    queries.getProductAverageReview,
    options
  );

export const fetchProductReviews = (
  options?: ServerQueryOptions<ProductReviewsData, ProductReviewsVariables>
) =>
  runQuery<ProductReviewsData, ProductReviewsVariables>(
    queries.getProductReviews,
    options
  );

export const fetchLastProductView = (
  options?: ServerQueryOptions<LastProductViewData, LastProductViewVariables>
) =>
  runQuery<LastProductViewData, LastProductViewVariables>(
    queries.getLastProductView,
    options
  );

export const fetchMsdProductsRemainder = (
  options?: ServerQueryOptions<
    MsdProductsRemainderData,
    MsdProductsRemainderVariables
  >
) =>
  runQuery<MsdProductsRemainderData, MsdProductsRemainderVariables>(
    queries.msdProductsRemainder,
    options
  );
