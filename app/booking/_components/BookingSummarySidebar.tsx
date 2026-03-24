"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BadgePercent, CreditCard, Receipt, Tag } from "lucide-react";
import type { BookingFormData } from "./BookingForm";
import type { BmTour } from "@/types/tours";
import { useRouter } from "next/navigation";
import { useTourPricing } from "@/hooks/useTourPricing";

type BmTourWithGroupCode = BmTour & { groupCode?: string };

export type BookingSummarySidebarProps = {
  selectedItem?: BmTour;
  formData: BookingFormData;
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponError: string | null;
  setCouponError: (v: string | null) => void;
  couponSuccess: string | null;
  setCouponSuccess: (v: string | null) => void;
  setDiscount: (n: number) => void;
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

export default function BookingSummarySidebar(
  props: BookingSummarySidebarProps
) {
  const router = useRouter();
  const {
    selectedItem,
    formData,
    couponCode,
    setCouponCode,
    couponError,
    setCouponError,
    couponSuccess,
    setCouponSuccess,
    setDiscount,
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
    paymentType === "prepaid" &&
    remainingPayment &&
    Number(remainingPayment) > 0;

  const calculatedTotalPrice = isPrepaidRemainingPayment
    ? totalPrice
    : formData.travelers * discountedPricePerPerson;

  const taxRate = 0.04;
  const calculatedTotalWithTax = Math.floor(
    calculatedTotalPrice * (1 + taxRate)
  );
  const taxAmount = calculatedTotalWithTax - calculatedTotalPrice;

  const downPaymentAmount = downPayment ? Number(downPayment) : 0;
  const downPaymentTax = Math.floor(downPaymentAmount * taxRate);
  const downPaymentWithTax = downPaymentAmount + downPaymentTax;
  const remainingBalance = calculatedTotalWithTax - downPaymentWithTax;
  const isPrepaid = paymentType === "prepaid" && downPaymentAmount > 0;

  return (
    <>
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedItem?.name || ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div>
              <span className="font-medium text-foreground">Travel Date :</span>{" "}
              {selectedItem?.startDate
                ? new Date(selectedItem.startDate).toLocaleDateString()
                : "-"}
              <button
                type="button"
                className="ml-3 text-[#8BB56B] hover:text-[#7AA45F] underline-offset-2"
                onClick={() => {
                  const slug =
                    (groupTourItems?.[0] as BmTourWithGroupCode)?.groupCode ||
                    "";
                  if (slug) router.push(`tours/${slug}`);
                }}
              >
                ( edit )
              </button>
            </div>
            <div>
              <span className="font-medium text-foreground">End Date :</span>{" "}
              {selectedItem?.endDate
                ? new Date(selectedItem.endDate).toLocaleDateString()
                : "-"}
            </div>
            <div>
              <span className="font-medium text-foreground">Period :</span>{" "}
              {selectedItem?.duration
                ? `${selectedItem.duration} Days`
                : "-"}
            </div>
            <div>
              <span className="font-medium text-foreground">Traveller :</span>{" "}
              {`${formData.travelers} ${
                formData.travelers === 1 ? "person" : "people"
              }`}
            </div>
          </div>

          {currentStep === 1 && (
            <>
              <div className="flex gap-3 items-center">
                <Input
                  placeholder="Coupon Code"
                  className="flex-1"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button
                  variant="ghost"
                  className="text-[#8BB56B] hover:text-[#7AA45F]"
                  onClick={() => {
                    const code = (couponCode || "").trim().toLowerCase();
                    if (code === "good") {
                      setDiscount(0);
                      setCouponError(null);
                      setCouponSuccess("Your price - US$ 0.00");
                    } else {
                      setDiscount(0);
                      setCouponError(
                        "Invalid coupon code, please try again with different coupon"
                      );
                      setCouponSuccess(null);
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
              {couponError && (
                <div className="mt-3 p-3 text-white bg-red-600 text-[10px] rounded">
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div className="mt-3 p-3 text-white bg-green-600 text-[10px] rounded">
                  {couponSuccess}
                </div>
              )}
            </>
          )}

          <div>
            <Accordion type="single" collapsible defaultValue="breakdown">
              <AccordionItem value="breakdown">
                <AccordionTrigger className="text-xs font-normal text-[#8BB56B] hover:no-underline">
                  View Price Breakdown
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {!isPrepaidRemainingPayment && (
                      <>
                        <div className="flex justify-between items-start text-xs">
                          <div className="font-semibold text-foreground">
                            Traveller Base Price
                          </div>
                          <div className="text-right text-muted-foreground">
                            {formData.travelers} x US${" "}
                            {discountedPricePerPerson.toLocaleString()}
                          </div>
                        </div>
                        <div className="font-medium text-right">
                          US${" "}
                          {(
                            formData.travelers * discountedPricePerPerson
                          ).toLocaleString()}
                        </div>
                        <Separator />
                      </>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <div className="font-semibold text-foreground">
                        {isPrepaidRemainingPayment
                          ? "Remaining Balance (Base)"
                          : "Sub Total Price"}
                      </div>
                      <div className="font-medium">
                        US$ {calculatedTotalPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-start text-[11px]">
                      <div className="font-semibold text-foreground">
                        Tax (4%)
                      </div>
                      <div className="text-right">
                        US$ {taxAmount.toLocaleString()}
                        <div className="text-[10px] text-muted-foreground">
                          Required by bank regulations
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-xs">
                      <div className="font-semibold text-foreground">
                        Total (incl. tax)
                      </div>
                      <div className="font-medium">
                        US$ {calculatedTotalWithTax.toLocaleString()}
                      </div>
                    </div>

                    {isPrepaid && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center text-xs">
                          <div className="font-semibold text-foreground">
                            Down Payment
                          </div>
                          <div className="font-medium text-[#8BB56B]">
                            US$ {downPaymentWithTax.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex justify-between items-start text-[11px]">
                          <div className="text-muted-foreground">
                            (incl. tax US$ {downPaymentTax.toLocaleString()})
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div className="font-semibold text-foreground">
                            Remaining Balance
                          </div>
                          <div className="font-medium text-muted-foreground">
                            US$ {remainingBalance.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Due before tour start date
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {isPrepaidRemainingPayment
                  ? "Remaining Payment"
                  : isPrepaid
                  ? "Pay Now (Down Payment)"
                  : "Total Price"}
              </span>
            </div>
            <div className="text-right">
              {isPrepaid || isPrepaidRemainingPayment ? (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-semibold text-[#8BB56B]">
                    US${" "}
                    {(isPrepaidRemainingPayment
                      ? calculatedTotalWithTax
                      : downPaymentWithTax
                    ).toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-black">
                  US$ {calculatedTotalWithTax.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {currentStep === 2 ? (
            <div className="space-y-2">
              <Button
                className="w-full bg-[#8BB56B] hover:bg-[#7AA45F]"
                size="lg"
                onClick={onSubmit}
                disabled={!!submitDisabled}
              >
                SUBMIT
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={onBack}
              >
                BACK
              </Button>
            </div>
          ) : currentStep === 3 ? (
            <Button
              className="w-full bg-[#8BB56B] hover:bg-[#7AA45F]"
              size="lg"
              onClick={() => router.push("/")}
            >
              DONE
            </Button>
          ) : (
            <Button
              className="w-full bg-[#8BB56B] hover:bg-[#7AA45F]"
              size="lg"
              onClick={onNext}
              disabled={!!nextLoading}
            >
              {nextLoading ? "PLEASE WAIT..." : "NEXT STEP"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-none bg-muted/40">
        <CardHeader>
          <CardTitle className="text-base">Why Book With Us?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-2 items-center">
            <BadgePercent className="w-4 h-4" />
            <span>No-hassle best price guarantee</span>
          </div>
          <div className="flex gap-2 items-center">
            <CreditCard className="w-4 h-4" />
            <span>Customer care available 24/7</span>
          </div>
          <div className="flex gap-2 items-center">
            <Receipt className="w-4 h-4" />
            <span>Hand-picked Tours & Activities</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
