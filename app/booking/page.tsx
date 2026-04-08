"use client";

import TourBookingForm from "./_components/BookingForm";
import HotelBookingForm from "./_hotel/HotelBookingForm";

const TEMPLATE_TYPE =
  process.env.TEMPLATE_TYPE || process.env.NEXT_PUBLIC_TEMPLATE_TYPE || "tour";
console.log(TEMPLATE_TYPE, "ttttt");
export default function BookingPage() {
  if (TEMPLATE_TYPE === "tour") {
    return <TourBookingForm />;
  }

  return <HotelBookingForm />;
}
