import { useMemo } from "react";

export type PricingRow = { pax: number; price: number };

/**
 * Discount multipliers based on number of pax:
 * 1 pax → 0% discount
 * 2 pax → 32.5% discount
 * 3 pax → 45% discount
 * 4+ pax → 50% discount
 */
const DISCOUNT_MULTIPLIERS = {
  1: 1.0,
  2: 0.675,
  3: 0.55,
  4: 0.5,
} as const;

export function computeTourPricing(tour: any) {
  const base = Number(tour?.cost ?? 0);

  const getPriceForPax = (pax: number): number => {
    if (!Number.isFinite(pax) || pax <= 0) return 0;
    if (pax >= 4) return Math.round(base * DISCOUNT_MULTIPLIERS[4]);
    if (pax === 3) return Math.round(base * DISCOUNT_MULTIPLIERS[3]);
    if (pax === 2) return Math.round(base * DISCOUNT_MULTIPLIERS[2]);
    return Math.round(base * DISCOUNT_MULTIPLIERS[1]);
  };

  const rows: PricingRow[] = [1, 2, 3, 4].map((pax) => ({
    pax,
    price: getPriceForPax(pax),
  }));

  return { rows, currency: "$", getPriceForPax };
}

export function useTourPricing(tour: any) {
  return useMemo(() => computeTourPricing(tour), [tour]);
}
