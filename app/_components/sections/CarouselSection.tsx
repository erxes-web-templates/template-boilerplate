"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "../../../types/sections";
import { getFileUrl } from "@/lib/utils";

type CarouselLinkType = "product" | "productCategory" | "external";

type CarouselConfigItem = {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  link?: {
    type?: CarouselLinkType;
    value?: string;
  };
  url?: string;
};

const resolveImageUrl = (key?: string | null) => {
  if (!key) return undefined;
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  if (key.startsWith("/")) {
    return key;
  }
  try {
    return getFileUrl(key);
  } catch {
    return key;
  }
};

const resolveLink = (
  item: CarouselConfigItem
): { href: string; isExternal: boolean } | null => {
  const linkType = item.link?.type ?? ("external" as CarouselLinkType);
  const value = item.link?.value ?? item.url ?? "";
  if (!value) {
    return null;
  }

  if (linkType === "external") {
    return { href: value, isExternal: true };
  }

  if (linkType === "product") {
    return { href: `/products/${value}`, isExternal: false };
  }

  if (linkType === "productCategory") {
    return { href: `/products?categoryId=${value}`, isExternal: false };
  }

  return null;
};

const CarouselSection = ({ section }: { section: Section }) => {
  const title = section.config?.title ?? "Featured carousel";
  const description = section.config?.description ?? "";
  const items: CarouselConfigItem[] = useMemo(
    () => section.config?.items ?? [],
    [section.config?.items]
  );

  if (!items.length) {
    return null;
  }

  return (
    <section className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {items.map((item) => {
            const imageUrl = resolveImageUrl(item.image);
            const link = resolveLink(item);

            return (
              <CarouselItem
                key={item.id ?? item.title ?? Math.random()}
                className="basis-full"
              >
                <div className="relative min-h-screen w-full">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.title ?? "Carousel item"}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
                  <div className="absolute inset-0 flex items-center justify-center px-6 py-12">
                    <Card className="w-full max-w-3xl bg-black/50 text-white backdrop-blur-md">
                      <CardHeader>
                        <CardTitle className="text-3xl font-bold md:text-4xl">
                          {item.title ?? "Untitled slide"}
                        </CardTitle>
                        {item.description && (
                          <CardDescription className="mt-4 text-base text-white/80 md:text-lg">
                            {item.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      {link && (
                        <CardFooter className="flex justify-start gap-3">
                          <Button
                            asChild
                            size="lg"
                            className="bg-white text-black hover:bg-white/90"
                          >
                            <Link
                              href={link.href}
                              target={link.isExternal ? "_blank" : undefined}
                              rel={link.isExternal ? "noopener noreferrer" : undefined}
                            >
                              Learn more
                            </Link>
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex items-center justify-center gap-4">
          <CarouselPrevious className="pointer-events-auto relative h-12 w-12 rounded-full bg-white/80 text-black hover:bg-white" />
          <CarouselNext className="pointer-events-auto relative h-12 w-12 rounded-full bg-white/80 text-black hover:bg-white" />
        </div>
      </Carousel>
    </section>
  );
};

export default CarouselSection;
