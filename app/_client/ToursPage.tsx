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
import { getFileUrl, templateUrl } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import usePage from "../../lib/usePage";
import { BmTour } from "../../types/tours";
const ToursPage = () => {
  const searchParams = useSearchParams();

  const pageName = searchParams.get("pageName"); //pageName = about, tours, contact etc

  const PageContent = usePage(pageName);

  const { data, loading } = useQuery(TOURS_GROUP_QUERY, {
    variables: { limit: 100, status: "published" },
  });

  const tours = (data?.cpBmToursGroup?.list || []).map(
    (group: any) => group.items?.[0],
  ).filter(Boolean);

  if (loading) {
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
              <span className="text-lg font-bold">{tour.cost}</span>
              <Link href={templateUrl(`/tour&tourId=${tour.groupCode}`)}>
                {" "}
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
