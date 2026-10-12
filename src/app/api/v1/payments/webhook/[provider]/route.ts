import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/lib/payment-adapters";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ provider: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { provider } = await context.params;
  const adapter = getPaymentAdapter(provider);
  if (!adapter) return NextResponse.json({ error: "Payment provider is not configured." }, { status: 503 });

  const rawBody = await request.text();
  let event;
  try {
    event = await adapter.verifyWebhook(rawBody, request.headers);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const donation = await transaction.donation.findUnique({ where: { providerOrderId: event.orderId } });
      if (!donation) throw new Error("Donation order not found.");
      await transaction.paymentEvent.create({
        data: {
          donationId: donation.id,
          provider,
          eventType: event.eventType,
          providerEventId: event.providerEventId,
          payloadHash: createHash("sha256").update(rawBody).digest("hex"),
        },
      });
      if (event.status === "SUCCEEDED" && donation.status === "PENDING_PAYMENT") {
        await transaction.donation.update({
          where: { id: donation.id },
          data: { status: "PAID", providerPaymentId: event.paymentId, paidAt: new Date() },
        });
      }
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: "Verified event could not be recorded." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
