"use client";

import Image from "next/image";
import { getFileUrl } from "../../lib/utils";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Ban, Check, ImageOff, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../../lib/CartContext";
import { templateUrl } from "../../lib/utils";
import { isBuildMode } from "../../lib/buildMode";
type ButtonState = "idle" | "adding" | "added";

export type ProductCardProduct = {
  id: string;
  name: string;
  price: number;
  categoryName?: string | null;
  image?: string | null;
  inStock: boolean;
  description?: string | null;
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
              description: product.description ?? "",
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

  const href = isBuilder
    ? templateUrl(`/product&productId=${product.id}`)
    : `/products/${product.id}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {product.image ? (
          <Image
            src={getFileUrl(product.image)}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              product.inStock ? "" : "opacity-40 grayscale"
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {product.categoryName ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
            {product.categoryName}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price and the single action share the footer row, pinned to the
            bottom so cards in a grid line up whatever the title length. */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            {formatCurrency(product.price)}
          </span>

          <Button
            size="icon"
            variant="accent"
            className="h-10 w-10 shrink-0 rounded-full"
            disabled={!product.inStock || !product.id || isAdding}
            onClick={handleAddToCart}
            aria-label={product.name}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAdded ? (
              <Check className="h-4 w-4" />
            ) : product.inStock ? (
              <ShoppingCart className="h-4 w-4" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
