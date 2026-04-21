import Image from "next/image";
import Link from "next/link";
import { fetchBmTourDetail } from "../../../lib/fetchTours";
import { getFileUrl } from "../../../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import { ArrowLeft } from "lucide-react";
import TourBookingWidget from "../_components/TourBookingWidget";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tourDetail = await fetchBmTourDetail(id);

  if (!tourDetail) {
    return <div className="container mx-auto p-4">Tour not found.</div>;
  }

  const groupTourItems = tourDetail.items ?? [];
  const tour = groupTourItems[0];

  if (!tour) {
    return <div className="container mx-auto p-4">Tour not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 py-10">
      {/* Back */}
      <Link
        href="/tours"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Tours
      </Link>

      {/* Hero image */}
      {tour.imageThumbnail && (
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-6">
          <Image
            src={getFileUrl(tour.imageThumbnail)}
            alt={tour.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Gallery */}
      {tour.images && tour.images.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {tour.images.map((image: string, index: number) => (
            <div
              key={index}
              className="relative shrink-0 w-[280px] h-[180px] rounded-xl overflow-hidden"
            >
              <Image
                src={getFileUrl(image)}
                alt={tour.name}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">{tour.name}</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm space-y-2">
            <p>
              <strong>Reference Number:</strong> {tour.refNumber}
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {new Date(tour.startDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Cost:</strong> ${tour.cost?.toLocaleString()}
            </p>
          </div>

          {tour.itinerary && (
            <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
              <Accordion type="single" collapsible className="w-full">
                {tour.itinerary.groupDays.map(
                  (itinerary: any, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{itinerary.title}</AccordionTrigger>
                      <AccordionContent>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: itinerary.content,
                          }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p
              className="text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: tour.content }}
            />
          </div>

          {groupTourItems.length > 1 && (
            <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Available Dates</h2>
              <ul className="space-y-2">
                {groupTourItems.map((item: any) => (
                  <li key={item._id}>
                    <Link
                      href={`/tours/${item.groupCode || item._id}`}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm"
                    >
                      <span>
                        {new Date(item.startDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        — {item.name}
                      </span>
                      {item.cost != null && (
                        <span className="font-semibold text-primary">
                          ${Number(item.cost).toLocaleString()}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="sticky top-24">
          <TourBookingWidget tour={tour} groupTourItems={groupTourItems} />
        </div>
      </div>
    </div>
  );
}
