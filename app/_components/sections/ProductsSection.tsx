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
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `₮${Math.round(value).toLocaleString()}`;
};

type ButtonState = "idle" | "adding" | "added";

const ProductsSection = ({ section }: { section: Section }) => {
  const limit = Number(section.config?.limit ?? 6);
  const categoryId = section.config?.categoryId || null;
  const tag = section.config?.tag || null;
  const { addToCart } = useCart();
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({});
  const isBuilder = isBuildMode();
  const buttonTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(buttonTimers.current).forEach(clearTimeout);
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
    const payload = data?.cpPoscProducts as unknown;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    // @ts-expect-error legacy shape
    return payload.products ?? [];
  }, [data]);

  const title = section.config?.title;
  const description = section.config?.description || "";

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
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {(title || description) && (
          <div className="mb-10">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Unable to load products. Please try again later.
          </div>
        )}

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? Array.from({ length: limit || 4 }) : products).map(
            (product: ProductSummary, index: number) => {
              if (loading) {
                return (
                  <Card key={`placeholder-${index}`} className="animate-pulse overflow-hidden">
                    <CardHeader className="h-48 bg-muted p-0" />
                    <CardContent className="space-y-2 p-4">
                      <div className="h-4 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </CardContent>
                  </Card>
                );
              }

              const imageUrl = product?.attachment?.url;
              const price = toCurrency(product?.unitPrice);
              const inStock = true;
              const unitPrice =
                typeof product?.unitPrice === "number" && Number.isFinite(product.unitPrice)
                  ? product.unitPrice
                  : 0;
              const cartProductId = product?._id ?? "";
              const state = cartProductId ? buttonStates[cartProductId] : undefined;
              const isAdding = state === "adding";
              const isAdded = state === "added";

              const handleAddToCart = async () => {
                if (!cartProductId) return;
                setButtonStates((prev) => ({ ...prev, [cartProductId]: "adding" }));
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
                  setButtonStates((prev) => ({ ...prev, [cartProductId]: "added" }));
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
                } catch {
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
                  className="group flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md"
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product?.name ?? ""}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2 p-4">
                    <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
                      {product?.name ?? "Untitled product"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      <span dangerouslySetInnerHTML={toHtml(product?.description ?? "")} />
                    </CardDescription>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-sm font-semibold text-primary">{price}</span>
                      <Badge variant={inStock ? "default" : "secondary"} className="text-xs">
                        {inStock ? "In stock" : "Out of stock"}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center gap-2 border-t border-border p-3">
                    <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                      <Link
                        href={
                          isBuilder
                            ? templateUrl(`/product&productId=${product._id}`)
                            : `/products/${product._id}`
                        }
                      >
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      disabled={!inStock || !cartProductId || isAdding}
                      onClick={handleAddToCart}
                    >
                      {isAdding ? "Adding…" : isAdded ? "Added" : "Add to cart"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            }
          )}
        </div>

        {section.config?.primaryCtaUrl && (
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link
                href={
                  isBuilder
                    ? templateUrl(section.config.primaryCtaUrl)
                    : section.config.primaryCtaUrl
                }
              >
                {section.config.primaryCta || "View all"}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
