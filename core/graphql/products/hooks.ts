"use client";

import { useQuery, type QueryHookOptions } from "@apollo/client";
import queries from "./queries";
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

export const useProductCategoriesQuery = (
  options?: QueryHookOptions<ProductCategoriesData, ProductCategoriesVariables>
) => useQuery<ProductCategoriesData, ProductCategoriesVariables>(queries.productCategories, options);

export const useProductsQuery = (options?: QueryHookOptions<ProductsData, ProductsVariables>) =>
  useQuery<ProductsData, ProductsVariables>(queries.products, options);

export const useProductsByTagQuery = (
  options?: QueryHookOptions<ProductsByTagData, ProductsByTagVariables>
) => useQuery<ProductsByTagData, ProductsByTagVariables>(queries.productsByTag, options);

export const useProductsMetaQuery = (
  options?: QueryHookOptions<ProductsMetaData, ProductsMetaVariables>
) => useQuery<ProductsMetaData, ProductsMetaVariables>(queries.productsMeta, options);

export const useProductsCountQuery = (
  options?: QueryHookOptions<ProductsCountData, ProductsCountVariables>
) => useQuery<ProductsCountData, ProductsCountVariables>(queries.productsCount, options);

export const useProductSimilaritiesQuery = (
  options?: QueryHookOptions<ProductSimilaritiesData, ProductSimilaritiesVariables>
) => useQuery<ProductSimilaritiesData, ProductSimilaritiesVariables>(queries.productSimilarities, options);

export const useProductDetailQuery = (
  options?: QueryHookOptions<ProductDetailData, ProductDetailVariables>
) => useQuery<ProductDetailData, ProductDetailVariables>(queries.productDetail, options);

export const useProductReviewQuery = (
  options?: QueryHookOptions<ProductReviewData, ProductReviewVariables>
) => useQuery<ProductReviewData, ProductReviewVariables>(queries.productReview, options);

export const useProductAverageReviewQuery = (
  options?: QueryHookOptions<ProductAverageReviewData, ProductAverageReviewVariables>
) => useQuery<ProductAverageReviewData, ProductAverageReviewVariables>(
  queries.getProductAverageReview,
  options
);

export const useProductReviewsQuery = (
  options?: QueryHookOptions<ProductReviewsData, ProductReviewsVariables>
) => useQuery<ProductReviewsData, ProductReviewsVariables>(queries.getProductReviews, options);

export const useLastProductViewQuery = (
  options?: QueryHookOptions<LastProductViewData, LastProductViewVariables>
) => useQuery<LastProductViewData, LastProductViewVariables>(queries.getLastProductView, options);

export const useMsdProductsRemainderQuery = (
  options?: QueryHookOptions<MsdProductsRemainderData, MsdProductsRemainderVariables>
) =>
  useQuery<MsdProductsRemainderData, MsdProductsRemainderVariables>(queries.msdProductsRemainder, options);
