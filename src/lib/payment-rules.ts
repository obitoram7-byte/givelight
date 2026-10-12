import type { VerifiedPaymentEvent } from "@/lib/payment-adapters";

export type DonationPaymentRecord = {
  providerOrderId: string | null;
  amount: number | string;
  currency: string;
  status: string;
};

function amountInMinorUnits(amount: number | string): number | undefined {
  const normalized = String(amount).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return undefined;
  const [whole, fraction = ""] = normalized.split(".");
  const minorUnits = Number.parseInt(whole, 10) * 100 + Number.parseInt((fraction + "00").slice(0, 2), 10);
  return Number.isNaN(minorUnits) ? undefined : minorUnits;
}

export function paymentMatchesDonation(event: VerifiedPaymentEvent, donation: DonationPaymentRecord) {
  const receivedAmount = amountInMinorUnits(event.amount);
  const expectedAmount = amountInMinorUnits(donation.amount);

  return event.status === "SUCCEEDED"
    && donation.providerOrderId !== null
    && event.orderId === donation.providerOrderId
    && event.currency.toUpperCase() === donation.currency.toUpperCase()
    && receivedAmount !== undefined
    && receivedAmount === expectedAmount;
}

export function shouldMarkDonationPaid(
  event: VerifiedPaymentEvent,
  donation: DonationPaymentRecord,
  eventAlreadyProcessed: boolean,
) {
  return !eventAlreadyProcessed
    && donation.status === "PENDING_PAYMENT"
    && paymentMatchesDonation(event, donation);
}