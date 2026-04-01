"use client";

import { Users } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

export default function TravelerHotelDetails({
  hotelData,
  showErrors,
  leadDisabled,
  updateHotelData,
}: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-6">
        <div className="flex gap-2 items-center mb-6">
          <Users className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <h2 className="text-lg font-bold text-foreground">Guest Details</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="sr-only">First Name</Label>
            <Input
              placeholder="First Name *"
              value={hotelData.firstName}
              className={`h-11 ${showErrors && !hotelData.firstName.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              disabled={!!leadDisabled}
              onChange={(e) => updateHotelData({ firstName: e.target.value })}
            />
          </div>
          <div>
            <Label className="sr-only">Last Name</Label>
            <Input
              placeholder="Last Name *"
              value={hotelData.lastName}
              className={`h-11 ${showErrors && !hotelData.lastName.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              disabled={!!leadDisabled}
              onChange={(e) => updateHotelData({ lastName: e.target.value })}
            />
          </div>
          <div>
            <Label className="sr-only">Email</Label>
            <Input
              placeholder="Email *"
              type="email"
              value={hotelData.email}
              className={`h-11 ${showErrors && (!hotelData.email.trim() || !/.+@.+\..+/.test(hotelData.email)) ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              disabled={!!leadDisabled}
              onChange={(e) => updateHotelData({ email: e.target.value })}
            />
          </div>
          <div>
            <Label className="sr-only">Phone</Label>
            <Input
              placeholder="Phone *"
              value={hotelData.phone}
              className={`h-11 ${showErrors && !hotelData.phone.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              disabled={!!leadDisabled}
              onChange={(e) => updateHotelData({ phone: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="sr-only">Additional Information</Label>
            <Textarea
              placeholder="Additional Information"
              value={hotelData.additionalInfo}
              className="resize-none min-h-24"
              rows={3}
              onChange={(e) => updateHotelData({ additionalInfo: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
