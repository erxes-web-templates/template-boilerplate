"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import ecommerceQueries from "../../../graphql/products/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "../../../types/sections";
import { getFileUrl, templateUrl } from "@/lib/utils";
import { isBuildMode } from "../../../lib/buildMode";
import EmptyState from "@/components/common/EmptyState";

type ProductCategory = {
  _id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  attachment?: {
    url?: string | null;
  } | null;
};

const ProductCategoriesSection = ({ section }: { section: Section }) => {
  const selectedCategories: string[] = section.config?.categories ?? [];
  const title = section.config?.title ?? "Featured categories";
  const description = section.config?.description ?? "";
  const isBuilder = isBuildMode();

  const { data, loading, error } = useQuery(
    ecommerceQueries.productCategories,
    {
      variables: {
        perPage: 500,
        sortField: "order",
        sortDirection: 1,
      },
      fetchPolicy: "cache-first",
    }
  );

  const categories = useMemo<ProductCategory[]>(() => {
    const allCategories: ProductCategory[] = data?.cpPoscProductCategories ?? [];
    if (!selectedCategories || selectedCategories.length === 0) {
      return allCategories;
    }
    const selectedSet = new Set(selectedCategories);
    return allCategories.filter((category) => selectedSet.has(category._id));
  }, [data, selectedCategories]);

  if (!loading && !error && categories.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <EmptyState
            title="No categories selected"
            description="Add product categories in the editor to feature them here."
          />
        </div>
      </section>
    );
  }
  console.log(categories, "cattt");

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-3 text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load categories right now. Please try again later.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(loading ? Array.from({ length: 6 }) : categories).map(
            (category: any, index) => {
              if (loading) {
                return (
                  <Card key={`placeholder-${index}`} className="animate-pulse">
                    <CardHeader className="h-48 bg-muted/60" />
                    <CardContent className="space-y-3">
                      <div className="h-4 w-1/2 rounded bg-muted/80" />
                      <div className="h-3 w-full rounded bg-muted/60" />
                    </CardContent>
                  </Card>
                );
              }

              const imageKey = category?.attachment?.url || "";
              let imageUrl: string | undefined;
              if (imageKey) {
                try {
                  imageUrl = getFileUrl(imageKey);
                } catch {
                  imageUrl = imageKey;
                }
              }

              return (
                <Card key={category._id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    {imageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden bg-muted">
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3 p-5">
                    <CardTitle className="text-lg font-semibold">
                      {category.name}
                    </CardTitle>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {category.description}
                      </p>
                    )}
                    <div className="pt-3">
                      <Link
                        href={
                          isBuilder
                            ? `${templateUrl("/products")}${
                                category._id
                                  ? `&categoryId=${category._id}`
                                  : ""
                              }`
                            : category._id
                            ? `/products?categoryId=${category._id}`
                            : "/products"
                        }
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View products
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
