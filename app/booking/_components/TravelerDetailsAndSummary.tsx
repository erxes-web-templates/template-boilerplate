"use client";

import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { BookingFormData } from "./BookingForm";
import type { BmTour } from "../../../types/tours";

type Props = {
  formData: BookingFormData;
  updateFormData: (newData: Partial<BookingFormData>) => void;
  selectedItem?: BmTour;
  urlStartDate: string | null;
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-6">
        <div className="flex gap-2 items-center mb-6">
          <Users className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <h2 className="text-lg font-bold text-foreground">Traveller Details</h2>
        </div>

        <div className="space-y-8">
          {Array.from({ length: Math.max(1, Number(formData.travelers || 1)) }).map((_, idx) => {
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

            const updateTraveler = (field: "firstName" | "lastName" | "gender", value: string) => {
              if (isLead) {
                updateFormData({ leadTraveler: { ...formData.leadTraveler, [field]: value } });
              } else {
                const list = [...(formData.additionalTravelers || [])];
                while (list.length < idx)
                  list.push({ firstName: "", lastName: "", birthDate: undefined, gender: "1", nationality: "", email: "", passportNumber: "" });
                list[idx - 1] = { ...traveler, [field]: value };
                updateFormData({ additionalTravelers: list });
              }
            };

            return (
              <div key={idx}>
                {idx > 0 && <div className="border-t border-border/40 mb-6" />}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Traveller {idx + 1}
                    {isLead && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Lead contact)
                      </span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="sr-only">First Name</Label>
                    <Input
                      placeholder="First Name *"
                      value={traveler.firstName}
                      className={`h-11 ${showErrors && !traveler.firstName?.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      disabled={isLead && !!leadDisabled}
                      onChange={(e) => updateTraveler("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="sr-only">Last Name</Label>
                    <Input
                      placeholder="Last Name *"
                      value={traveler.lastName}
                      className={`h-11 ${showErrors && !traveler.lastName?.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      disabled={isLead && !!leadDisabled}
                      onChange={(e) => updateTraveler("lastName", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="sr-only">Email</Label>
                    <Input
                      placeholder="Email *"
                      type="email"
                      value={isLead ? formData.leadTraveler.email : traveler.email || ""}
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
                          updateFormData({ leadTraveler: { ...formData.leadTraveler, email: e.target.value } });
                        } else {
                          const list = [...(formData.additionalTravelers || [])];
                          while (list.length < idx)
                            list.push({ firstName: "", lastName: "", birthDate: undefined, gender: "1", nationality: "", email: "", passportNumber: "" });
                          list[idx - 1] = { ...traveler, email: e.target.value };
                          updateFormData({ additionalTravelers: list });
                        }
                      }}
                    />
                  </div>

                  {isLead && (
                    <div>
                      <Label className="sr-only">Phone</Label>
                      <Input
                        placeholder="Phone *"
                        value={formData.leadTraveler.phone}
                        className={`h-11 ${showErrors && !formData.leadTraveler.phone?.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        disabled={!!leadDisabled}
                        onChange={(e) =>
                          updateFormData({ leadTraveler: { ...formData.leadTraveler, phone: e.target.value } })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <Label className="sr-only">Passport Number</Label>
                    <Input
                      placeholder="Passport Number *"
                      value={isLead ? formData.leadTraveler.passportNumber || "" : traveler.passportNumber || ""}
                      className={`h-11 ${
                        (isLead && showErrors && !formData.leadTraveler.passportNumber?.trim()) ||
                        (!isLead && showErrors && !traveler.passportNumber?.trim())
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      disabled={isLead && !!leadPassportDisabled}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (isLead) {
                          updateFormData({ leadTraveler: { ...formData.leadTraveler, passportNumber: v } });
                        } else {
                          const list = [...(formData.additionalTravelers || [])];
                          while (list.length < idx)
                            list.push({ firstName: "", lastName: "", birthDate: undefined, gender: "1", nationality: "", email: "", passportNumber: "" });
                          list[idx - 1] = { ...traveler, passportNumber: v };
                          updateFormData({ additionalTravelers: list });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Select
                      value={traveler.gender === "1" || traveler.gender === "male" ? "male" : "female"}
                      onValueChange={(v) => updateTraveler("gender", v)}
                      disabled={isLead && !!leadGenderDisabled}
                    >
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isLead && (
                    <div className="sm:col-span-2">
                      <Label className="sr-only">Additional Information</Label>
                      <Textarea
                        placeholder="Additional Information"
                        value={formData.additionalInfo || ""}
                        className="resize-none min-h-24"
                        rows={3}
                        onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
