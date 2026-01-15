import Image from "next/image";
import Link from "next/link";
import { isBuildMode } from "../../../lib/buildMode";
import TourDetailPageClient from "../../_client/TourDetailPage";
import {
  fetchBmTourDetail,
  fetchBmToursGroup,
} from "../../../lib/fetchTours";
import { getFileUrl } from "../../../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (isBuildMode()) {
    return <TourDetailPageClient initialTourId={id} />;
  }

  const tour = await fetchBmTourDetail(id);
  const groupTours = await fetchBmToursGroup(1, 100);

  if (!tour) {
    return <div className="container mx-auto p-4">Tour not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {tour.imageThumbnail && (
        <div className="relative w-full h-[500px]">
          <Image
            src={getFileUrl(tour.imageThumbnail)}
            alt={tour.name}
            fill
            className="rounded-md"
          />
        </div>
      )}
      <div className="flex gap-3 my-3">
        {tour.images &&
          tour.images.map((image: string, index: number) => (
            <div key={index} className="relative w-[300px] h-[200px]">
              <Image
                src={getFileUrl(image)}
                alt={tour.name}
                fill
                className="rounded-md"
              />
            </div>
          ))}
      </div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">{tour.name}</h1>
        <div className="flex gap-3 justify-end">
          <Link className="pt-3" href={`/inquiry?tourId=${tour.groupCode}`}>
            Inquire now
          </Link>
          <Link
            className="bg-slate-800 text-white px-4 pt-3 rounded-md block"
            href={`/booking?tourId=${tour.groupCode}`}
          >
            Book tour
          </Link>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Reference Number:</strong> {tour.refNumber}
          </p>
          <p>
            <strong>Status:</strong> {tour.status}
          </p>
          <p>
            <strong>Start Date:</strong>{" "}
            {new Date(tour.startDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Cost:</strong> ${tour.cost.toLocaleString()}
          </p>
          {tour.itinerary && (
            <div className="itineraries">
              <Accordion type="single" collapsible className="w-full">
                {tour.itinerary.map((itinerary: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{itinerary.name}</AccordionTrigger>
                    <AccordionContent>{itinerary.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold mb-2">Available Dates</h2>
            <ul className="list-disc pl-5">
              {groupTours?.map((groupTour: any) => (
                <li key={groupTour.items[0]._id}>
                  <Link href={`/tours/${groupTour.items[0]._id}`}>
                    {new Date(
                      groupTour.items[0].startDate
                    ).toLocaleDateString()}{" "}
                    - {groupTour.items[0].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p>{tour.content}</p>
        </div>
      </div>
    </div>
  );
}
