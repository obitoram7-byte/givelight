export type FundRegion = "Nepal" | "India" | "International";
export type FundCurrency = "NPR" | "INR" | "USD";

export type PaymentMethod = {
  id: string;
  provider: "ESEWA" | "UPI" | "PAYPAL";
  region: FundRegion;
  currency: FundCurrency;
  payeeName: string;
  identifier: string;
  instructions: {
    en: string;
    hi: string;
  };
  active: boolean;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "nepal-esewa",
    provider: "ESEWA",
    region: "Nepal",
    currency: "NPR",
    payeeName: "Givelight owner",
    identifier: "Add via Admin Dashboard",
    instructions: {
      en: "Scan the QR, pay the selected amount, then confirm only after the payment is complete.",
      hi: "QR स्कैन करें, चुनी हुई राशि का भुगतान करें, फिर payment complete होने के बाद ही confirm करें।",
    },
    active: false,
  },
  {
    id: "india-upi",
    provider: "UPI",
    region: "India",
    currency: "INR",
    payeeName: "Givelight owner",
    identifier: "Add via Admin Dashboard",
    instructions: {
      en: "Use the active UPI QR or ID shown in the admin dashboard before confirming your support.",
      hi: "Admin dashboard में दिखा हुआ active UPI QR/ID का उपयोग करें और payment के बाद ही confirm करें।",
    },
    active: false,
  },
  {
    id: "international-paypal",
    provider: "PAYPAL",
    region: "International",
    currency: "USD",
    payeeName: "Givelight owner",
    identifier: "Add via Admin Dashboard",
    instructions: {
      en: "Open the active PayPal link or QR configured by the owner, complete the transfer, then confirm your light.",
      hi: "Owner द्वारा configured PayPal link/QR खोलें, transfer complete करें, फिर अपनी roshni confirm करें।",
    },
    active: false,
  },
];

export const publicStats = {
  totalVerifiedFund: 0,
  publicVerifiedContributions: 0,
  founderContribution: 0,
  todayVerifiedPublicContributions: 0,
  verifiedSupporters: 0,
  lastVerifiedAt: null as string | null,
};

export const recentDonations: Array<{ name: string; place: string; amount: number; currency: "USD" | "NPR" | "INR"; time: string }> = [];

export const leaderboardDemoData: Array<{
  rank: number;
  donorIdentifier: string;
  nickname: string;
  avatarUrl: string;
  displayMode: string;
  verifiedAmount: number;
  currency: string;
  locationLabel?: string;
  badge?: string;
}> = [];

export const futurePlans: Array<{
  id: string;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  status: "DRAFT" | "ANNOUNCED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}> = [];

export const stats = {
  total: 0,
  donors: 0,
  today: 0,
  countries: 0,
};