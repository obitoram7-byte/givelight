import { z } from "zod";

export const guestDonationInput = z.object({
  causeSlug: z.string().min(1).max(100),
  amount: z.number().finite().min(1).max(10000),
  currency: z.enum(["USD", "NPR", "INR"]),
  paymentMethod: z.string().min(1).max(60),
}).strict();