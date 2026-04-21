import {
  fetchProductAverageReview,
  fetchProductDetail,
  fetchProductReviews,
  fetchProductSimilarities,
} from "../../../graphql/products/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const productId = id;

  const [detailResult, similaritiesResult, averageResult, reviewsResult] =
    await Promise.all([
      fetchProductDetail({
        variables: { _id: productId },
        fetchPolicy: "no-cache",
      }),
      fetchProductSimilarities({
        variables: { id: productId },
        fetchPolicy: "no-cache",
      }),
      fetchProductAverageReview({
        variables: { productId },
        fetchPolicy: "no-cache",
      }),
      fetchProductReviews({
        variables: { productIds: [productId] },
        fetchPolicy: "no-cache",
      }),
    ]);

  return (
    <ProductDetailPageClient
      initialProductId={productId}
      initialProduct={detailResult.data?.cpPoscProductDetail ?? null}
      initialSimilarProducts={
        similaritiesResult.data?.cpPoscProductSimilarities?.products ?? []
      }
      initialAverageReview={averageResult.data?.cpProductReview ?? null}
      initialProductReviews={reviewsResult.data?.cpProductReviews ?? []}
    />
  );
}
