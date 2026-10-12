export type CauseCategory = "Education" | "Health" | "Food" | "Disaster";
export type Region = "Nepal" | "India" | "Global";

export type Cause = {
  slug: string;
  title: string;
  category: CauseCategory;
  region: Region;
  location: string;
  description: string;
  raised: number;
  goal: number;
  daysLeft: number;
  image: string;
  verified: boolean;
};

export const causes: Cause[] = [
  {
    slug: "school-light",
    title: "A brighter way to learn",
    category: "Education",
    region: "Nepal",
    location: "Pokhara, Nepal",
    description: "Solar study lights for children whose school day does not end at sunset.",
    raised: 8420,
    goal: 12000,
    daysLeft: 16,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85",
    verified: true,
  },
  {
    slug: "care-close-to-home",
    title: "Care, close to home",
    category: "Health",
    region: "India",
    location: "Jaipur, India",
    description: "Community health visits and essential care for families in underserved neighborhoods.",
    raised: 12740,
    goal: 18000,
    daysLeft: 23,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=85",
    verified: true,
  },
  {
    slug: "shelter-after-storm",
    title: "A safe place after the storm",
    category: "Disaster",
    region: "Global",
    location: "South Asia",
    description: "Emergency shelter kits and clean water for families rebuilding after severe floods.",
    raised: 18360,
    goal: 25000,
    daysLeft: 9,
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=85",
    verified: true,
  },
];

export const recentDonations = [
  { name: "A kind neighbor", place: "Kathmandu", amount: 5, currency: "USD", time: "just now" },
  { name: "Anonymous", place: "Mumbai", amount: 2, currency: "USD", time: "1 min ago" },
  { name: "A little light", place: "Pokhara", amount: 10, currency: "USD", time: "3 min ago" },
  { name: "Anonymous", place: "London", amount: 1, currency: "USD", time: "5 min ago" },
];

export const leaderboardDemoData = [
  {
    rank: 1,
    donorIdentifier: "donor-1",
    nickname: "Sunny Nepal",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Sunny&backgroundColor=000000,ffffff&fontSize=50",
    displayMode: "NICKNAME_PHOTO",
    verifiedAmount: 12840,
    currency: "NPR",
    locationLabel: "Pokhara, Nepal",
    badge: "Top Light",
  },
  {
    rank: 2,
    donorIdentifier: "donor-2",
    nickname: "Rahul India",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Rahul&backgroundColor=000000,ffffff&fontSize=50",
    displayMode: "NICKNAME_PHOTO",
    verifiedAmount: 9760,
    currency: "INR",
    locationLabel: "Mumbai, India",
    badge: "Kindness Streak",
  },
  {
    rank: 3,
    donorIdentifier: "donor-3",
    nickname: "London Friends",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=London&backgroundColor=000000,ffffff&fontSize=50",
    displayMode: "ANONYMOUS",
    verifiedAmount: 6410,
    currency: "GBP",
    locationLabel: "London, UK",
    badge: "First Light",
  },
  {
    rank: 4,
    donorIdentifier: "donor-4",
    nickname: "Anonymous Light",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Anonymous&backgroundColor=000000,ffffff&fontSize=50",
    displayMode: "ANONYMOUS",
    verifiedAmount: 4820,
    currency: "USD",
    badge: "Global Light",
  },
  {
    rank: 5,
    donorIdentifier: "donor-5",
    nickname: "Kathmandu Valley",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Kathmandu&backgroundColor=000000,ffffff&fontSize=50",
    displayMode: "ANONYMOUS",
    verifiedAmount: 3205,
    currency: "NPR",
  },
];

export const stats = {
  total: 284630,
  donors: 18942,
  today: 4821,
  countries: 28,
};