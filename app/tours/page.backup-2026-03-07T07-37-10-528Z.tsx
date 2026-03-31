import Link from "next/link";
import Image from "next/image";
import { isBuildMode } from "../../lib/buildMode";
import ToursPageClient from "../_client/ToursPage";
import { fetchBmTours } from "../../lib/fetchTours";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { getFileUrl } from "../../lib/utils";
import type { BmTour } from "../../types/tours";

export default async function ToursPage() {
  if (isBuildMode()) {
    return <ToursPageClient />;
  }

  const data = await fetchBmTours(100, { status: "published" });
  const tours = data?.list || [];

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
              <Link href={`/tours/${tour._id}`}>
                <Button>Read more</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
