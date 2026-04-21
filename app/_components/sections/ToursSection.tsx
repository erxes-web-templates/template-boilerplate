"use client";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import React from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { TOURS_GROUP_QUERY } from "../../../graphql/queries";
import { getFileUrl } from "../../../lib/utils";
import { toHtml } from "../../../lib/html";
import { Section } from "../../../types/sections";
import Image from "next/image";
import dayjs from "dayjs";

const ToursSection = ({ section }: { section: Section }) => {
  const { data } = useQuery(TOURS_GROUP_QUERY, {
    variables: {
      limit: section?.config?.limit || 6,
      status: "published",
    },
  });

  const tours = data?.cpBmToursGroup?.list || [];

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {section?.config?.title && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {section.config.title}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tours.map((tour: any) => (
            <Card
              key={tour.items[0]._id}
              className="group overflow-hidden transition-shadow duration-200 hover:shadow-md"
            >
              <CardHeader className="p-0">
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  {tour.items[0].imageThumbnail ? (
                    <Image
                      src={getFileUrl(tour.items[0].imageThumbnail)}
                      alt={tour.items[0].name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                      —
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2 text-sm font-medium group-hover:text-primary transition-colors">
                  {tour.items[0].name}
                </CardTitle>
                <CardDescription>
                  <p
                    dangerouslySetInnerHTML={toHtml(tour.items[0].content)}
                    className="line-clamp-2 text-xs"
                  />
                </CardDescription>
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-4 border-t border-border p-4">
                <div className="flex items-center gap-3">
                  {tour.items[0].cost && (
                    <span className="text-sm font-semibold text-primary">
                      {tour.items[0].cost}
                    </span>
                  )}
                  {tour.items[0].startDate && (
                    <span className="text-xs text-muted-foreground">
                      {dayjs(tour.items[0].startDate).format("MMM DD, YYYY")}
                    </span>
                  )}
                </div>
                <Link href={`/tours/${tour.items[0].groupCode}`}>
                  <Button size="sm">
                    {section.config?.primaryCta || "Book now"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {section.config?.primaryCtaUrl && (
          <div className="mt-10 text-center">
            <Link
              href={section.config.primaryCtaUrl}
              className="text-sm font-medium text-primary hover:underline"
            >
              {section.config.primaryCta || "View all"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToursSection;
