import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { z } from "zod";

admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();

// -------------------------------------------------------------------------
// 1. CREATE SELF CONFIRMED CONTRIBUTION
// -------------------------------------------------------------------------
const selfConfirmSchema = z.object({
  amount: z.number().positive().max(100000),
  currency: z.enum(["NPR", "INR", "USD"]),
  paymentMethodId: z.string().min(1),
  campaignId: z.string().optional(),
  publicNickname: z.string().max(50).optional(),
});

export const createSelfConfirmedContribution = functions.onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new functions.HttpsError("unauthenticated", "User must be authenticated (anonymous or registered).");
    }

    const parseResult = selfConfirmSchema.safeParse(request.data);
    if (!parseResult.success) {
      throw new functions.HttpsError("invalid-argument", "Invalid contribution data: " + parseResult.error.message);
    }

    const { amount, currency, paymentMethodId, campaignId, publicNickname } = parseResult.data;
    const uid = request.auth.uid;

    // Check payment method status
    const pmDoc = await db.collection("paymentMethods").doc(paymentMethodId).get();
    if (!pmDoc.exists || pmDoc.data()?.status !== "ACTIVE") {
      throw new functions.HttpsError("failed-precondition", "Selected payment method is not active.");
    }

    const pmData = pmDoc.data()!;

    // Rate limit: Max 5 pending claims per 15 minutes per UID
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentClaims = await db
      .collection("contributionClaims")
      .where("createdByUid", "==", uid)
      .where("createdAt", ">=", fifteenMinsAgo)
      .get();

    if (recentClaims.size >= 5) {
      throw new functions.HttpsError("resource-exhausted", "Rate limit exceeded. Please wait a few minutes before submitting another confirmation.");
    }

    const claimRef = db.collection("contributionClaims").doc();
    const lightPointRef = db.collection("lightPoints").doc();

    const claimData = {
      id: claimRef.id,
      createdByUid: uid,
      campaignId: campaignId || null,
      paymentMethodId,
      paymentMethodSnapshot: {
        provider: pmData.provider,
        region: pmData.region,
        payeeName: pmData.payeeName,
        accountIdentifier: pmData.accountIdentifier || null,
      },
      amount,
      currency,
      status: "SELF_CONFIRMED",
      publicNickname: publicNickname || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedByUid: null,
      reviewedAt: null,
      reviewNote: null,
      verifiedLedgerEntryId: null,
    };

    const lightPointData = {
      id: lightPointRef.id,
      uid,
      contributionClaimId: claimRef.id,
      points: 1,
      status: "PENDING",
      reason: "Self-confirmed contribution submission",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.runTransaction(async (transaction) => {
      transaction.set(claimRef, claimData);
      transaction.set(lightPointRef, lightPointData);
    });

    return {
      success: true,
      claimId: claimRef.id,
      message: "Self-confirmed contribution submitted. Pending admin verification.",
    };
  }
);

// -------------------------------------------------------------------------
// 2. APPROVE CONTRIBUTION CLAIM (ADMIN ONLY)
// -------------------------------------------------------------------------
export const approveContributionClaim = functions.onCall(
  { cors: true },
  async (request) => {
    if (!request.auth || !request.auth.token.admin) {
      throw new functions.HttpsError("permission-denied", "Only verified administrators can perform this action.");
    }

    const { claimId } = request.data || {};
    if (!claimId || typeof claimId !== "string") {
      throw new functions.HttpsError("invalid-argument", "Valid claimId is required.");
    }

    const adminUid = request.auth.uid;
    const claimRef = db.collection("contributionClaims").doc(claimId);
    const claimDoc = await claimRef.get();

    if (!claimDoc.exists) {
      throw new functions.HttpsError("not-found", "Contribution claim not found.");
    }

    const claim = claimDoc.data()!;
    if (claim.status === "VERIFIED") {
      return { success: true, message: "Claim was already verified." };
    }

    const amount = Number(claim.amount);
    const currency = claim.currency as "NPR" | "INR" | "USD";
    const ledgerRef = db.collection("fundLedger").doc();
    const statsRef = db.collection("publicStats").doc("live");

    await db.runTransaction(async (transaction) => {
      // 1. Mark claim as verified
      transaction.update(claimRef, {
        status: "VERIFIED",
        reviewedByUid: adminUid,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedLedgerEntryId: ledgerRef.id,
      });

      // 2. Add immutable fund ledger entry
      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        type: "VERIFIED_PUBLIC_CONTRIBUTION",
        contributionClaimId: claimId,
        campaignId: claim.campaignId || null,
        amount,
        currency,
        baseCurrencyAmount: amount, // Simplified 1:1 base currency calculation
        status: "ACTIVE",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdByUid: claim.createdByUid,
        verifiedByUid: adminUid,
        reversedLedgerId: null,
        publicActivityAllowed: true,
      });

      // 3. Update public stats atomically
      const statsDoc = await transaction.get(statsRef);
      if (!statsDoc.exists) {
        transaction.set(statsRef, {
          totalVerifiedFund: amount,
          totalPublicContributions: amount,
          totalFounderContribution: 0,
          todayVerifiedPublicContributions: amount,
          verifiedSupporterCount: 1,
          baseCurrency: currency,
          lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        transaction.update(statsRef, {
          totalVerifiedFund: admin.firestore.FieldValue.increment(amount),
          totalPublicContributions: admin.firestore.FieldValue.increment(amount),
          todayVerifiedPublicContributions: admin.firestore.FieldValue.increment(amount),
          verifiedSupporterCount: admin.firestore.FieldValue.increment(1),
          lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    // 4. Update Light Points status to VERIFIED
    const lpQuery = await db.collection("lightPoints").where("contributionClaimId", "==", claimId).get();
    const batch = db.batch();
    lpQuery.forEach((doc) => {
      batch.update(doc.ref, {
        status: "VERIFIED",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    // 5. Update campaign verified total if attached
    if (claim.campaignId) {
      const campRef = db.collection("campaigns").doc(claim.campaignId);
      await campRef.update({
        verifiedRaisedAmount: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
    }

    // 6. Publish sanitized event to Realtime Database
    const activityId = ledgerRef.id;
    const safeName = claim.publicNickname || "Anonymous Light";
    await rtdb.ref(`live/recentVerifiedActivities/${activityId}`).set({
      activityId,
      displayName: safeName,
      amount,
      currency,
      timestamp: Date.now(),
    });

    const latestStats = (await statsRef.get()).data();
    if (latestStats) {
      await rtdb.ref("live/publicStats").set(latestStats);
    }

    // 7. Write Audit Log
    await db.collection("adminAuditLogs").add({
      actorUid: adminUid,
      action: "APPROVE_CLAIM",
      entityType: "contributionClaim",
      entityId: claimId,
      beforeData: { status: claim.status },
      afterData: { status: "VERIFIED", verifiedLedgerEntryId: ledgerRef.id },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Contribution verified successfully." };
  }
);

// -------------------------------------------------------------------------
// 3. REJECT CONTRIBUTION CLAIM (ADMIN ONLY)
// -------------------------------------------------------------------------
export const rejectContributionClaim = functions.onCall(
  { cors: true },
  async (request) => {
    if (!request.auth || !request.auth.token.admin) {
      throw new functions.HttpsError("permission-denied", "Only verified administrators can perform this action.");
    }

    const { claimId, reviewNote } = request.data || {};
    if (!claimId || typeof claimId !== "string") {
      throw new functions.HttpsError("invalid-argument", "Valid claimId is required.");
    }

    const adminUid = request.auth.uid;
    const claimRef = db.collection("contributionClaims").doc(claimId);
    const claimDoc = await claimRef.get();

    if (!claimDoc.exists) {
      throw new functions.HttpsError("not-found", "Claim not found.");
    }

    const beforeData = claimDoc.data()!;

    await claimRef.update({
      status: "REJECTED",
      reviewedByUid: adminUid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewNote: reviewNote || "Rejected by admin review",
    });

    // Remove Light Points
    const lpQuery = await db.collection("lightPoints").where("contributionClaimId", "==", claimId).get();
    const batch = db.batch();
    lpQuery.forEach((doc) => {
      batch.update(doc.ref, {
        status: "REMOVED",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    await db.collection("adminAuditLogs").add({
      actorUid: adminUid,
      action: "REJECT_CLAIM",
      entityType: "contributionClaim",
      entityId: claimId,
      beforeData: { status: beforeData.status },
      afterData: { status: "REJECTED", reviewNote },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Claim rejected." };
  }
);

// -------------------------------------------------------------------------
// 4. ADD FOUNDER CONTRIBUTION (ADMIN ONLY)
// -------------------------------------------------------------------------
const founderContributionSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["NPR", "INR", "USD"]),
  notePublic: z.string().max(200).optional(),
});

export const addFounderContribution = functions.onCall(
  { cors: true },
  async (request) => {
    if (!request.auth || !request.auth.token.admin) {
      throw new functions.HttpsError("permission-denied", "Only verified administrators can perform this action.");
    }

    const parseResult = founderContributionSchema.safeParse(request.data);
    if (!parseResult.success) {
      throw new functions.HttpsError("invalid-argument", "Invalid data: " + parseResult.error.message);
    }

    const { amount, currency, notePublic } = parseResult.data;
    const adminUid = request.auth.uid;

    const founderRef = db.collection("founderContributions").doc();
    const ledgerRef = db.collection("fundLedger").doc();
    const statsRef = db.collection("publicStats").doc("live");

    await db.runTransaction(async (transaction) => {
      transaction.set(founderRef, {
        id: founderRef.id,
        ledgerEntryId: ledgerRef.id,
        amount,
        currency,
        notePublic: notePublic || "Founder daily contribution",
        createdByUid: adminUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        type: "FOUNDER_CONTRIBUTION",
        contributionClaimId: null,
        campaignId: null,
        amount,
        currency,
        baseCurrencyAmount: amount,
        status: "ACTIVE",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdByUid: adminUid,
        verifiedByUid: adminUid,
        reversedLedgerId: null,
        publicActivityAllowed: true,
      });

      const statsDoc = await transaction.get(statsRef);
      if (!statsDoc.exists) {
        transaction.set(statsRef, {
          totalVerifiedFund: amount,
          totalPublicContributions: 0,
          totalFounderContribution: amount,
          todayVerifiedPublicContributions: 0,
          verifiedSupporterCount: 0,
          baseCurrency: currency,
          lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        transaction.update(statsRef, {
          totalVerifiedFund: admin.firestore.FieldValue.increment(amount),
          totalFounderContribution: admin.firestore.FieldValue.increment(amount),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    const activityId = ledgerRef.id;
    await rtdb.ref(`live/recentVerifiedActivities/${activityId}`).set({
      activityId,
      displayName: "Givelight Founder",
      amount,
      currency,
      timestamp: Date.now(),
      isFounder: true,
    });

    const latestStats = (await statsRef.get()).data();
    if (latestStats) {
      await rtdb.ref("live/publicStats").set(latestStats);
    }

    await db.collection("adminAuditLogs").add({
      actorUid: adminUid,
      action: "ADD_FOUNDER_CONTRIBUTION",
      entityType: "founderContribution",
      entityId: founderRef.id,
      beforeData: null,
      afterData: { amount, currency, notePublic },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Founder contribution added successfully." };
  }
);
