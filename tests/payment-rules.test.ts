import assert from "node:assert/strict";
import test from "node:test";
import type { VerifiedPaymentEvent } from "../src/lib/payment-adapters";
import { guestDonationInput } from "../src/lib/guest-donation";
import { paymentMatchesDonation, shouldMarkDonationPaid } from "../src/lib/payment-rules";

const donation = {
  providerOrderId: "order-123",
  amount: "5.00",
  currency: "NPR",
  status: "PENDING_PAYMENT",
};

const successfulEvent: VerifiedPaymentEvent = {
  providerEventId: "event-123",
  eventType: "payment.succeeded",
  orderId: "order-123",
  paymentId: "payment-123",
  amount: "5",
  currency: "npr",
  status: "SUCCEEDED",
};

test("only a signed success with matching order, amount, and currency matches", () => {
  assert.equal(paymentMatchesDonation(successfulEvent, donation), true);
  assert.equal(paymentMatchesDonation({ ...successfulEvent, amount: "4.99" }, donation), false);
  assert.equal(paymentMatchesDonation({ ...successfulEvent, currency: "USD" }, donation), false);
  assert.equal(paymentMatchesDonation({ ...successfulEvent, orderId: "other-order" }, donation), false);
  assert.equal(paymentMatchesDonation({ ...successfulEvent, status: "PENDING" }, donation), false);
  assert.equal(paymentMatchesDonation({ ...successfulEvent, status: "FAILED" }, donation), false);
});

test("pending, failed, final-state, and duplicate events never transition to paid", () => {
  assert.equal(shouldMarkDonationPaid(successfulEvent, donation, false), true);
  assert.equal(shouldMarkDonationPaid(successfulEvent, donation, true), false);
  assert.equal(shouldMarkDonationPaid({ ...successfulEvent, status: "FAILED" }, donation, false), false);
  assert.equal(shouldMarkDonationPaid(successfulEvent, { ...donation, status: "FAILED" }, false), false);
});

test("guest checkout accepts donation details without account/contact fields", () => {
  assert.equal(guestDonationInput.safeParse({
    causeSlug: "sample-cause",
    amount: 1,
    currency: "NPR",
    paymentMethod: "sandbox",
  }).success, true);
  for (const field of ["email", "phone", "otp", "userId", "login"]) {
    assert.equal(guestDonationInput.safeParse({
      causeSlug: "sample-cause",
      amount: 1,
      currency: "NPR",
      paymentMethod: "sandbox",
      [field]: "not-requested",
    }).success, false);
  }
});