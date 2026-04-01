"use client";

import { useMemo } from "react";
import type { BookingFormData } from "../_components/BookingForm";
import HotelBookingShell from "./HotelBookingShell";
import useHotelBooking from "./useHotelBooking";
import useHotelBookingActions from "./useHotelBookingActions";
import { buildDummyTourData } from "./utils";

export default function HotelBookingForm() {
  const booking = useHotelBooking();
  const { handleContinue, handlePay, handleSelectPayment } =
    useHotelBookingActions(booking);

  const dummyTourData = useMemo<BookingFormData>(() => buildDummyTourData(), []);
  const loadingRooms =
    booking.branchLoading || booking.roomsLoading || booking.checkRoomsLoading;

  return (
    <HotelBookingShell
      adults={booking.adults}
      availableRooms={booking.availableRooms}
      childCount={booking.children}
      creatingInvoice={booking.creatingInvoice}
      currentStep={booking.currentStep}
      currentUser={booking.currentUser}
      dummyTourData={dummyTourData}
      endDateRaw={booking.endDateRaw}
      handleContinue={handleContinue}
      handlePay={handlePay}
      handleSelectPayment={handleSelectPayment}
      hotelData={booking.hotelData}
      loadingRooms={loadingRooms}
      nextLoading={booking.nextLoading}
      payments={booking.payments}
      payNowAmount={booking.payNowAmount}
      paymentUrl={booking.paymentUrl}
      requestedRooms={booking.requestedRooms}
      roomsError={booking.roomsError}
      selectedPaymentId={booking.selectedPaymentId}
      selectedRoomIds={booking.selectedRoomIds}
      setCurrentStep={booking.setCurrentStep}
      setHotelData={booking.setHotelData}
      showErrors={booking.showErrors}
      startDateRaw={booking.startDateRaw}
      summary={booking.summary}
      totalPrice={booking.totalPrice}
      transaction={booking.transaction}
      onToggleRoom={booking.toggleRoom}
    />
  );
}
