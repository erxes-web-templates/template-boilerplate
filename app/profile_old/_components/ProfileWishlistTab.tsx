"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFileUrl, templateUrl } from "@/lib/utils";
import Link from "next/link";

type WishlistItem = {
  _id: string;
  product?: {
    _id?: string;
    name?: string | null;
    description?: string | null;
    unitPrice?: number | null;
    remainder?: number | null;
    attachment?: {
      url?: string | null;
    };
  } | null;
};

type ProfileWishlistTabProps = {
  items: WishlistItem[];
  loading?: boolean;
};

const ProfileWishlistTab = ({ items, loading }: ProfileWishlistTabProps) => {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Хүслийн жагсаалтыг ачааллаж байна…
      </p>
    );
  }

  if (!items?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Таны хүслийн жагсаалт хоосон байна.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((entry) => {
        const product = entry.product;
        const imageUrl = product?.attachment?.url
          ? getFileUrl(product.attachment.url)
          : undefined;

        return (
          <Card
            key={entry._id}
            className="flex h-full flex-col overflow-hidden border border-muted"
          >
            <div className="relative h-44 w-full bg-muted">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- static preview
                <img
                  src={imageUrl}
                  alt={product?.name ?? "Product"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold">
                {product?.name ?? "Нэргүй бараа"}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {product?.description ?? "Тайлбар байхгүй."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                Үнэ: ₮{Number(product?.unitPrice || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Үлдэгдэл: {product?.remainder ?? "—"}
              </p>
            </CardContent>
            <CardFooter className="mt-auto flex justify-end gap-2 bg-muted/40 p-4">
              <Button asChild variant="outline" size="sm">
                <Link
                  href={templateUrl(
                    `/products${
                      product?._id ? `?highlight=${product._id}` : ""
                    }`
                  )}
                >
                  Барааг харах
                </Link>
              </Button>
              <Button asChild variant="default" size="sm" disabled>
                <Link href={templateUrl("/cart")}>Сагсанд нэмэх</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfileWishlistTab;
