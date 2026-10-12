export type PaymentProvider = "fonepay" | "esewa" | "khalti" | "razorpay" | "stripe" | "paypal";
export type ProviderPaymentStatus = "SUCCEEDED" | "FAILED" | "CANCELLED" | "EXPIRED" | "PENDING";

export type VerifiedPaymentEvent = {
  providerEventId: string;
  eventType: string;
  orderId: string;
  paymentId: string;
  amount: string;
  currency: string;
  status: ProviderPaymentStatus;
};

export interface PaymentAdapter {
  provider: PaymentProvider;
  createOrder(input: { donationId: string; amount: number; currency: string; idempotencyKey: string }): Promise<{ orderId: string; checkoutUrl?: string; qrPayload?: string }>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedPaymentEvent>;
}

const adapters = new Map<PaymentProvider, PaymentAdapter>();

export function registerPaymentAdapter(adapter: PaymentAdapter) {
  adapters.set(adapter.provider, adapter);
}

export function getPaymentAdapter(provider: string) {
  return adapters.get(provider as PaymentProvider);
}
