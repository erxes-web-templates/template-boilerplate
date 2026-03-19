"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useProductCategoriesQuery,
  useProductsQuery,
  type ProductCategory,
} from "../../graphql/products";
import type { ProductSummary } from "../../graphql/products/types";
import { useCart } from "../../lib/CartContext";
import { templateUrl } from "../../lib/utils";
import { isBuildMode } from "../../lib/buildMode";

type SortOption = "featured" | "price-low" | "price-high" | "name-az";

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string | null;
  categoryName: string;
  image?: string | null;
  inStock: boolean;
  description?: string | null;
}

interface SortOptionConfig {
  value: SortOption;
  label: string;
}

const SORT_OPTIONS: SortOptionConfig[] = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-az", label: "Name: A to Z" },
];

const DEFAULT_PRICE_RANGE: [number, number] = [0, 0];

const formatCurrency = (value: number) =>
  `₮${Math.round(value).toLocaleString()}`;

type ButtonState = "idle" | "adding" | "added";

type ProductsPageProps = {
  initialCategories?: ProductCategory[];
  initialProducts?: ProductSummary[];
};

export default function ProductsPage({
  initialCategories,
  initialProducts,
}: ProductsPageProps) {
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("searchValue")?.trim() ?? "";
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>(
    {}
  );
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

  const notifyCartOpen = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(new Event("cart:open"));
  };
  const isBuilder = isBuildMode();

  const { addToCart } = useCart();

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useProductCategoriesQuery({
    variables: {
      perPage: 100,
      excludeEmpty: false,
    },
    fetchPolicy: "cache-first",
  });

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useProductsQuery({
    variables: {
      perPage: 100,
      page: 1,
      searchValue: searchValue || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const categories: ProductCategory[] = useMemo(
    () => categoriesData?.cpPoscProductCategories ?? initialCategories ?? [],
    [categoriesData, initialCategories]
  );

  const products: DisplayProduct[] = useMemo(() => {
    const list = productsData?.cpPoscProducts ?? initialProducts ?? [];
    return list.map((product) => ({
      id: product._id,
      name: product.name ?? "Untitled product",
      price: typeof product.unitPrice === "number" ? product.unitPrice : 0,
      categoryId: product.category?._id ?? null,
      categoryName: product.category?.name ?? "Uncategorized",
      image: product.attachment?.url ?? null,
      inStock:
        typeof product.remainder === "number" &&
        Number.isFinite(product.remainder)
          ? product.remainder > 0
          : false,
      description: product.description,
    }));
  }, [productsData]);

  const priceBounds = useMemo<[number, number]>(() => {
    if (!products.length) {
      return DEFAULT_PRICE_RANGE;
    }

    const prices = products
      .map((product) => product.price)
      .filter((price) => typeof price === "number" && !Number.isNaN(price));

    if (!prices.length) {
      return DEFAULT_PRICE_RANGE;
    }

    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  useEffect(() => {
    const hasBounds = priceBounds[0] !== priceBounds[1] || priceBounds[0] !== 0;
    if (!priceInitialized && hasBounds) {
      setPriceRange(priceBounds);
      setPriceInitialized(true);
    }
  }, [priceBounds, priceInitialized]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredProducts = useMemo(() => {
    const matchesCategory = (product: DisplayProduct) =>
      selectedCategories.length === 0 ||
      (product.categoryId && selectedCategories.includes(product.categoryId));

    const matchesPrice = (product: DisplayProduct) => {
      if (priceBounds[0] === priceBounds[1]) {
        return true;
      }
      return product.price >= priceRange[0] && product.price <= priceRange[1];
    };

    const candidateProducts = products.filter(
      (product) => matchesCategory(product) && matchesPrice(product)
    );

    return candidateProducts.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name-az":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [priceBounds, priceRange, products, selectedCategories, sortBy]);

  const isLoading = productsLoading || categoriesLoading;
  const hasError = Boolean(productsError || categoriesError);
  const hasPriceRange = priceBounds[0] !== priceBounds[1];

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-sm font-semibold">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category._id}`}
                checked={selectedCategories.includes(category._id)}
                onCheckedChange={() => toggleCategory(category._id)}
              />
              <Label
                htmlFor={`category-${category._id}`}
                className="text-sm font-medium"
              >
                {category.name}
              </Label>
            </div>
          ))}
          {!categories.length && !categoriesLoading && (
            <p className="text-sm text-muted-foreground">
              No categories available.
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold">Price Range</h3>
        <Slider
          step={1}
          value={priceRange}
          onValueChange={(value: any) => setPriceRange([value[0], value[1]])}
          className="mt-4"
          min={priceBounds[0]}
          max={hasPriceRange ? priceBounds[1] : priceBounds[0] + 1}
          disabled={!hasPriceRange}
        />
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-8xl gap-8 px-4 py-12 md:grid-cols-[280px_1fr]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <Select
            value={sortBy}
            onValueChange={(value: string) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:block">
          <FilterContent />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading products..."
              : `${filteredProducts.length} product${
                  filteredProducts.length === 1 ? "" : "s"
                }`}
          </p>
        </div>

        {hasError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            Unable to load products right now. Please try again in a moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-72 animate-pulse rounded-xl border border-border bg-muted/40"
                />
              ))}

            {!isLoading &&
              filteredProducts.map((product) => {
                const imageUrl = product.image ?? undefined;
                const inStock = true;
                // const inStock = product.inStock;
                const unitPrice = Number.isFinite(product.price)
                  ? product.price
                  : 0;
                const cartProductId = product.id;
                const buttonState = buttonStates[cartProductId];
                const isAdding = buttonState === "adding";
                const isAdded = buttonState === "added";

                const handleAddToCart = async () => {
                  if (!cartProductId || isAdding) {
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
                            name: product.name ?? "Untitled product",
                            unitPrice,
                            description: product.description ?? "",
                            imageUrl: imageUrl ?? null,
                            categoryName: product.categoryName ?? null,
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

                    notifyCartOpen();

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
                    console.error("Failed to add product to cart", error);
                    setButtonStates((prev) => {
                      const next = { ...prev };
                      delete next[cartProductId];
                      return next;
                    });
                  }
                };

                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden border border-border transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-square w-full  overflow-hidden bg-muted">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex aspect-square w-full  items-center justify-center text-sm text-muted-foreground">
                          Image coming soon
                        </div>
                      )}
                      <Badge className="absolute left-4 top-4">
                        {product.categoryName}
                      </Badge>
                    </div>
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: product.description,
                                }}
                              />
                            </p>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>Rating unavailable</span>
                        </div>
                        <Badge
                          variant={product.inStock ? "default" : "secondary"}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>

                      <div className="flex gap-3">
                        <Button asChild className="w-full">
                          <Link
                            href={
                              isBuilder
                                ? templateUrl(
                                    `/product&productId=${product.id}`
                                  )
                                : `/products/${product.id}`
                            }
                          >
                            View Details
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={!inStock || !cartProductId || isAdding}
                          onClick={handleAddToCart}
                        >
                          {isAdding
                            ? "Adding..."
                            : isAdded
                            ? "Added to cart"
                            : "Add to Cart"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {!isLoading && !hasError && filteredProducts.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              No products found
            </h3>
            <p className="text-sm text-muted-foreground">
              {`Try adjusting your filters to find what you&apos;re looking for.`}{" "}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
