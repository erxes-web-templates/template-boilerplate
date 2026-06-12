"use client";

import { TOURS_GROUP_QUERY } from "../../graphql/queries";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFileUrl, getMinTourPrice, templateUrl } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";
import { BmTour } from "../../types/tours";

type Props = {
  initialData?: any;
};

const ToursPage = ({ initialData }: Props) => {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);

  const { data, loading } = useQuery(TOURS_GROUP_QUERY, {
    variables: { limit: 100, status: "published" },
    skip: !!initialData,
  });

  const groups = initialData?.list ?? data?.cpBmToursGroup?.list ?? [];
  const tours = groups.map((group: any) => group.items?.[0]).filter(Boolean);

  if (!initialData && loading) {
    return "Loading ...";
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour: BmTour) => (
          <Card key={tour._id} className="mb-2">
            <CardHeader>
              {tour.imageThumbnail && (
                <div className="relative w-full h-[200px]">
                  <Image
                    src={getFileUrl(tour.imageThumbnail)}
                    alt={tour.name}
                    fill
                    className="rounded-md h-[200px]"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <CardTitle>{tour.name}</CardTitle>
              <CardDescription>
                <p dangerouslySetInnerHTML={{ __html: tour.content }} />
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              {(() => {
                const price = getMinTourPrice(tour.pricingOptions);
                return price != null ? (
                  <span className="text-lg font-bold">
                    {Number(price).toLocaleString()}₮
                  </span>
                ) : null;
              })()}
              <Link href={templateUrl(`/tours/${tour.groupCode || tour._id}`)}>
                <Button>Read more</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <PageContent />
    </>
  );
};

export default ToursPage;
