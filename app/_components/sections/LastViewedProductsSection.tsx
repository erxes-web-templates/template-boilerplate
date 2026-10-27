"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { Section } from "@site-core/types/sections";
import authQueries from "@site-core/graphql/auth/queries";
import orderQueries from "@site-core/graphql/order/queries";
import { useProductsQuery } from "@site-core/graphql/products";
import { getFileUrl, templateUrl } from "@/lib/utils";
import { isBuildMode } from "@site-core/lib/buildMode";
import EmptyState from "@/components/common/EmptyState";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocalLastViewedProducts } from "@site-core/lib/lastViewedProducts";
import { useSiteText } from "../siteText";

type ViewedProduct = {
  _id: string;
  productId?: string | null;
  updatedAt?: string | null;
  product?: {
    _id?: string | null;
    name?: string | null;
    description?: string | null;
    unitPrice?: number | null;
    attachment?: {
      url?: string | null;
    } | null;
    createdAt?: string | null;
  } | null;
};

const CP_LAST_VIEWED_ITEMS = orderQueries.cpLastViewedItems;

const formatNumber = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "₮0";
  }
  return `₮${Math.round(value).toLocaleString()}`;
};

const LastViewedProductsSection = ({ section }: { section: Section }) => {
  const t = useSiteText();
  const title = section.config?.title ?? "Recently viewed products";
  const description = section.config?.description ?? "";
  const limit = Math.max(1, Number(section.config?.limit ?? 6));
  const fallbackCustomerId: string | null = section.config?.customerId ?? null;
  const isBuilder = isBuildMode();
  const [localProductIds, setLocalProductIds] = useState<string[]>([]);

  const { data: userData } = useQuery(authQueries.currentUser);
  const resolvedCustomerId =
    userData?.clientPortalCurrentUser?.erxesCustomerId ?? fallbackCustomerId;

  const {
    data: viewedData,
    loading,
    error,
  } = useQuery(CP_LAST_VIEWED_ITEMS, {
    variables: {
      customerId: resolvedCustomerId ?? "",
      limit,
    },
    skip: !resolvedCustomerId,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: guestProductsData,
    loading: guestProductsLoading,
    error: guestProductsError,
  } = useProductsQuery({
    variables: {
      ids: localProductIds,
      perPage: limit,
    },
    skip: resolvedCustomerId !== null || localProductIds.length === 0,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (resolvedCustomerId) {
      setLocalProductIds([]);
      return;
    }

    setLocalProductIds(getLocalLastViewedProducts().slice(-limit).reverse());
  }, [limit, resolvedCustomerId]);

  const viewedItems: ViewedProduct[] = useMemo(
    () => viewedData?.cpLastViewedItems ?? [],
    [viewedData]
  );

  const guestViewedItems: ViewedProduct[] = useMemo(() => {
    const products = guestProductsData?.cpPoscProducts ?? [];
    const productMap = new Map(products.map((product) => [product._id, product]));

    return localProductIds.reduce<ViewedProduct[]>((acc, productId) => {
        const product = productMap.get(productId);

        if (!product) {
          return acc;
        }

        acc.push({
          _id: productId,
          productId,
          product: {
            _id: product._id,
            createdAt: null,
            attachment: product.attachment ?? null,
            unitPrice: product.unitPrice ?? null,
            name: product.name ?? null,
            description: product.description ?? null,
          },
        });

        return acc;
      }, []);
  }, [guestProductsData, localProductIds]);

  const activeItems = resolvedCustomerId ? viewedItems : guestViewedItems;
  const activeLoading = resolvedCustomerId ? loading : guestProductsLoading;
  const activeError = resolvedCustomerId ? error : guestProductsError;
  const emptyTitle = resolvedCustomerId
    ? t("recent.emptyTitle")
    : t("recent.guestEmptyTitle");
  const emptyDescription = resolvedCustomerId
    ? t("recent.emptyBody")
    : t("recent.guestEmptyBody");

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-3 text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {activeError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {t("recent.loadError")}
          </div>
        ) : !activeLoading && activeItems.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-6">
            {(activeLoading
              ? Array.from({ length: Math.min(limit, 6) })
              : activeItems
            ).map((entry: any, index) => {
              if (activeLoading) {
                return (
                  <Card key={`placeholder-${index}`} className="animate-pulse">
                    <CardHeader className="h-28 bg-muted/60" />
                    <CardContent className="space-y-2 p-3">
                      <div className="h-3 w-3/4 rounded bg-muted/80" />
                      <div className="h-3 w-1/2 rounded bg-muted/60" />
                    </CardContent>
                    <CardFooter className="h-8 bg-muted/40" />
                  </Card>
                );
              }

              const product = entry?.product;
              const imageKey = product?.attachment?.url;
              const imageUrl = imageKey ? getFileUrl(imageKey) : null;
              const viewedAt = entry?.updatedAt || product?.createdAt || null;

              return (
                <Card
                  key={entry?._id ?? `viewed-${index}`}
                  className="flex h-full flex-col overflow-hidden border border-muted/60"
                >
                  <div className="relative h-28 w-full bg-muted">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={product?.name ?? t("products.untitled")}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        {t("products.noImage")}
                      </div>
                    )}
                  </div>
                  <CardHeader className="space-y-1 p-3">
                    <CardTitle className="line-clamp-2 text-sm font-semibold">
                      {product?.name ?? t("products.untitled")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0 text-xs">
                    <p className="font-medium text-foreground">
                      {formatNumber(product?.unitPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {viewedAt
                        ? new Date(viewedAt).toLocaleString()
                        : t("recent.unknownTime")}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto border-t bg-muted/40 p-3">
                    <Button asChild variant="outline" size="sm" className="w-full text-xs">
                      <Link
                        href={
                          isBuilder
                            ? templateUrl(
                                product?._id
                                  ? `/product&productId=${product._id}`
                                  : "/products"
                              )
                            : product?._id
                              ? `/products/${product._id}`
                              : "/products"
                        }
                      >
                        {t("products.view")}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default LastViewedProductsSection;
