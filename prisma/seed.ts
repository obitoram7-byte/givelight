import { PrismaClient, CauseCategory, CauseStatus, NgoVerificationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The Givelight demo seed must not run in production.");
  }

  const ngo = await prisma.ngo.upsert({
    where: { id: "10000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "10000000-0000-4000-8000-000000000001",
      name: "Bright Steps Nepal",
      country: "Nepal",
      registrationNumber: "NGO-DEMO-2048",
      verificationStatus: NgoVerificationStatus.VERIFIED,
      verifiedAt: new Date(),
    },
  });

  const causes = [
    { slug: "school-light", title: "Keep a classroom bright", category: CauseCategory.EDUCATION, country: "Nepal", city: "Pokhara", goalAmount: "12000", currency: "USD", description: "Solar study lights for children learning after sunset." },
    { slug: "care-close-to-home", title: "Care, close to home", category: CauseCategory.HEALTH, country: "India", city: "Jaipur", goalAmount: "18000", currency: "USD", description: "Community health visits and essential care for families." },
    { slug: "shelter-after-storm", title: "A safer place after the storm", category: CauseCategory.DISASTER, country: "Global", city: null, goalAmount: "25000", currency: "USD", description: "Emergency shelter kits and clean water for displaced families." },
  ];

  for (const cause of causes) {
    await prisma.cause.upsert({
      where: { slug: cause.slug },
      update: {},
      create: { ...cause, ngoId: ngo.id, status: CauseStatus.ACTIVE, endsAt: new Date(Date.now() + 16 * 86400000) },
    });
  }

  const donationFixtures = [
    { idempotencyKey: "seed-demo-pokhara-001", causeSlug: "school-light", amount: "5", currency: "USD", country: "Nepal", city: "Pokhara" },
    { idempotencyKey: "seed-demo-jaipur-001", causeSlug: "care-close-to-home", amount: "2", currency: "INR", country: "India", city: "Jaipur" },
    { idempotencyKey: "seed-demo-global-001", causeSlug: "shelter-after-storm", amount: "1", currency: "USD", country: "Global", city: null },
  ];

  for (const fixture of donationFixtures) {
    const { causeSlug, ...donation } = fixture;
    const cause = await prisma.cause.findUniqueOrThrow({ where: { slug: causeSlug } });
    await prisma.donation.upsert({
      where: { idempotencyKey: donation.idempotencyKey },
      update: {},
      create: {
        ...donation,
        causeId: cause.id,
        status: "EXPIRED",
        paymentProvider: "demo-seed",
        isAnonymous: true,
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
