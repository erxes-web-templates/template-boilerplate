import { z } from "zod";
import type { BookingFormData } from "./BookingForm";

export const leadTravelerSchema = z.object({
  firstName: z.string().trim().min(1, "First Name is required"),
  lastName: z.string().trim().min(1, "Last Name is required"),
  email: z.string().trim().email("Valid Email is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  birthDate: z.date().optional().or(z.undefined()),
  gender: z.string().trim().min(1).optional(),
  nationality: z.string().trim().optional().default(""),
  passportNumber: z.string().trim().min(1, "Passport Number is required"),
});

export const stepOneSchema = z.object({
  leadTraveler: leadTravelerSchema,
});

export type StepOneInput = z.infer<typeof stepOneSchema>;

export function validateBookingStepOne(data: BookingFormData) {
  const errors: string[] = [];

  const parsed = stepOneSchema.safeParse({ leadTraveler: data.leadTraveler });
  if (!parsed.success) {
    errors.push(...parsed.error.issues.map((e) => e.message));
  }

  const expectedAdditional = Math.max(0, Number(data.travelers || 1) - 1);
  for (let i = 0; i < expectedAdditional; i++) {
    const t = data.additionalTravelers?.[i];
    if (!t) {
      errors.push(`Traveller ${i + 2}: all required fields are missing`);
      continue;
    }
    if (!t.firstName?.trim())
      errors.push(`Traveller ${i + 2}: First Name is required`);
    if (!t.lastName?.trim())
      errors.push(`Traveller ${i + 2}: Last Name is required`);
    const email = (t.email || "").trim();
    if (!email || !/.+@.+\..+/.test(email))
      errors.push(`Traveller ${i + 2}: Valid Email is required`);
    if (!t.passportNumber?.trim())
      errors.push(`Traveller ${i + 2}: Passport Number is required`);
  }

  if (errors.length === 0) return { ok: true as const, errors };
  return { ok: false as const, errors };
}
