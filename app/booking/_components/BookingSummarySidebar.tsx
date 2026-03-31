"use client";

import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Calendar, Tag, Users } from "lucide-react";
import type { BookingFormData } from "./BookingForm";
import type { BmTour } from "../../../types/tours";
import { useRouter } from "next/navigation";
import { useTourPricing } from "../../../hooks/useTourPricing";

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
};

export default function BookingSummarySidebar(props: BookingSummarySidebarProps) {
  const router = useRouter();
  const {
    selectedItem,
    formData,
    totalPrice,
    currentStep,
    onNext,
    onSubmit,
    onBack,
    nextLoading,
    submitDisabled,
    groupTourItems,
    paymentType,
    downPayment,
    remainingPayment,
  } = props;

  const { getPriceForPax } = useTourPricing(selectedItem);
  const discountedPricePerPerson = getPriceForPax(formData.travelers);

  const isPrepaidRemainingPayment =
    paymentType === "prepaid" && remainingPayment && Number(remainingPayment) > 0;

  const calculatedTotalPrice = isPrepaidRemainingPayment
    ? totalPrice
    : formData.travelers * discountedPricePerPerson;

  const downPaymentAmount = downPayment ? Number(downPayment) : 0;
  const isPrepaid = paymentType === "prepaid" && downPaymentAmount > 0;

  const displayAmount = isPrepaidRemainingPayment
    ? calculatedTotalPrice
    : isPrepaid
      ? downPaymentAmount
      : calculatedTotalPrice;

  return (
    <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
      {/* Tour info */}
      <div
        className="px-5 py-4 border-b border-border/40"
        style={{ backgroundColor: "rgba(var(--primary-rgb, 139,181,107), 0.06)" }}
      >
        <h3 className="font-bold text-foreground text-base leading-snug">
          {selectedItem?.name || "Tour Booking"}
        </h3>
      </div>

      <div className="px-5 py-4 space-y-3 text-sm">
        {selectedItem?.startDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{new Date(selectedItem.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <button
              type="button"
              className="ml-auto text-xs font-medium hover:underline"
              style={{ color: "var(--primary)" }}
              onClick={() => {
                const slug = (groupTourItems?.[0] as BmTourWithGroupCode)?.groupCode || "";
                if (slug) router.push(`tours/${slug}`);
              }}
            >
              Edit
            </button>
          </div>
        )}
        {selectedItem?.endDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0 opacity-0" />
            <span className="text-xs">
              Until {new Date(selectedItem.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4 shrink-0" />
          <span>{formData.travelers} {formData.travelers === 1 ? "traveler" : "travelers"}</span>
        </div>
      </div>

      <Separator />

      {/* Price breakdown */}
      <div className="px-5 py-4 space-y-2 text-sm">
        {!isPrepaidRemainingPayment && (
          <div className="flex justify-between text-muted-foreground">
            <span>{formData.travelers} × MNT {discountedPricePerPerson.toLocaleString()}</span>
            <span>MNT {(formData.travelers * discountedPricePerPerson).toLocaleString()}</span>
          </div>
        )}
        {isPrepaid && (
          <>
            <div className="flex justify-between text-muted-foreground">
              <span>Down payment</span>
              <span className="font-medium" style={{ color: "var(--primary)" }}>
                MNT {downPaymentAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>Remaining</span>
              <span>MNT {Math.max(0, calculatedTotalPrice - downPaymentAmount).toLocaleString()}</span>
            </div>
          </>
        )}

        <Separator className="my-2" />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span className="font-semibold text-foreground text-base">
              {isPrepaidRemainingPayment ? "Remaining" : isPrepaid ? "Pay now" : "Total"}
            </span>
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            MNT {displayAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        {currentStep === 2 ? (
          <>
            <Button
              className="w-full text-white disabled:opacity-50 disabled:text-white"
              style={{ backgroundColor: "var(--primary)" }}
              size="lg"
              onClick={onSubmit}
              disabled={!!submitDisabled}
            >
              SUBMIT
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={onBack}>
              BACK
            </Button>
          </>
        ) : currentStep === 3 ? (
          <Button
            className="w-full text-white"
            style={{ backgroundColor: "var(--primary)" }}
            size="lg"
            onClick={() => router.push("/")}
          >
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
