"use client";

import Link from "next/link";
import Image from "next/image";
import { Section } from "../../../types/sections";
import { getFileUrl } from "@/lib/utils";
import { Card, CardFooter } from "@/components/ui/card";

type LinkType = "product" | "productCategory" | "productTag" | "external";

const getHrefForLink = (link?: { type?: LinkType; value?: string }) => {
  if (!link?.type || !link.value) return null;
  switch (link.type) {
    case "product": return `/products/${link.value}`;
    case "productCategory": return `/products?categoryId=${link.value}`;
    case "productTag": return `/products?tag=${link.value}`;
    case "external":
    default: return link.value;
  }
};

const BannerSection = ({ section }: { section: Section }) => {
  const title = section.config?.title ?? "Banner";
  const description = section.config?.description ?? "";
  const imageKey: string | undefined = section.config?.image;
  const link = section.config?.link ?? {
    type: section.config?.linkType,
    value: section.config?.linkValue ?? section.config?.url,
  };

  let imageUrl: string | undefined;
  if (imageKey) {
    try {
      imageUrl = getFileUrl(imageKey);
    } catch {
      imageUrl = imageKey;
    }
  }

  const href = getHrefForLink(link);

  const content = (
    <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-muted">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title || "Banner image"}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Banner image
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
      <div className="relative z-10 flex h-full flex-col justify-start gap-3 p-8 text-white sm:p-12">
        <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-3xl text-base text-white/80">{description}</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <Card className="border-0 bg-transparent shadow-none">
          {href ? (
            <Link href={href} className="block">
              {content}
            </Link>
          ) : (
            content
          )}
          {!href && (
            <CardFooter className="mt-4 p-0 text-sm text-muted-foreground">
              Add a link in the banner editor to make this image clickable.
            </CardFooter>
          )}
        </Card>
      </div>
    </section>
  );
};

export default BannerSection;
