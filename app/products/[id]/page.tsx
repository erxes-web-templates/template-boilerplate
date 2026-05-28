import type { Metadata } from "next";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (isBuildMode()) return { title: "Product" };
  const { id } = await params;
  const result = await fetchProductDetail({ variables: { _id: id }, fetchPolicy: "no-cache" });
  const product = result.data?.cpPoscProductDetail;
  return {
    title: product?.name ?? "Product",
    description: product?.description
      ? product.description.replace(/<[^>]*>/g, "").slice(0, 160)
      : undefined,
    ...(product?.attachment?.url && {
      openGraph: { images: [product.attachment.url] },
    }),
  };
}

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
      initialProduct={detailResult.data?.cpPoscProductDetail ?? null}
      initialSimilarProducts={
        similaritiesResult.data?.cpPoscProductSimilarities?.products ?? []
      }
      initialAverageReview={averageResult.data?.cpProductReview ?? null}
      initialProductReviews={reviewsResult.data?.cpProductReviews ?? []}
    />
  );
}
