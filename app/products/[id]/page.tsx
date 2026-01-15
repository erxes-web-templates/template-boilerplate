import { isBuildMode } from "../../../lib/buildMode";
import ProductDetailPageClient from "../../_client/ProductDetailPage";
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
  if (isBuildMode()) {
    return <ProductDetailPageClient initialProductId={id} />;
  }

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
      initialProduct={detailResult.data?.poscProductDetail ?? null}
      initialSimilarProducts={
        similaritiesResult.data?.poscProductSimilarities?.products ?? []
      }
      initialAverageReview={averageResult.data?.productreview ?? null}
      initialProductReviews={reviewsResult.data?.productreviews ?? []}
    />
  );
}
