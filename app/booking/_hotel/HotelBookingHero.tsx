"use client";

import { Check } from "lucide-react";

const steps = [
  { label: "Select Room", num: 1 },
  { label: "Payment", num: 2 },
  { label: "Complete", num: 3 },
];

export default function HotelBookingHero({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="relative w-full h-[300px] bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
            Hotel Booking
          </h1>

          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="flex justify-center items-center w-8 h-8 text-xs font-bold rounded-full transition-all duration-300"
                    style={
                      currentStep > step.num
                        ? { backgroundColor: "var(--primary)", color: "#fff" }
                        : currentStep === step.num
                          ? { backgroundColor: "#fff", color: "var(--primary)" }
                          : {
                              backgroundColor: "rgba(255,255,255,0.2)",
                              color: "rgba(255,255,255,0.6)",
                            }
                    }
                  >
                    {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                  </span>
                  <span
                    className={`text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                      currentStep >= step.num ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="w-8 h-0.5 mx-1 transition-all duration-300 sm:w-12"
                    style={{
                      backgroundColor:
                        currentStep > step.num
                          ? "var(--primary)"
                          : "rgba(255,255,255,0.2)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
