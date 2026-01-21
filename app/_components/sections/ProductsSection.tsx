"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useProductsQuery,
  type ProductSummary,
} from "../../../graphql/products";
import { Section } from "../../../types/sections";
import { toHtml } from "../../../lib/html";
import { templateUrl } from "@/lib/utils";
import { isBuildMode } from "../../../lib/buildMode";
import { useParams } from "next/navigation";
import useClientPortal from "@/hooks/useClientPortal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/common/EmptyState";
import { useCart } from "../../../lib/CartContext";

const toCurrency = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return `₮${Math.round(value).toLocaleString()}`;
};

type ButtonState = "idle" | "adding" | "added";

const ProductsSection = ({ section }: { section: Section }) => {
  const params = useParams<{ id: string }>();
  const { cpDetail } = useClientPortal({ id: params.id });
  const limit = Number(section.config?.limit ?? 6);
  const categoryId = section.config?.categoryId || null;
  const tag = section.config?.tag || null;
  const { addToCart } = useCart();
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>(
    {}
  );
  const isBuilder = isBuildMode();
  const buttonTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  useEffect(() => {
    return () => {
      Object.values(buttonTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const { data, loading, error } = useProductsQuery({
    variables: {
      perPage: limit,
      page: 1,
      categoryId: categoryId || undefined,
      tag: tag || undefined,
      sortField: "createdAt",
      sortDirection: -1,
    },
    fetchPolicy: "cache-first",
  });

  const products = useMemo(() => {
    const payload = data?.poscProducts as unknown;
    if (!payload) {
      return [];
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    // @ts-expect-error legacy shape
    return payload.products ?? [];
  }, [data]);

  const title = section.config?.title || "Latest products";
  const description = section.config?.description || "";

  const sectionStyles = useMemo(() => {
    const styles = cpDetail?.styles || {};
    const overrides = styles.productsSection || {};
    return {
      baseColor: overrides.baseColor || "var(--primary)",
      backgroundColor: overrides.backgroundColor || "var(--background)",
      activeTabColor: overrides.activeTabColor || "var(--accent)",
      baseFont: overrides.baseFont || "var(--font-body)",
      headingFont: overrides.headingFont || "var(--font-heading)",
    };
  }, [cpDetail?.styles]);

  if (!loading && !error && products.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <EmptyState
            title="No products available"
            description="Try adjusting your filters or add products from POS."
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16"
      style={{
        backgroundColor: sectionStyles.backgroundColor,
        color: sectionStyles.baseColor,
        fontFamily: sectionStyles.baseFont,
      }}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: sectionStyles.headingFont }}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-base text-current opacity-70">
              {description}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load products right now. Please try again later.
          </div>
        )}

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? Array.from({ length: limit || 3 }) : products).map(
            (product: ProductSummary, index) => {
              if (loading) {
                return (
                  <Card key={`placeholder-${index}`} className="animate-pulse">
                    <CardHeader className="h-52 bg-muted/60" />
                    <CardContent className="space-y-4">
                      <div className="h-4 w-1/2 rounded bg-muted/80" />
                      <div className="h-3 w-1/3 rounded bg-muted/70" />
                      <div className="h-3 w-full rounded bg-muted/60" />
                    </CardContent>
                    <CardFooter className="h-10 bg-muted/40" />
                  </Card>
                );
              }

              const imageKey = product?.attachment?.url;
              let imageUrl: string | undefined;
              if (imageKey) {
                try {
                  imageUrl = imageKey;
                } catch {
                  imageUrl = imageKey;
                }
              }

              const price = toCurrency(product?.unitPrice);
              // const inStock = (product?.remainder ?? 0) > 0;
              const inStock = true;
              const unitPrice =
                typeof product?.unitPrice === "number" &&
                Number.isFinite(product.unitPrice)
                  ? product.unitPrice
                  : 0;
              const cartProductId = product?._id ?? "";
              const state = cartProductId
                ? buttonStates[cartProductId]
                : undefined;
              const isAdding = state === "adding";
              const isAdded = state === "added";

              const handleAddToCart = async () => {
                if (!cartProductId) {
                  return;
                }

                setButtonStates((prev) => ({
                  ...prev,
                  [cartProductId]: "adding",
                }));

                try {
                  await Promise.all([
                    Promise.resolve(
                      addToCart(
                        {
                          id: cartProductId,
                          name: product?.name ?? "Untitled product",
                          unitPrice,
                          description: product?.description ?? "",
                          imageUrl: imageUrl ?? null,
                          categoryName: product?.category?.name ?? null,
                        },
                        1
                      )
                    ),
                    new Promise((resolve) => setTimeout(resolve, 400)),
                  ]);

                  setButtonStates((prev) => ({
                    ...prev,
                    [cartProductId]: "added",
                  }));

                  if (buttonTimers.current[cartProductId]) {
                    clearTimeout(buttonTimers.current[cartProductId]);
                  }

                  buttonTimers.current[cartProductId] = setTimeout(() => {
                    setButtonStates((prev) => {
                      const next = { ...prev };
                      delete next[cartProductId];
                      return next;
                    });
                    delete buttonTimers.current[cartProductId];
                  }, 1200);
                } catch (error) {
                  console.error("Failed to add item to cart", error);
                  setButtonStates((prev) => {
                    const next = { ...prev };
                    delete next[cartProductId];
                    return next;
                  });
                }
              };

              return (
                <Card
                  key={product?._id || index}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm"
                  style={{
                    borderColor: sectionStyles.activeTabColor,
                    backgroundColor: sectionStyles.backgroundColor,
                  }}
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product?.name ?? "Product"}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex aspect-square w-full  items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {product?.name ?? "Untitled product"}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2 text-sm text-current opacity-70">
                        <span
                          dangerouslySetInnerHTML={toHtml(
                            product?.description ?? ""
                          )}
                        ></span>
                      </CardDescription>
                    </div>
                    <div className="mt-auto space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {price}
                        </span>
                        <Badge
                          variant={inStock ? "default" : "secondary"}
                          style={{
                            backgroundColor: sectionStyles.activeTabColor,
                            color: sectionStyles.backgroundColor,
                          }}
                        >
                          {inStock ? "In stock" : "Out of stock"}
                        </Badge>
                      </div>
                      {product?.category?.name && (
                        <p className="sr-only">
                          Category: {product.category.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter
                    className="block md:flex items-center justify-end gap-2 border-t p-4"
                    style={{ borderColor: sectionStyles.activeTabColor }}
                  >
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full"
                      style={{
                        backgroundColor: sectionStyles.activeTabColor,
                        color: sectionStyles.backgroundColor,
                      }}
                    >
                      <Link
                        href={
                          isBuilder
                            ? templateUrl(`/product&productId=${product._id}`)
                            : `/products/${product._id}`
                        }
                      >
                        View product
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      style={{
                        borderColor: sectionStyles.activeTabColor,
                        color: sectionStyles.baseColor,
                      }}
                      disabled={!inStock || !cartProductId || isAdding}
                      onClick={handleAddToCart}
                    >
                      {isAdding
                        ? "Adding..."
                        : isAdded
                        ? "Added to cart"
                        : "Add to cart"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            }
          )}
        </div>

        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            className="rounded-full"
            style={{
              borderColor: sectionStyles.activeTabColor,
              color: sectionStyles.baseColor,
            }}
          >
            <Link href={isBuilder ? templateUrl("/products") : "/products"}>
              Browse all products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
