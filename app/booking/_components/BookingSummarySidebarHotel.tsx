"use client";

import { useRouter } from "next/navigation";
import { Calendar, Tag, Users } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";

export default function BookingSummarySidebarHotel({
  currentStep,
  hotelSummary,
  nextLoading,
  onBack,
  onNext,
}: any) {
  const router = useRouter();
  const displayAmount = hotelSummary.payNowAmount ?? hotelSummary.totalPrice;

  return (
    <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
      <div
        className="px-5 py-4 border-b border-border/40"
        style={{ backgroundColor: "rgba(var(--primary-rgb, 139,181,107), 0.06)" }}
      >
        <h3 className="font-bold text-foreground text-base leading-snug">
          {hotelSummary.title || "Room Booking"}
        </h3>
      </div>
      <div className="px-5 py-4 space-y-3 text-sm">
        {hotelSummary.checkIn && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{new Date(hotelSummary.checkIn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        )}
        {hotelSummary.checkOut && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0 opacity-0" />
            <span className="text-xs">
              Until {new Date(hotelSummary.checkOut).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4 shrink-0" />
          <span>
            {hotelSummary.adultCount} adult{hotelSummary.adultCount === 1 ? "" : "s"}
            {hotelSummary.childCount > 0
              ? `, ${hotelSummary.childCount} child${hotelSummary.childCount === 1 ? "" : "ren"}`
              : ""}
          </span>
        </div>
        <div className="text-muted-foreground text-xs">
          {hotelSummary.nights} night{hotelSummary.nights === 1 ? "" : "s"} /{" "}
          {hotelSummary.rooms.length} room{hotelSummary.rooms.length === 1 ? "" : "s"}
        </div>
      </div>
      <Separator />
      <div className="px-5 py-4 space-y-2 text-sm">
        {hotelSummary.rooms.map((room: any) => (
          <div key={room._id} className="flex justify-between text-muted-foreground">
            <span>{room.name}{room.quantity ? ` × ${room.quantity}` : ""}</span>
            <span>MNT {Number(room.unitPrice || 0).toLocaleString()}</span>
          </div>
        ))}
        {hotelSummary.isPrepayment && (
          <div className="flex justify-between text-muted-foreground">
            <span>Pay now</span>
            <span>MNT {displayAmount.toLocaleString()}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span className="font-semibold text-foreground text-base">
              {hotelSummary.isPrepayment ? "Total booking" : "Total"}
            </span>
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            MNT {hotelSummary.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="px-5 pb-5 space-y-2">
        {currentStep === 2 ? (
          <Button variant="outline" className="w-full" size="lg" onClick={onBack}>
            BACK
          </Button>
        ) : currentStep === 3 ? (
          <Button className="w-full text-white" style={{ backgroundColor: "var(--primary)" }} size="lg" onClick={() => router.push("/")}>
            DONE
          </Button>
        ) : (
          <Button
            className="w-full text-white disabled:opacity-50 disabled:text-white"
            style={{ backgroundColor: "var(--primary)" }}
            size="lg"
            onClick={onNext}
            disabled={!!nextLoading}
          >
            {nextLoading ? "PLEASE WAIT..." : "NEXT STEP"}
          </Button>
        )}
      </div>
    </div>
  );
}
