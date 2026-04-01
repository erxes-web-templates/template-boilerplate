import type { BookingFormData } from "../_components/BookingForm";
import type { ParsedPipelineConfig } from "./types";

export const PAYMENT_CHECK_INTERVAL = 3000;
export const PREPAYMENT_RATIO = 0.5;

export const parsePipelineConfig = (
  value: unknown,
): ParsedPipelineConfig | null => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as ParsedPipelineConfig;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as ParsedPipelineConfig;
  return null;
};

export const toIsoDate = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export const diffNights = (start: string | null, end: string | null) => {
  if (!start || !end) return 1;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const buildDummyTourData = (): BookingFormData => ({
  selectedDate: null,
  travelers: 1,
  additionalInfo: "",
  leadTraveler: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: undefined,
    gender: "1",
    nationality: "",
    passportNumber: "",
    address: "",
  },
  additionalTravelers: [],
  paymentType: "Card",
  paymentMethod: "card",
});
