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
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Our Tours
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our collection of amazing tours and experiences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
        {tours.map((tour: BmTour) => (
          <Card
            key={tour._id}
            className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
          >
            <CardHeader className="p-0">
              {tour.imageThumbnail && (
                <div className="relative w-full h-[240px] overflow-hidden">
                  <Image
                    src={getFileUrl(tour.imageThumbnail)}
                    alt={tour.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <CardTitle className="mb-3 text-xl line-clamp-2">
                {tour.name}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                <div dangerouslySetInnerHTML={{ __html: tour.content }} />
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-6 pt-0 mt-auto">
              <span className="text-xl font-bold text-primary">
                {tour.cost}
              </span>
              <Link href={`/tours/${tour._id}`}>
                <Button>Read more</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
