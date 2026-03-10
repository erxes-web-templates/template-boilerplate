"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { TOURS_GROUP_QUERY, TOURS_QUERY } from "../../../graphql/queries";
import {
  getFileUrl,
  templateUrl,
  // templateUrlWithSlug,
} from "@/lib/utils";
import { isBuildMode } from "../../../lib/buildMode";
import { toHtml } from "../../../lib/html";
import { Section } from "../../../types/sections";
import { BmTour } from "../../../types/tours";
import Image from "next/image";
import dayjs from "dayjs";

const ToursSection = ({ section }: { section: Section }) => {
  const { data } = useQuery(TOURS_GROUP_QUERY, {
    variables: {
      limit: section?.config?.limit || 6,
      status: "website",
    },
  });

  const tours = data?.cpBmToursGroup?.list || [];
  const isBuilder = isBuildMode();

  console.log(tours);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            {section?.config?.title || "Featured tours"}
          </h2>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour: any, index: number) => (
            <Card
              key={tour.items[0]._id}
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0">
                {tour.items[0].imageThumbnail && (
                  <div className="relative w-full h-[200px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Image
                      src={getFileUrl(tour.items[0].imageThumbnail)}
                      alt={tour.items[0].name}
                      fill
                      className="rounded-t-lg object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {tour.items[0].name}
                </CardTitle>
                <CardDescription>
                  <p
                    dangerouslySetInnerHTML={toHtml(tour.items[0].content)}
                    className="line-clamp-3"
                  />
                </CardDescription>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {tour.items[0].cost}
                  </span>
                  <span className="text-sm text-muted-foreground px-3 py-1 bg-muted/50 rounded-full">
                    {dayjs(tour.items[0].startDate).format("MMM DD, YYYY")}
                  </span>
                </div>
                <Link
                  href={
                    isBuilder
                      ? templateUrl(`/tour&tourId=${tour.items[0]._id}`)
                      : `/tours/${tour.items[0]._id}`
                  }
                >
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    Book Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            className="inline-flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:gap-3 transition-all duration-300 group"
            href={isBuilder ? templateUrl("/tours") : "/tours"}
          >
            Show All Tours
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ToursSection;