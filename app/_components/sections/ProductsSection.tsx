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
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return `₮${Math.round(value).toLocaleString()}`;
};

type ButtonState = "idle" | "adding" | "added";

const ProductsSection = ({ section }: { section: Section }) => {
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
    const payload = data?.cpPoscProducts as unknown;
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
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-purple-100/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
      
      <div className="container relative mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-destructive/40 bg-gradient-to-r from-destructive/10 to-destructive/5 p-4 text-sm text-destructive backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500">
            Unable to load products right now. Please try again later.
          </div>
        )}

        <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? Array.from({ length: limit || 3 }) : products).map(
            (product: ProductSummary, index: number) => {
              if (loading) {
                return (
                  <Card 
                    key={`placeholder-${index}`} 
                    className="animate-pulse overflow-hidden border-purple-200/50 shadow-lg"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <CardHeader className="h-52 bg-gradient-to-br from-purple-100/60 to-purple-50/40" />
                    <CardContent className="space-y-4 p-5">
                      <div className="h-4 w-2/3 rounded-full bg-gradient-to-r from-purple-200/80 to-purple-100/60" />
                      <div className="h-3 w-1/2 rounded-full bg-gradient-to-r from-purple-200/70 to-purple-100/50" />
                      <div className="h-3 w-full rounded-full bg-gradient-to-r from-purple-200/60 to-purple-100/40" />
                    </CardContent>
                    <CardFooter className="h-12 bg-gradient-to-br from-purple-100/40 to-purple-50/20" />
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
                  className="group flex h-full flex-col overflow-hidden border-purple-200/50 bg-gradient-to-br from-card to-purple-50/30 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200/50 hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-purple-100/80 to-purple-50/40">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product?.name ?? "Product"}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center text-purple-400 bg-gradient-to-br from-purple-100/60 to-purple-50/30">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                    <div>
                      <CardTitle className="text-lg font-semibold transition-colors duration-300 group-hover:text-purple-600">
                        {product?.name ?? "Untitled product"}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2 text-sm">
                        <span
                          dangerouslySetInnerHTML={toHtml(
                            product?.description ?? ""
                          )}
                        ></span>
                      </CardDescription>
                    </div>
                    <div className="mt-auto space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent text-lg">
                          {price}
                        </span>
                        <Badge 
                          variant={inStock ? "default" : "secondary"}
                          className="transition-all duration-300 group-hover:scale-105 bg-purple-600 hover:bg-purple-700"
                        >
                          {inStock ? "In stock" : "Out of stock"}
                        </Badge>
                      </div>
                      {product?.category?.name && (
                        <p className="text-xs text-muted-foreground">
                          Category: {product.category.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="block md:flex items-center justify-end gap-2 border-t border-purple-200/50 bg-gradient-to-r from-purple-50/30 to-purple-100/10 p-4 backdrop-blur-sm">
                    <Button 
                      asChild 
                      variant="default" 
                      size="sm"
                      className="transition-all duration-300 hover:scale-105 hover:shadow-lg bg-purple-600 hover:bg-purple-700"
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
                      disabled={!inStock || !cartProductId || isAdding}
                      onClick={handleAddToCart}
                      className="transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
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

        <div className="mt-14 text-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "400ms" }}>
          <Button 
            asChild 
            variant="outline" 
            className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-600/5 border-purple-300 text-purple-700 hover:text-purple-800"
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