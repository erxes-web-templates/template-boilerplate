"use client";

import type { BookingFormData } from "../_components/BookingForm";
import BookingSummarySidebar from "../_components/BookingSummarySidebar";
import CompleteSection from "../_components/CompleteSection";
import PaymentSection from "../_components/PaymentSection";
import TravelerDetailsAndSummary from "../_components/TravelerDetailsAndSummary";
import HotelPaymentPreference from "./HotelPaymentPreference";
import HotelRoomSelection from "./HotelRoomSelection";
import HotelBookingHero from "./HotelBookingHero";

type Props = {
  adults: number;
  availableRooms: any[];
  childCount: number;
  creatingInvoice: boolean;
  currentStep: number;
  currentUser: any;
  dummyTourData: BookingFormData;
  endDateRaw: string | null;
  handleContinue: () => void;
  handlePay: () => void;
  handleSelectPayment: (id: string) => void;
  hotelData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    additionalInfo: string;
    isPrepayment: boolean;
  };
  loadingRooms: boolean;
  nextLoading: boolean;
  payments: any[];
  payNowAmount: number;
  paymentUrl: string | null;
  requestedRooms: number;
  roomsError?: { message?: string } | null;
  selectedPaymentId: string | null;
  selectedRoomIds: string[];
  setCurrentStep: (value: number) => void;
  setHotelData: React.Dispatch<React.SetStateAction<any>>;
  showErrors: boolean;
  startDateRaw: string | null;
  summary: any;
  totalPrice: number;
  transaction: any;
  onToggleRoom: (roomId: string) => void;
};

export default function HotelBookingShell({
  adults,
  availableRooms,
  childCount,
  creatingInvoice,
  currentStep,
  currentUser,
  dummyTourData,
  endDateRaw,
  handleContinue,
  handlePay,
  handleSelectPayment,
  hotelData,
  loadingRooms,
  nextLoading,
  payments,
  payNowAmount,
  paymentUrl,
  requestedRooms,
  roomsError,
  selectedPaymentId,
  selectedRoomIds,
  setCurrentStep,
  setHotelData,
  showErrors,
  startDateRaw,
  summary,
  totalPrice,
  transaction,
  onToggleRoom,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HotelBookingHero currentStep={currentStep} />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <>
                <HotelRoomSelection
                  startDateRaw={startDateRaw}
                  endDateRaw={endDateRaw}
                  adults={adults}
                  childCount={childCount}
                  requestedRooms={requestedRooms}
                  loadingRooms={loadingRooms}
                  roomsError={roomsError}
                  availableRooms={availableRooms}
                  selectedRoomIds={selectedRoomIds}
                  onToggleRoom={onToggleRoom}
                />
                <HotelPaymentPreference
                  isPrepayment={hotelData.isPrepayment}
                  payNowAmount={payNowAmount}
                  totalPrice={totalPrice}
                  onChange={(isPrepayment) =>
                    setHotelData((prev: any) => ({ ...prev, isPrepayment }))
                  }
                />
                <TravelerDetailsAndSummary
                  formData={dummyTourData}
                  updateFormData={() => undefined}
                  urlStartDate={startDateRaw}
                  pricePerPerson={0}
                  totalPrice={totalPrice}
                  handleContinue={handleContinue}
                  showErrors={showErrors}
                  travelers={Math.max(1, adults + childCount)}
                  leadDisabled={!!currentUser}
                  variant="hotel"
                  hotelData={hotelData}
                  updateHotelData={(newData) =>
                    setHotelData((prev: any) => ({ ...prev, ...newData }))
                  }
                />
              </>
            )}

            {currentStep === 2 && (
              <PaymentSection
                paymentUrl={paymentUrl}
                transaction={transaction}
                loading={creatingInvoice}
                payments={payments}
                selectedPaymentId={selectedPaymentId}
                onSelectPayment={handleSelectPayment}
                onPay={handlePay}
              />
            )}

            {currentStep === 3 && <CompleteSection />}
          </div>

          <div className="lg:col-span-1">
            <BookingSummarySidebar
              variant="hotel"
              hotelSummary={summary}
              selectedItem={undefined}
              formData={dummyTourData}
              pricePerPerson={0}
              totalPrice={totalPrice}
              currentStep={currentStep}
              onNext={handleContinue}
              onSubmit={() => undefined}
              onBack={() => setCurrentStep(1)}
              nextLoading={nextLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
