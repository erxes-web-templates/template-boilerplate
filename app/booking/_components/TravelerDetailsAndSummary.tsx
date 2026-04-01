"use client";

import type { BookingFormData } from "./BookingForm";
import type { BmTour } from "../../../types/tours";
import TravelerHotelDetails from "./TravelerHotelDetails";
import TravelerTourDetails from "./TravelerTourDetails";

type Props = {
  formData: BookingFormData;
  updateFormData: (newData: Partial<BookingFormData>) => void;
  selectedItem?: BmTour;
  urlStartDate: string | null;
  pricePerPerson: number;
  totalPrice: number;
  handleContinue: () => void;
  showErrors: boolean;
  travelers: number;
  leadDisabled?: boolean;
  leadPassportDisabled?: boolean;
  leadGenderDisabled?: boolean;
  variant?: "tour" | "hotel";
  hotelData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    additionalInfo: string;
  };
  updateHotelData?: (
    newData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      additionalInfo: string;
    }>,
  ) => void;
};

export default function TravelerDetailsAndSummary(props: Props) {
  const {
    formData,
    updateFormData,
    showErrors,
    travelers,
    leadDisabled,
    leadPassportDisabled,
    leadGenderDisabled,
    variant = "tour",
    hotelData,
    updateHotelData,
  } = props;

  if (variant === "hotel" && hotelData && updateHotelData) {
    return (
      <TravelerHotelDetails
        hotelData={hotelData}
        showErrors={showErrors}
        leadDisabled={leadDisabled}
        updateHotelData={updateHotelData}
      />
    );
  }

  return (
    <TravelerTourDetails
      formData={formData}
      updateFormData={updateFormData}
      showErrors={showErrors}
      travelers={travelers}
      leadDisabled={leadDisabled}
      leadPassportDisabled={leadPassportDisabled}
      leadGenderDisabled={leadGenderDisabled}
    />
  );
}
