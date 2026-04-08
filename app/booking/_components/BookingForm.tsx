"use client";

import TourBookingHero from "./TourBookingHero";
import TravelerDetailsAndSummary from "./TravelerDetailsAndSummary";
import PaymentSection from "./PaymentSection";
import CompleteSection from "./CompleteSection";
import BookingSummarySidebar from "./BookingSummarySidebar";
import useTourBooking from "./useTourBooking";

type TravelerFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  nationality?: string;
  passportNumber?: string;
  address?: string;
};

export type BookingFormData = {
  selectedDate?: string | null;
  travelers: number;
  additionalInfo: string;
  leadTraveler: TravelerFormData;
  additionalTravelers: TravelerFormData[];
  paymentType: string;
  paymentMethod: string;
};

export default function BookingForm() {
  const booking = useTourBooking();

  return (
    <div className="min-h-screen bg-gray-50">
      <TourBookingHero
        currentStep={booking.currentStep}
        imageThumbnail={booking.selectedItem?.imageThumbnail}
        title={booking.selectedItem?.name}
      />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {booking.currentStep === 1 && (
              <TravelerDetailsAndSummary
                formData={booking.formData}
                updateFormData={booking.updateFormData}
                selectedItem={booking.selectedItem}
                urlStartDate={booking.urlParams.startDate}
                pricePerPerson={booking.pricePerPerson}
                totalPrice={booking.totalPrice}
                handleContinue={booking.handleContinue}
                showErrors={booking.showErrors}
                travelers={booking.formData.travelers}
                leadDisabled={!!booking.currentUser}
                leadPassportDisabled={!!booking.serverRegNumber}
                leadGenderDisabled={
                  booking.serverSex === 1 || booking.serverSex === 2
                }
              />
            )}

            {booking.currentStep === 2 && (
              <PaymentSection
                paymentUrl={booking.paymentUrl}
                transaction={booking.transaction}
                loading={booking.creatingInvoice}
                payments={booking.payments}
                selectedPaymentId={booking.selectedPaymentId}
                onSelectPayment={booking.handleSelectPayment}
                onPay={booking.handlePay}
              />
            )}

            {booking.currentStep === 3 && <CompleteSection />}
          </div>

          <div className="lg:col-span-1">
            <BookingSummarySidebar
              selectedItem={booking.selectedItem}
              formData={booking.formData}
              pricePerPerson={booking.pricePerPerson}
              totalPrice={booking.totalPrice}
              currentStep={booking.currentStep}
              onNext={booking.handleContinue}
              onSubmit={booking.handlePay}
              onBack={booking.handleBack}
              nextLoading={booking.nextLoading}
              submitDisabled={
                !booking.selectedPaymentId || booking.creatingInvoice
              }
              groupTourItems={booking.groupTourItems}
              paymentType={booking.urlParams.paymentType}
              downPayment={booking.urlParams.downPayment}
              remainingPayment={booking.urlParams.remaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
