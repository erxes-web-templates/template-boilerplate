"use client";

import { CheckCircle2 } from "lucide-react";

export default function CompleteSection() {
  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-[#5F5F5F]">Complete</div>
      <div className="p-5 bg-green-50 rounded-xl border border-green-200 shadow-sm sm:p-6">
        <div className="flex gap-4 items-start">
          <div className="shrink-0">
            <span className="inline-flex justify-center items-center w-10 h-10 text-green-600 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-green-800">
              Payment successful
            </h3>
            <p className="text-sm text-green-700">
              Thank you for your booking. We will be in touch with you shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
