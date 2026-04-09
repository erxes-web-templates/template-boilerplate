"use client";

import Link from "next/link";
import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "@apollo/client";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useProductAverageReviewQuery,
  useProductDetailQuery,
  useProductSimilaritiesQuery,
} from "../../graphql/products";
import type {
  ProductDetail,
  ProductReviewSummary,
  ProductReviewsData,
  ProductSummary,
} from "../../graphql/products/types";
import { useCart } from "../../lib/CartContext";
import authQueries from "../../graphql/auth/queries";
import productMutations from "../../graphql/products/mutations";
import ecommerceQueries from "../../graphql/ecommerce/queries";
import ecommerceMutations from "../../graphql/ecommerce/mutations";
import { templateUrl } from "@/lib/utils";
import { isBuildMode } from "../../lib/buildMode";
import {
  clearLocalLastViewedProducts,
  getLocalLastViewedProducts,
  rememberLastViewedProduct,
} from "../../lib/lastViewedProducts";
import {
  ProductReviews,
  type ProductReview,
} from "../products/[id]/ProductReviews";

const formatCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return `₮${Math.round(value).toLocaleString()}`;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString();
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value || "—"}</p>
    </CardContent>
  </Card>
);

type ButtonState = "idle" | "adding" | "added";

type ProductDetailPageProps = {
  initialProductId?: string;
  initialProduct?: ProductDetail | null;
  initialSimilarProducts?: ProductSummary[];
  initialAverageReview?: ProductReviewSummary | null;
  initialProductReviews?: ProductReviewsData["cpProductReviews"];
};

export default function ProductDetailPage({
  initialProductId,
  initialProduct,
  initialSimilarProducts,
  initialAverageReview,
  initialProductReviews,
}: ProductDetailPageProps) {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();

  const productId =
    searchParams.get("productId") ?? params.id ?? initialProductId;
  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useProductDetailQuery({
    variables: { _id: productId ?? "" },
    fetchPolicy: "cache-and-network",
    skip: !productId,
  });

  const { data: similarityData, loading: similarityLoading } =
    useProductSimilaritiesQuery({
      variables: { id: productId ?? "" },
      fetchPolicy: "cache-first",
      skip: !productId,
    });

  const {
    data: reviewData,
    loading: reviewLoading,
    refetch: refetchAverage,
  } = useProductAverageReviewQuery({
    variables: { productId: productId ?? "" },
    fetchPolicy: "cache-first",
    skip: !productId,
  });

  const product = productData?.cpPoscProductDetail ?? initialProduct ?? null;
  const gallery = useMemo(() => {
    if (!product) {
      return [] as string[];
    }
    const images = [
      product.attachment?.url,
      ...(product.attachmentMore?.map((file) => file?.url || "") ?? []),
    ];
    return images
      .filter((url): url is string => Boolean(url))
      .map((url) => {
        try {
          return url;
        } catch (error) {
          return url;
        }
      });
  }, [product]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (gallery.length > 0) {
      setSelectedImage((current) => current ?? gallery[0]);
    } else {
      setSelectedImage(null);
    }
  }, [gallery]);

  const similarProducts = useMemo(() => {
    const items =
      similarityData?.cpPoscProductSimilarities?.products?.filter(
        (entry) => entry._id !== product?._id
      ) ??
      initialSimilarProducts?.filter((entry) => entry._id !== product?._id) ??
      [];
    return items;
  }, [similarityData, product?._id, initialSimilarProducts]);

  const reviewSummary =
    reviewData?.cpProductReview ?? initialAverageReview ?? null;
  const averageRating =
    reviewSummary?.average && reviewSummary.average > 0
      ? reviewSummary.average.toFixed(1)
      : null;
  const reviewsCount = reviewSummary?.length ?? 0;
  const inStock =
    typeof product?.remainder === "number" && Number.isFinite(product.remainder)
      ? product.remainder > 0
      : false;
  const isBuilder = isBuildMode();
  const { addToCart } = useCart();
  const { data: userData } = useQuery(authQueries.currentUser);
  const customerId = userData?.clientPortalCurrentUser?.erxesCustomerId ?? null;
  const { toast } = useToast();
  const [addToLastView] = useMutation(productMutations.addToLastView);
  const {
    data: productReviewsData,
    loading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery(ecommerceQueries.productreviews, {
    variables: { productIds: productId ? [productId] : [], customerId },
    skip: !productId,
    fetchPolicy: "cache-and-network",
  });
  const [addProductReview] = useMutation(ecommerceMutations.productReviewAdd);
  const [updateProductReview] = useMutation(
    ecommerceMutations.productReviewUpdate
  );

  // Wishlist
  const { data: wishlistData, refetch: refetchWishlist } = useQuery(
    ecommerceQueries.wishlist,
    {
      variables: { customerId: customerId ?? "" },
      skip: !customerId,
      fetchPolicy: "cache-and-network",
    }
  );
  const wishlistItems: Array<{ _id: string; product?: { _id?: string } | null }> =
    wishlistData?.cpWishlist ?? [];
  const wishEntry = wishlistItems.find(
    (w) => w.product?._id === productId
  ) ?? null;
  const isWishlisted = !!wishEntry;
  const [wishLoading, setWishLoading] = useState(false);

  const [wishlistAdd] = useMutation(productMutations.wishlistAdd);
  const [wishlistRemove] = useMutation(productMutations.wishlistRemove);

  const handleToggleWishlist = useCallback(async () => {
    if (!customerId) {
      toast({
        title: "Нэвтрэх шаардлагатай",
        description: "Хүслийн жагсаалтад нэмэхийн тулд нэвтэрнэ үү.",
        variant: "destructive",
      });
      return;
    }
    if (wishLoading || !productId) return;
    setWishLoading(true);
    try {
      if (isWishlisted && wishEntry) {
        await wishlistRemove({ variables: { id: wishEntry._id } });
        toast({ title: "Хүслийн жагсаалтаас хасагдлаа" });
      } else {
        await wishlistAdd({ variables: { productId, customerId } });
        toast({ title: "Хүслийн жагсаалтад нэмэгдлээ" });
      }
      await refetchWishlist();
    } catch (err: any) {
      toast({
        title: "Алдаа гарлаа",
        description: err?.message ?? "Дахин оролдоно уу.",
        variant: "destructive",
      });
    } finally {
      setWishLoading(false);
    }
  }, [
    customerId,
    isWishlisted,
    productId,
    refetchWishlist,
    toast,
    wishEntry,
    wishLoading,
    wishlistAdd,
    wishlistRemove,
  ]);
  const customFields = ((product as any)?.customFieldsData ?? {}) as Record<
    string,
    unknown
  >;
  const colorOptions = useMemo(
    () =>
      Array.isArray(customFields.colors)
        ? (customFields.colors as string[])
        : [],
    [customFields.colors]
  );
  const [activeColor, setActiveColor] = useState<string | null>(
    colorOptions[0] ?? null
  );

  useEffect(() => {
    setActiveColor(colorOptions[0] ?? null);
  }, [colorOptions]);

  const derivedFeatures =
    Array.isArray(customFields.features) && customFields.features.length > 0
      ? (customFields.features as string[])
      : typeof product?.description === "string"
      ? product.description
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 6)
      : [];

  const detailSections = [
    {
      title: "Care",
      content: typeof customFields.care === "string" ? customFields.care : null,
    },
    {
      title: "Shipping",
      content:
        typeof customFields.shipping === "string"
          ? customFields.shipping
          : null,
    },
    {
      title: "Returns",
      content:
        typeof customFields.returns === "string" ? customFields.returns : null,
    },
  ].filter((section) => section.content);

  const productReviews = useMemo<ProductReview[]>(() => {
    const items =
      productReviewsData?.cpProductReviews ?? initialProductReviews ?? [];
    if (!Array.isArray(items)) return [];
    return items.filter((entry): entry is ProductReview =>
      Boolean(entry && (!productId || entry.productId === productId))
    );
  }, [productId, productReviewsData?.cpProductReviews, initialProductReviews]);

  const userReview = useMemo(() => {
    if (!customerId) return null;
    return (
      productReviews.find((review) => review.customerId === customerId) ?? null
    );
  }, [customerId, productReviews]);

  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!userReview) {
      setRating(null);
      setReviewText("");
      return;
    }
    const value =
      typeof userReview.review === "number"
        ? userReview.review
        : Number(userReview.review);
    const normalized =
      Number.isFinite(value) && value > 0 ? Number(value) : null;
    setRating(normalized);
    setReviewText(userReview.description ?? "");
  }, [userReview]);

  const numericRatings = useMemo(() => {
    if (!productReviews.length) return [] as number[];
    return productReviews
      .map((entry) => {
        const value =
          typeof entry.review === "number"
            ? entry.review
            : Number(entry.review);
        return Number.isFinite(value) && value > 0 ? Number(value) : null;
      })
      .filter((value): value is number => value !== null);
  }, [productReviews]);

  const reviewsAverage = useMemo(() => {
    if (!numericRatings.length) return null;
    const total = numericRatings.reduce((sum, current) => sum + current, 0);
    return (total / numericRatings.length).toFixed(1);
  }, [numericRatings]);

  const reviewTotal = productReviews.length || reviewsCount;
  const ratingDisplay = reviewsAverage ?? averageRating;

  const rememberLocally = useCallback(
    (productId: string) => {
      rememberLastViewedProduct(productId);
    },
    []
  );

  const flushLocalLastViewed = useCallback(
    async (customer: string) => {
      if (!customer) {
        return;
      }
      const pending = getLocalLastViewedProducts();
      if (pending.length === 0) {
        return;
      }
      const results = await Promise.allSettled(
        pending.map((id) =>
          addToLastView({
            variables: {
              productId: id,
              customerId: customer,
            },
          })
        )
      );

      const hasFailure = results.some((result) => result.status === "rejected");
      if (!hasFailure) {
        clearLocalLastViewedProducts();
      }
    },
    [addToLastView]
  );

  const lastViewedKeyRef = useRef<string | null>(null);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const addTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addTimerRef.current) {
        clearTimeout(addTimerRef.current);
      }
    };
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product?._id || !inStock || buttonState === "adding") {
      return;
    }

    const unitPrice =
      typeof product.unitPrice === "number" &&
      Number.isFinite(product.unitPrice)
        ? product.unitPrice
        : 0;

    setButtonState("adding");

    try {
      await Promise.all([
        Promise.resolve(
          addToCart(
            {
              id: product._id,
              name: product.name ?? "Untitled product",
              unitPrice,
              description: product.description ?? "",
              imageUrl: product.attachment?.url ?? null,
              categoryName: product.category?.name ?? null,
            },
            1
          )
        ),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);

      setButtonState("added");
      if (addTimerRef.current) {
        clearTimeout(addTimerRef.current);
      }
      addTimerRef.current = setTimeout(() => {
        setButtonState("idle");
        addTimerRef.current = null;
      }, 1200);
    } catch (error) {
      console.error("Failed to add item to cart", error);
      setButtonState("idle");
    }
  }, [addToCart, buttonState, inStock, product]);

  useEffect(() => {
    if (!product?._id) {
      return;
    }

    const key = `${product._id}:${customerId ?? ""}`;
    if (lastViewedKeyRef.current === key) {
      return;
    }
    lastViewedKeyRef.current = key;

    if (customerId) {
      const run = async () => {
        try {
          await flushLocalLastViewed(customerId);
          await addToLastView({
            variables: {
              productId: product._id,
              customerId,
            },
          });
        } catch (error) {
          console.warn("Failed to update last viewed products", error);
        }
      };
      run();
      return;
    }

    rememberLocally(product._id);
  }, [
    product?._id,
    customerId,
    flushLocalLastViewed,
    addToLastView,
    rememberLocally,
  ]);

  const handleSubmitReview = useCallback(async () => {
    if (!productId) return;
    if (!customerId) {
      toast({
        title: "Please sign in",
        description: "Log in to leave a review.",
      });
      return;
    }
    if (!rating) {
      toast({
        title: "Select a rating",
        description: "Please choose a star rating before submitting.",
      });
      return;
    }

    setSubmittingReview(true);
    const payload = {
      productId,
      customerId,
      review: rating,
      description: reviewText.trim() || undefined,
    };

    try {
      if (userReview?._id) {
        await updateProductReview({
          variables: { _id: userReview._id, ...payload },
        });
        toast({ title: "Review updated" });
      } else {
        await addProductReview({ variables: payload });
        toast({ title: "Review submitted" });
      }
      await Promise.all([refetchReviews(), refetchAverage()]);
    } catch (error) {
      console.warn("Failed to submit review", error);
      toast({
        title: "Unable to submit review",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  }, [
    addProductReview,
    customerId,
    productId,
    rating,
    refetchAverage,
    refetchReviews,
    reviewText,
    toast,
    updateProductReview,
    userReview?._id,
  ]);

  const isLoading = productLoading || similarityLoading || reviewLoading;
  const hasError = Boolean(productError);

  return (
    <div className="mx-auto container px-4 py-10">
      <Button variant="ghost" asChild className="mb-6 w-fit">
        <Link
          href={isBuilder ? templateUrl("/products") : "/products"}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </Button>

      {!productId && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Invalid product identifier.
          </CardContent>
        </Card>
      )}

      {productId && (
        <>
          {hasError && (
            <Card className="mb-6 border-destructive/40 bg-destructive/10">
              <CardContent className="p-6 text-sm text-destructive">
                Unable to load this product right now. Please try again later.
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr]">
              <div className="h-[520px] animate-pulse rounded-3xl border border-border bg-muted/40" />
              <div className="space-y-4">
                <div className="h-10 w-2/3 animate-pulse rounded bg-muted/40" />
                <div className="h-6 w-1/3 animate-pulse rounded bg-muted/40" />
                <div className="h-32 animate-pulse rounded bg-muted/40" />
              </div>
            </div>
          )}

          {!isLoading && !product && !hasError && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Product not found.
              </CardContent>
            </Card>
          )}

          {product && (
            <div className="grid gap-12 lg:grid-cols-5">
              <div className="space-y-4 lg:col-span-3">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-muted shadow-sm lg:max-h-[800px] w-full mx-auto flex justify-center items-center">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name ?? "Product image"}
                      className="h-full w-auto object-cover lg:max-h-[800px]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      Image coming soon
                    </div>
                  )}
                </div>

                {gallery.length > 1 && (
                  <div className="grid grid-cols-6 gap-3">
                    {gallery.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImage(image)}
                        className={`relative aspect-square overflow-hidden rounded-xl border transition-all ${
                          selectedImage === image
                            ? "border-primary shadow-lg"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name ?? "Product"} thumbnail ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="product-detail space-y-6">
                  {product.description && (
                    <Card>
                      <CardContent className="prose max-w-none p-6 text-sm leading-6 text-muted-foreground">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: product.description,
                          }}
                        />
                      </CardContent>
                    </Card>
                  )}
                  {gallery.length > 1 && (
                    <div className="gap-3">
                      {gallery.map((image, index) => (
                        <button
                          type="button"
                          key={`${image}-${index}`}
                          onClick={() => setSelectedImage(image)}
                          className={`relative aspect-square overflow-hidden rounded-xl transition-all`}
                        >
                          <img
                            src={image}
                            alt={`${product.name ?? "Product"} thumbnail ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 lg:col-span-2">
                <div className="space-y-3">
                  {product.category?.name && (
                    <Badge variant="secondary" className="w-fit">
                      {product.category.name}
                    </Badge>
                  )}
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    {product.name ?? "Untitled product"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {product.code && <span>Code: {product.code}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <p className="text-3xl font-bold text-foreground md:text-4xl">
                    {formatCurrency(product.unitPrice)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            ratingDisplay &&
                            index < Math.round(Number(ratingDisplay))
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-foreground">
                      {ratingDisplay ?? "Not rated"}
                    </span>
                    {reviewTotal > 0 && <span>({reviewTotal} reviews)</span>}
                  </div>
                  <Badge variant={inStock ? "default" : "secondary"}>
                    {inStock ? "In stock" : "Out of stock"}
                  </Badge>
                </div>

                {colorOptions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Select ${color}`}
                          onClick={() => setActiveColor(color)}
                          className={`h-9 w-9 rounded-full border-2 transition-all ${
                            activeColor === color
                              ? "scale-110 border-primary ring-2 ring-primary/30"
                              : "border-border"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="flex-1"
                    disabled={!product?._id || !inStock || buttonState === "adding"}
                    onClick={handleAddToCart}
                  >
                    {!inStock
                      ? "Out of stock"
                      : buttonState === "adding"
                      ? "Adding..."
                      : buttonState === "added"
                      ? "Added to cart"
                      : "Add to cart"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    asChild
                  >
                    <Link
                      href={isBuilder ? templateUrl("/products") : "/products"}
                    >
                      Continue shopping
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-none rounded-full p-0 sm:w-14"
                    onClick={handleToggleWishlist}
                    disabled={wishLoading}
                    aria-label={isWishlisted ? "Хүслийн жагсаалтаас хасах" : "Хүслийн жагсаалтад нэмэх"}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        isWishlisted
                          ? "fill-red-500 stroke-red-500"
                          : "stroke-current"
                      }`}
                    />
                  </Button>
                </div>

                {derivedFeatures.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-border bg-card/60 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                      Features
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {derivedFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span
                            dangerouslySetInnerHTML={{ __html: feature }}
                          ></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailSections.length > 0 && (
                  <Accordion
                    type="single"
                    collapsible
                    className="rounded-2xl border border-border bg-card/60 p-2"
                  >
                    {detailSections.map((section, index) => (
                      <AccordionItem
                        key={section.title}
                        value={`detail-${index}`}
                        className="border-b border-border last:border-b-0"
                      >
                        <AccordionTrigger className="text-base font-semibold">
                          {section.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {section.content as string}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          )}

          {product && (
            <ProductReviews
              customerId={customerId}
              productId={productId}
              ratingDisplay={ratingDisplay}
              reviewTotal={reviewTotal}
              reviewsLoading={reviewsLoading}
              productReviews={productReviews}
              rating={rating}
              reviewText={reviewText}
              submittingReview={submittingReview}
              hasUserReview={Boolean(userReview?._id)}
              onRatingChange={setRating}
              onReviewTextChange={setReviewText}
              onSubmitReview={handleSubmitReview}
            />
          )}

          {product && similarProducts.length > 0 && (
            <section className="mt-16 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                  You might also like
                </h2>
                <Button variant="ghost" asChild>
                  <Link
                    href={isBuilder ? templateUrl("/products") : "/products"}
                  >
                    View all
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {similarProducts.slice(0, 4).map((item) => (
                  <Card
                    key={item._id}
                    className="group overflow-hidden border border-border transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {item.attachment?.url ? (
                        <img
                          src={item.attachment.url}
                          alt={item.name ?? "Similar product"}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Image coming soon
                        </div>
                      )}
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <div className="space-y-1">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {item.name ?? "Untitled product"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(
                            typeof item.unitPrice === "number"
                              ? item.unitPrice
                              : null
                          )}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Link
                          href={
                            isBuilder
                              ? templateUrl(`/products/${item._id}`)
                              : `/products/${item._id}`
                          }
                        >
                          View
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
