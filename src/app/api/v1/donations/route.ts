import { NextResponse } from "next/server"
import { z } from "zod"
import { causes } from '@/lib/demo-data'
import { createDemoDonation } from '@/lib/demo-store'

const donationInput = z.object({
  causeSlug: z.string().min(1).max(100),
  amount: z.number().finite().min(1).max(10000),
  currency: z.enum(["USD", "NPR", "INR"]),
})

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key")
  if (!idempotencyKey || idempotencyKey.length > 128) {
    return NextResponse.json({ error: "A valid Idempotency-Key header is required." }, { status: 400 })
  }

  const parsed = donationInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid donation request." }, { status: 400 })
  }

  const { causeSlug, amount, currency } = parsed.data
  const cause = causes.find((item) => item.slug === causeSlug)
  if (!cause) {
    return NextResponse.json({ error: "Cause not found." }, { status: 404 })
  }

  const donation = createDemoDonation({
    causeSlug: cause.slug,
    amount,
    currency,
    idempotencyKey,
  })

  return NextResponse.json({
    id: donation.id,
    status: donation.status,
    donation,
    message: "Your light has been added. Please confirm payment.",
  }, { status: 201 })
}
