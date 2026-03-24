"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Receipt } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookingFormData } from "./BookingForm";
import type { BmTour } from "@/types/tours";

type Props = {
  formData: BookingFormData;
  updateFormData: (newData: Partial<BookingFormData>) => void;
  selectedItem?: BmTour;
  urlStartDate: string | null;
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponError: string | null;
  setCouponError: (v: string | null) => void;
  couponSuccess: string | null;
  setCouponSuccess: (v: string | null) => void;
  setDiscount: (n: number) => void;
  pricePerPerson: number;
  totalPrice: number;
  handleContinue: () => void;
  showErrors: boolean;
  leadDisabled?: boolean;
  leadPassportDisabled?: boolean;
  leadGenderDisabled?: boolean;
};

export default function TravelerDetailsAndSummary(props: Props) {
  const {
    formData,
    updateFormData,
    showErrors,
    leadDisabled,
    leadPassportDisabled,
    leadGenderDisabled,
  } = props;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex gap-2 items-center text-[#5F5F5F]">
          <Receipt className="w-4 h-4" />
          <h2 className="text-lg font-semibold">Traveller Details</h2>
        </div>

        {Array.from({
          length: Math.max(1, Number(formData.travelers || 1)),
        }).map((_, idx) => {
          const isLead = idx === 0;
          const traveler = isLead
            ? formData.leadTraveler
            : formData.additionalTravelers?.[idx - 1] || {
                firstName: "",
                lastName: "",
                birthDate: undefined,
                gender: "1",
                nationality: "",
                email: "",
                passportNumber: "",
              };

          const updateTraveler = (
            field: "firstName" | "lastName" | "gender",
            value: string
          ) => {
            if (isLead) {
              updateFormData({
                leadTraveler: { ...formData.leadTraveler, [field]: value },
              });
            } else {
              const list = [...(formData.additionalTravelers || [])];
              while (list.length < idx)
                list.push({
                  firstName: "",
                  lastName: "",
                  birthDate: undefined,
                  gender: "1",
                  nationality: "",
                  email: "",
                  passportNumber: "",
                });
              list[idx - 1] = { ...traveler, [field]: value };
              updateFormData({ additionalTravelers: list });
            }
          };

          return (
            <div key={idx} className="mt-8">
              <div className="space-y-3">
                <div className="lg:col-span-2 flex items-start text-base text-[#5F5F5F]">
                  <div className="flex gap-4 items-center">
                    <div className="text-[#444444]">Traveller {idx + 1} :</div>
                    {isLead && (
                      <span className="block text-xs text-muted-foreground">
                        (Primary contact person for this booking)
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:col-span-10 lg:grid-cols-2">
                  <div className="lg:col-span-1">
                    <Label className="sr-only">First Name</Label>
                    <Input
                      placeholder="First Name *"
                      value={traveler.firstName}
                      className={`h-11 ${
                        showErrors && !traveler.firstName?.trim()
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      disabled={isLead && !!leadDisabled}
                      onChange={(e) =>
                        updateTraveler("firstName", e.target.value)
                      }
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <Label className="sr-only">Last Name</Label>
                    <Input
                      placeholder="Last Name *"
                      value={traveler.lastName}
                      className={`h-11 ${
                        showErrors && !traveler.lastName?.trim()
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      disabled={isLead && !!leadDisabled}
                      onChange={(e) =>
                        updateTraveler("lastName", e.target.value)
                      }
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <Label className="sr-only">Email</Label>
                    <Input
                      placeholder="Email *"
                      type="email"
                      value={
                        isLead
                          ? formData.leadTraveler.email
                          : traveler.email || ""
                      }
                      className={`h-11 ${
                        (isLead &&
                          showErrors &&
                          (!formData.leadTraveler.email?.trim() ||
                            !/.+@.+\..+/.test(formData.leadTraveler.email))) ||
                        (!isLead &&
                          showErrors &&
                          (!traveler.email?.trim() ||
                            !/.+@.+\..+/.test(traveler.email || "")))
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      disabled={isLead && !!leadDisabled}
                      onChange={(e) => {
                        if (isLead) {
                          updateFormData({
                            leadTraveler: {
                              ...formData.leadTraveler,
                              email: e.target.value,
                            },
                          });
                        } else {
                          const list = [...(formData.additionalTravelers || [])];
                          while (list.length < idx)
                            list.push({
                              firstName: "",
                              lastName: "",
                              birthDate: undefined,
                              gender: "1",
                              nationality: "",
                              email: "",
                              passportNumber: "",
                            });
                          list[idx - 1] = {
                            ...traveler,
                            email: e.target.value,
                          };
                          updateFormData({ additionalTravelers: list });
                        }
                      }}
                    />
                  </div>

                  {isLead && (
                    <div className="lg:col-span-1">
                      <Label className="sr-only">Phone</Label>
                      <Input
                        placeholder="Phone *"
                        value={formData.leadTraveler.phone}
                        className={`h-11 ${
                          showErrors && !formData.leadTraveler.phone?.trim()
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        disabled={!!leadDisabled}
                        onChange={(e) =>
                          updateFormData({
                            leadTraveler: {
                              ...formData.leadTraveler,
                              phone: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="lg:col-span-1">
                    <Label className="sr-only">Passport Number</Label>
                    <Input
                      placeholder="Passport Number *"
                      value={
                        isLead
                          ? formData.leadTraveler.passportNumber || ""
                          : traveler.passportNumber || ""
                      }
                      className={`h-11 ${
                        (isLead &&
                          showErrors &&
                          !formData.leadTraveler.passportNumber?.trim()) ||
                        (!isLead &&
                          showErrors &&
                          !traveler.passportNumber?.trim())
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      disabled={isLead && !!leadPassportDisabled}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (isLead) {
                          updateFormData({
                            leadTraveler: {
                              ...formData.leadTraveler,
                              passportNumber: v,
                            },
                          });
                        } else {
                          const list = [...(formData.additionalTravelers || [])];
                          while (list.length < idx)
                            list.push({
                              firstName: "",
                              lastName: "",
                              birthDate: undefined,
                              gender: "1",
                              nationality: "",
                              email: "",
                              passportNumber: "",
                            });
                          list[idx - 1] = { ...traveler, passportNumber: v };
                          updateFormData({ additionalTravelers: list });
                        }
                      }}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <Select
                      value={
                        traveler.gender === "1" || traveler.gender === "male"
                          ? "male"
                          : "female"
                      }
                      onValueChange={(v) => updateTraveler("gender", v)}
                      disabled={isLead && !!leadGenderDisabled}
                    >
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isLead && (
                    <div className="lg:col-span-2">
                      <Label className="sr-only">Additional Information</Label>
                      <Textarea
                        placeholder="Additional Information"
                        value={formData.additionalInfo || ""}
                        className="resize-none min-h-24"
                        rows={3}
                        onChange={(e) =>
                          updateFormData({ additionalInfo: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
