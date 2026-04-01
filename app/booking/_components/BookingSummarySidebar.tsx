"use client";

import type { BookingFormData } from "./BookingForm";
import type { BmTour } from "../../../types/tours";
import BookingSummarySidebarHotel from "./BookingSummarySidebarHotel";
import BookingSummarySidebarTour from "./BookingSummarySidebarTour";

type BmTourWithGroupCode = BmTour & { groupCode?: string };

export type BookingSummarySidebarProps = {
  selectedItem?: BmTour;
  formData: BookingFormData;
  pricePerPerson: number;
  totalPrice: number;
  currentStep: number;
  onNext: () => void;
  onSubmit: () => void;
  onBack: () => void;
  nextLoading?: boolean;
  submitDisabled?: boolean;
  groupTourItems?: BmTourWithGroupCode[];
  paymentType?: string | null;
  downPayment?: string | null;
  remainingPayment?: string | null;
  variant?: "tour" | "hotel";
  hotelSummary?: {
    title: string;
    checkIn: string | null;
    checkOut: string | null;
    nights: number;
    rooms: Array<{
      _id: string;
      name: string;
      unitPrice?: number | null;
      quantity?: number | null;
    }>;
    adultCount: number;
    childCount: number;
    totalPrice: number;
    payNowAmount?: number;
    isPrepayment?: boolean;
  };
};

export default function BookingSummarySidebar(props: BookingSummarySidebarProps) {
  if (props.variant === "hotel" && props.hotelSummary) {
    return (
      <BookingSummarySidebarHotel
        currentStep={props.currentStep}
        hotelSummary={props.hotelSummary}
        nextLoading={props.nextLoading}
        onBack={props.onBack}
        onNext={props.onNext}
      />
    );
  }

  return (
    <BookingSummarySidebarTour
      currentStep={props.currentStep}
      downPayment={props.downPayment}
      formData={props.formData}
      groupTourItems={props.groupTourItems}
      nextLoading={props.nextLoading}
      onBack={props.onBack}
      onNext={props.onNext}
      onSubmit={props.onSubmit}
      paymentType={props.paymentType}
      remainingPayment={props.remainingPayment}
      selectedItem={props.selectedItem}
      submitDisabled={props.submitDisabled}
      totalPrice={props.totalPrice}
    />
  );
}
