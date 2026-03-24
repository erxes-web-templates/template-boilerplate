"use client";

import { Receipt } from "lucide-react";

type PaymentSectionProps = {
  paymentUrl?: string | null;
  loading?: boolean;
};

export default function PaymentSection({
  paymentUrl,
  loading = false,
}: PaymentSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center text-[#5F5F5F]">
        <Receipt className="w-4 h-4" />
        <h2 className="text-lg font-semibold">Payment</h2>
      </div>

      {loading ? (
        <div
          className="flex flex-col gap-4 justify-center items-center w-full bg-white rounded-2xl shadow-sm"
          style={{ height: 750 }}
        >
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">
              Creating payment...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we prepare your payment
            </p>
          </div>
        </div>
      ) : paymentUrl ? (
        <div className="w-full" style={{ height: 750 }}>
          <iframe
            src={`https://ecommerce.golomtbank.com/payment/en/${paymentUrl}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: 16,
            }}
          />
        </div>
      ) : (
        <div
          className="flex flex-col gap-4 justify-center items-center w-full bg-white rounded-2xl shadow-sm"
          style={{ height: 750 }}
        >
          <p className="text-sm text-gray-500">
            Initializing payment gateway...
          </p>
        </div>
      )}
    </div>
  );
}
