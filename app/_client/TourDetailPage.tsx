"use client";

import { useQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { TOURS_GROUP_QUERY } from "../../graphql/queries";
import { queries as tmsQueries } from "../../graphql/tms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";
import Image from "next/image";
import Link from "next/link";
import { getFileUrl, templateUrl } from "../../lib/utils";
import { toHtml } from "../../lib/html";
import TourBookingWidget from "../tours/_components/TourBookingWidget";
import { ArrowLeft, Calendar, Clock, DollarSign, Hash } from "lucide-react";

type TourDetailPageProps = {
  initialTourId?: string;
  initialTourDetail?: any;
};

export default function TourDetailPage({ initialTourId, initialTourDetail }: TourDetailPageProps) {
  const searchParams = useSearchParams();

  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);

  const tourId = searchParams.get("tourId") ?? initialTourId;
  const skip = !!initialTourDetail;

  const { data: groupsData, loading: groupsLoading } = useQuery(TOURS_GROUP_QUERY, {
    variables: { status: "published" },
    skip: skip || !tourId,
  });

  const groups = groupsData?.cpBmToursGroup?.list || [];
  const matchedGroup = groups.find((g: any) =>
    g.items?.some((item: any) => item.groupCode === tourId),
  );
  const groupCode = matchedGroup?.items?.[0]?.groupCode ?? tourId;

  const { data: groupDetailData, loading: detailLoading } = useQuery(
    tmsQueries.TOUR_GROUP_DETAIL_QUERY,
    {
      variables: { groupCode, status: "published" },
      skip: skip || !groupCode,
    },
  );

  const loading = !skip && (groupsLoading || detailLoading);
  const groupTourItems = initialTourDetail?.items ?? groupDetailData?.cpBmToursGroupDetail?.items ?? [];
  const tour = groupTourItems[0] || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{ borderColor: "var(--primary) transparent transparent transparent" }}
          />
          <p className="text-muted-foreground text-sm">Loading tour...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Tour Not Found</h1>
          <Link
            href={templateUrl("/tours")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      {tour.imageThumbnail && (
        <div className="relative w-full h-[55vh] min-h-[360px] overflow-hidden">
          <Image
            src={getFileUrl(tour.imageThumbnail)}
            alt={tour.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute top-6 left-6">
            <Link
              href={templateUrl("/tours")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-medium border border-white/20 hover:bg-white/25 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Tours
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container mx-auto max-w-5xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                {tour.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                {tour.cost != null && (
                  <span
                    className="px-4 py-2 rounded-xl text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    MNT {Number(tour.cost).toLocaleString()}
                  </span>
                )}
                {tour.startDate && (
                  <span className="flex items-center gap-1.5 text-white/85 text-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date(tour.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                {tour.refNumber && (
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Hash className="h-4 w-4" />
                    {tour.refNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {tour.images && tour.images.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tour.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden"
                    >
                      <Image
                        src={getFileUrl(image)}
                        alt={`${tour.name} photo ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {tour.content && (
              <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">About This Tour</h2>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tour.content }}
                />
              </div>
            )}

            {/* Itinerary */}
            {tour.itinerary?.groupDays && tour.itinerary.groupDays.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Itinerary</h2>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {tour.itinerary.groupDays.map((day: any, index: number) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border border-border/40 rounded-xl px-4 data-[state=open]:border-primary/30"
                    >
                      <AccordionTrigger className="font-semibold text-foreground hover:text-primary py-4 hover:no-underline">
                        <span className="flex items-center gap-3">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: "var(--primary)" }}
                          >
                            {day.day ?? index + 1}
                          </span>
                          {day.title || `Day ${day.day ?? index + 1}`}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        {day.content && (
                          <div
                            className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={toHtml(day.content)}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Available Dates */}
            {groupTourItems.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden border border-border/40 shadow-sm">
                <div className="px-6 pt-6 pb-3">
                  <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
                    Tour Schedule
                  </h2>
                  <div className="mt-2 h-0.5 w-12" style={{ backgroundColor: "var(--primary)" }} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: "var(--primary)" }}>
                        <th className="text-left px-6 py-4 text-white font-semibold uppercase tracking-wider">
                          Travel Dates
                        </th>
                        <th className="text-left px-6 py-4 text-white font-semibold uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupTourItems.map((item: any, idx: number) => {
                        const start = item.startDate
                          ? new Date(item.startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
                          : null;
                        const end = item.endDate
                          ? new Date(item.endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
                          : null;
                        const dateLabel = start && end && start !== end ? `${start} - ${end}` : start || "—";

                        return (
                          <tr
                            key={item._id}
                            className="border-t border-border/40"
                            style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#ffffff" }}
                          >
                            <td className="px-6 py-4 text-foreground">
                              {dateLabel}
                              {item.name && (
                                <div className="text-xs text-muted-foreground mt-0.5">{item.name}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-semibold text-foreground">
                              {item.cost != null
                                ? `${Number(item.cost).toLocaleString()}₮`
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <TourBookingWidget tour={tour} groupTourItems={groupTourItems} />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <PageContent />
        </div>
      </div>
    </div>
  );
}
