import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking",
  description: "Complete your booking.",
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
