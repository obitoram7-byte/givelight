import { randomUUID } from "node:crypto";
import { stats } from "@/lib/demo-data";

export type DemoDonationStatus = "pending_payment" | "paid";
type DemoDonation = {
  id: string;
  amount: number;
  currency: string;
  causeSlug: string;
  idempotencyKey: string;
  status: DemoDonationStatus;
  createdAt: string;
  donorNumber: number;
};

const globalForDemo = globalThis as typeof globalThis & { givelightDonations?: Map<string, DemoDonation> };
const demoDonations = globalForDemo.givelightDonations ?? new Map<string, DemoDonation>();
globalForDemo.givelightDonations = demoDonations;

export function createDemoDonation(input: Omit<DemoDonation, "id" | "status" | "createdAt" | "donorNumber">) {
  const existing = [...demoDonations.values()].find((donation) => donation.idempotencyKey === input.idempotencyKey);
  if (existing) return existing;
  const record: DemoDonation = {
    ...input,
    id: randomUUID(),
    status: "pending_payment",
    createdAt: new Date().toISOString(),
    donorNumber: 18943 + demoDonations.size,
  };
  demoDonations.set(record.id, record);
  return record;
}

export function getDemoDonation(id: string) {
  return demoDonations.get(id);
}

export function confirmDemoDonation(id: string) {
  const record = demoDonations.get(id);
  if (!record) return undefined;
  record.status = "paid";
  return record;
}

export function getDemoStats() {
  const paidDonations = [...demoDonations.values()].filter((donation) => donation.status === "paid");
  const usdDonations = paidDonations.filter((donation) => donation.currency === "USD");
  const extraUsd = usdDonations.reduce((sum, donation) => sum + donation.amount, 0);
  return {
    ...stats,
    total: stats.total + extraUsd,
    today: stats.today + extraUsd,
    donors: stats.donors + paidDonations.length,
  };
}
