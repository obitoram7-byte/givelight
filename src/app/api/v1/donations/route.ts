import { NextResponse } from "next/server"
import { z } from "zod"
import { causes } from '@/lib/demo-data'
import { createDemoDonation } from '@/lib/demo-store'
import { getPaymentMethodById } from '@/lib/payment-methods'
import { createLightPoint, updateDonationStatus, addFundLedgerEntry, AdminAuditLog, AdminAction } from '@/lib/light-points'

const donationInput = z.object({
  causeSlug: z.string().min(1).max(100),
  amount: z.number().finite().min(1).max(10000),
  currency: z.enum(["USD", "NPR", "INR"]),
  paymentMethodId: z.string().optional(),
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

  const { causeSlug, amount, currency, paymentMethodId } = parsed.data
  const cause = causes.find((item) => item.slug === causeSlug)
  if (!cause) {
    return NextResponse.json({ error: "Cause not found." }, { status: 404 })
  }

  // Fetch payment method
  const paymentMethod = paymentMethodId ? getPaymentMethodById(paymentMethodId) : null

  // Create donation record
  const donation = createDemoDonation({
    causeSlug: cause.slug,
    amount,
    currency,
    idempotencyKey,
    sessionIdentifier: crypto.randomUUID(),
    paymentMethodId: paymentMethodId,
    isPublicLeaderboardEligible: true,
  })

  // Create a light point for self-confirmation
  const lightPoint = createLightPoint(donation.id, donation.sessionIdentifier)

  // Update donation status to SELF_CONFIRMED
  const donationWithLightPoint = updateDonationStatus(donation, "SELF_CONFIRMED")
  donationWithLightPoint.lightPoints = [lightPoint]

  return NextResponse.json({
    id: donation.id,
    status: donation.status,
    donation: donationWithLightPoint,
    message: "Your light has been added. Please confirm payment.",
  }, { status: 201 })
}

// Admin API endpoints
export async function PUTDonationVerification(request: Request) {
  const { donationId, adminId } = await request.json()

  if (!donationId || !adminId) {
    return NextResponse.json({ error: "Donation ID and admin ID are required." }, { status: 400 })
  }

  const donation = { id: donationId, status: "VERIFIED", verifiedAt: new Date() }
  const ledgerEntry = addFundLedgerEntry(donation, donation.amount, donation.currency, "PUBLIC_CONTRIBUTION")

  const updatedDonation = { ...donation, lightPoints: donation.lightPoints || [], ledgerEntries: [ledgerEntry] }

  const auditLog: AdminAuditLog = {
    id: crypto.randomUUID(),
    adminId,
    action: "VERIFY",
    entityType: "Donation",
    entityId: donationId,
    beforeJson: donation,
    afterJson: updatedDonation,
    createdAt: new Date(),
  }

  return NextResponse.json({
    donation: updatedDonation,
    auditLog,
    message: "Donation verified successfully.",
  }, { status: 200 })
}

export async function PUTDonationRejection(request: Request) {
  const { donationId, adminId, reviewNote } = await request.json()

  if (!donationId || !adminId) {
    return NextResponse.json({ error: "Donation ID and admin ID are required." }, { status: 400 })
  }

  const donation = { id: donationId, status: "REJECTED", reviewNote, verifiedAt: null }
  const auditLog: AdminAuditLog = {
    id: crypto.randomUUID(),
    adminId,
    action: "REJECT",
    entityType: "Donation",
    entityId: donationId,
    beforeJson: donation,
    afterJson: donation,
    createdAt: new Date(),
  }

  return NextResponse.json({
    donation,
    auditLog,
    message: "Donation rejected successfully.",
  }, { status: 200 })
}

export async function PUTBanSession(request: Request) {
  const { donationId, adminId } = await request.json()

  if (!donationId || !adminId) {
    return NextResponse.json({ error: "Donation ID and admin ID are required." }, { status: 400 })
  }

  const donation = { id: donationId, status: "BANNED" }
  const auditLog: AdminAuditLog = {
    id: crypto.randomUUID(),
    adminId,
    action: "BAN_SESSION",
    entityType: "Donation",
    entityId: donationId,
    beforeJson: donation,
    afterJson: donation,
    createdAt: new Date(),
  }

  return NextResponse.json({
    donation,
    auditLog,
    message: "Session banned successfully.",
  }, { status: 200 })
}