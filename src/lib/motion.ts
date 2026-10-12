export const MOTION_DURATIONS = {
  micro: 0.18,
  screen: 0.32,
  celebration: 0.9,
} as const;

export const MOTION_EASINGS = {
  soft: [0.22, 1, 0.36, 1],
  spring: [0.16, 1, 0.3, 1],
} as const;

export type DonationMotionState = "pending_payment" | "pending" | "failed" | "cancelled" | "expired" | "sandbox" | "paid" | "PAID" | "verified" | "unverified" | string;

export function isVerifiedDonationState(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return ["paid", "paid_verified", "verified", "succeeded", "success"].includes(normalized) || normalized.endsWith("paid");
}

export function shouldCelebrateVerifiedDonation(status?: string | null, reducedMotion = false): boolean {
  return !reducedMotion && isVerifiedDonationState(status);
}

export function shouldAdvanceLiveTotal(current: number, next: number, status?: string | null, reducedMotion = false): boolean {
  return !reducedMotion
    && Number.isFinite(next)
    && next >= 0
    && current !== next
    && isVerifiedDonationState(status);
}
