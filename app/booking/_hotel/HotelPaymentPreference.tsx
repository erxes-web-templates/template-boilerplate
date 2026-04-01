"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";

type Props = {
  isPrepayment: boolean;
  payNowAmount: number;
  totalPrice: number;
  onChange: (isPrepayment: boolean) => void;
};

export default function HotelPaymentPreference({
  isPrepayment,
  payNowAmount,
  totalPrice,
  onChange,
}: Props) {
  return (
    <Card className="rounded-2xl border border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle>Payment Preference</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-sm text-muted-foreground">
          Choose how you want to pay for this reservation.
        </Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              isPrepayment ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="font-semibold">Pre payment</div>
            <div className="text-sm text-muted-foreground">
              Pay MNT {payNowAmount.toLocaleString()} now
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              !isPrepayment ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="font-semibold">Full payment</div>
            <div className="text-sm text-muted-foreground">
              Pay MNT {totalPrice.toLocaleString()} now
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
