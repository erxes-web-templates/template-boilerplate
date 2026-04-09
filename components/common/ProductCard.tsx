"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "../../lib/CartContext";
import { templateUrl } from "../../lib/utils";
import { isBuildMode } from "../../lib/buildMode";
import { toHtml, type HtmlValue } from "../../lib/html";

type ButtonState = "idle" | "adding" | "added";

export type ProductCardProduct = {
  id: string;
  name: string;
  price: number;
  categoryName?: string | null;
  image?: string | null;
  inStock: boolean;
  description?: HtmlValue;
};

type ProductCardProps = {
  product: ProductCardProduct;
};

const formatCurrency = (value: number) =>
  `₮${Math.round(value).toLocaleString()}`;

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isBuilder = isBuildMode();
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleAddToCart = async () => {
    if (!product.id || !product.inStock || buttonState === "adding") {
      return;
    }

    setButtonState("adding");

    try {
      await Promise.all([
        Promise.resolve(
          addToCart(
            {
              id: product.id,
              name: product.name || "Untitled product",
              unitPrice: Number.isFinite(product.price) ? product.price : 0,
              description:
                typeof product.description === "string"
                  ? product.description
                  : String(product.description?.__html ?? ""),
              imageUrl: product.image ?? null,
              categoryName: product.categoryName ?? null,
            },
            1,
          ),
        ),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);

      setButtonState("added");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:open"));
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setButtonState("idle");
        timerRef.current = null;
      }, 1200);
    } catch (error) {
      console.error("Failed to add product to cart", error);
      setButtonState("idle");
    }
  };

  const isAdding = buttonState === "adding";
  const isAdded = buttonState === "added";

  return (
    <Card className="overflow-hidden border border-border transition-shadow hover:shadow-lg">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center text-sm text-muted-foreground">
            Image coming soon
          </div>
        )}
        {product.categoryName ? (
          <Badge className="absolute left-4 top-4">{product.categoryName}</Badge>
        ) : null}
      </div>

      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {product.name}
            </h3>
            {product.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                <span dangerouslySetInnerHTML={toHtml(product.description)} />
              </p>
            ) : null}
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
          <Badge variant={product.inStock ? "default" : "secondary"}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>

        <div className="flex gap-3">
          <Button asChild className="w-full">
            <Link
              href={
                isBuilder
                  ? templateUrl(`/product&productId=${product.id}`)
                  : `/products/${product.id}`
              }
            >
              View Details
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={!product.inStock || !product.id || isAdding}
            onClick={handleAddToCart}
          >
            {!product.inStock
              ? "Out of stock"
              : isAdding
              ? "Adding..."
              : isAdded
                ? "Added to cart"
                : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
