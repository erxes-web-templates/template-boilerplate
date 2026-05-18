"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProductsQuery, type ProductSummary } from "../../../graphql/products";
import { Section } from "../../../types/sections";
import { templateUrl } from "@/lib/utils";
import { isBuildMode } from "../../../lib/buildMode";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import ProductCard from "../../../components/common/ProductCard";

const ProductsSection = ({ section }: { section: Section }) => {
  const limit = Number(section.config?.limit ?? 6);
  const categoryId = section.config?.categoryId || null;
  const tag = section.config?.tag || null;
  const isBuilder = isBuildMode();

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
                  <div
                    key={`placeholder-${index}`}
                    className="animate-pulse overflow-hidden rounded-lg border bg-card"
                  >
                    <div className="h-48 bg-muted" />
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                );
              }

              return (
                <ProductCard
                  key={product?._id || index}
                  product={{
                    id: product?._id ?? "",
                    name: product?.name ?? "Untitled product",
                    price:
                      typeof product?.unitPrice === "number" &&
                      Number.isFinite(product.unitPrice)
                        ? product.unitPrice
                        : 0,
                    categoryName: product?.category?.name ?? "Uncategorized",
                    image: product?.attachment?.url ?? null,
                    inStock:
                      typeof product?.remainder === "number" &&
                      Number.isFinite(product.remainder)
                        ? (product.remainder || 999) > 0 // TODO: remove || 999 once API returns real remainder
                        : true,
                    description: product?.description ?? "",
                  }}
                />
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
