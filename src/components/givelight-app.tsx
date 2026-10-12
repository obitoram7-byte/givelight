"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Globe2,
  Heart,
  Languages,
  LockKeyhole,
  MapPin,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { causes, leaderboardDemoData, recentDonations, stats, type Cause } from "@/lib/demo-data";
import { shouldAdvanceLiveTotal, shouldCelebrateVerifiedDonation, MOTION_DURATIONS, MOTION_EASINGS } from "@/lib/motion";
import { usePreferences } from "@/lib/preferences";
import { AmountChip, AuthModal, Button, Card, LeaderboardTable, ProgressBar, Toast } from "@/components/ui";

const KindnessPlanet = dynamic(() => import("@/components/kindness-planet"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="planet-canvas" />,
});

const filters = ["All", "Nepal", "India", "Global", "Education", "Health", "Food", "Disaster"] as const;
const amounts = [1, 2, 5, 10];
type Currency = "USD" | "NPR" | "INR";
type Donation = { amount: number; currency: Currency; cause: Cause; donorNumber: number };

const storyBlueprint = {
  en: [
    { eyebrow: "Chapter 1", title: "Choose a cause", description: "Support a verified local partner with a clear need — from meals and school supplies to clean water and emergency relief." },
    { eyebrow: "Chapter 2", title: "Your gift becomes light", description: "Each contribution is tracked to a specific campaign so volunteers and partners can show where support is going." },
    { eyebrow: "Chapter 3", title: "Verified progress", description: "A campaign updates with field reports, proof of delivery, and visible milestones as the work moves forward." },
    { eyebrow: "Chapter 4", title: "Keep the momentum going", description: "Celebrate each confirmed gift, share the story, and invite others to add their light to the planet." },
  ],
  hi: [
    { eyebrow: "अध्याय 1", title: "अभियान चुनें", description: "ऐसे सत्यापित स्थानीय भागीदार को चुनें जिनकी ज़रूरत स्पष्ट हो — जैसे भोजन, स्कूल सामग्री, साफ़ पानी या आपातकालीन राहत।" },
    { eyebrow: "अध्याय 2", title: "आपका दान रोशनी बनता है", description: "हर योगदान को एक निश्चित अभियान से जोड़ा जाता है ताकि सहयोगी और भागीदार साफ़ तौर पर दिखा सकें कि मदद कहाँ जा रही है।" },
    { eyebrow: "अध्याय 3", title: "सत्यापित प्रगति", description: "अभियान की प्रगति को क्षेत्रीय रिपोर्ट, वितरण के सबूतों और स्पष्ट मील के पत्थरों के साथ अपडेट किया जाता है।" },
    { eyebrow: "अध्याय 4", title: "गति बनाए रखें", description: "हर पुष्टि किए गए दान का जश्न मनाएँ, कहानी शेयर करें, और अन्य लोगों को अपने प्रकाश को ग्रह पर जोड़ने के लिए आमंत्रित करें।" },
  ],
} as const;

const copy = {
  en: {
    nav: ["Causes", "Live impact", "Community", "Transparency"],
    donate: "Give a little light",
    eyebrow: "Small gifts. Brighter tomorrows.",
    h1a: "Your giving",
    h1b: "lights the world.",
    subtitle: "A little kindness travels further than you think. Choose a cause, give what feels right, and watch your light find its way.",
    cta: "Give $1 / Rs. 1",
    how: "See where it goes",
    safe: "No account. No contact details. Just kindness.",
    total: "Lit together",
    contributors: "kind people",
    today: "given today",
    causesEyebrow: "A good place to begin",
    causesTitle: "Small gifts. Real change.",
    causesDescription: "Meet the communities and trusted local partners turning everyday generosity into something lasting.",
    browse: "Explore all causes",
    impactEyebrow: "The light is moving",
    impactTitle: "Kindness has no borders.",
    impactDescription: "Every verified gift joins a growing wave of care across communities.",
    global: "given across 28 countries",
    community: "people have given",
    monthly: "given this month",
    live: "DEMO LIVE",
    map: "A little light, everywhere",
    donors: "Recent kind moments",
    communityTitle: "Good grows together.",
    communityDescription: "Neighborhoods, campuses, and teams making a little light go a long way.",
    teams: "Top giving circles",
    transparency: "Open books. Open hearts.",
    verify: "Verified local partners",
    audit: "Every gift is traceable",
    updates: "Impact updates from the field",
    policy: "Privacy comes first",
    mission: "Give what you can. Every light matters.",
    demo: "DEMO MODE · No real payments",
    language: "Language",
    viewStory: "View story",
    donateCause: "Give to this cause",
  },
  hi: {
    nav: ["अभियान", "लाइव प्रभाव", "समुदाय", "पारदर्शिता"],
    donate: "एक रोशनी दें",
    eyebrow: "Aapka chhota daan, duniya roshan kare.",
    h1a: "आपका दान",
    h1b: "दुनिया रोशन करे।",
    subtitle: "आपकी छोटी-सी मदद दूर तक जाती है। एक नेक काम चुनें, अपनी इच्छा से दें और देखें आपकी रोशनी कहाँ पहुँचती है।",
    cta: "₹1 / NPR 1 दें",
    how: "प्रभाव देखें",
    safe: "न खाता, न संपर्क जानकारी। बस आपकी दयालुता।",
    total: "सबने मिलकर",
    contributors: "दयालु लोग",
    today: "आज दिया",
    causesEyebrow: "शुरुआत यहाँ से",
    causesTitle: "छोटा दान। बड़ा बदलाव।",
    causesDescription: "उन समुदायों और भरोसेमंद स्थानीय साथियों से मिलें जो आपकी मदद को स्थायी बदलाव में बदलते हैं।",
    browse: "सभी अभियान देखें",
    impactEyebrow: "रोशनी आगे बढ़ रही है",
    impactTitle: "दयालुता की कोई सीमा नहीं।",
    impactDescription: "हर सत्यापित दान समुदायों में बढ़ती मदद की लहर से जुड़ता है।",
    global: "28 देशों में दिया गया",
    community: "लोगों ने योगदान दिया",
    monthly: "इस महीने दिया गया",
    live: "डेमो लाइव",
    map: "हर जगह थोड़ी रोशनी",
    donors: "हाल की मदद",
    communityTitle: "मिलकर बढ़ती है अच्छाई।",
    communityDescription: "मोहल्ले, कॉलेज और टीमें मिलकर रोशनी को दूर तक पहुँचा रहे हैं।",
    teams: "दान देने वाले समूह",
    transparency: "खुले हिसाब। खुले दिल।",
    verify: "सत्यापित स्थानीय साथी",
    audit: "हर दान का हिसाब",
    updates: "ज़मीनी प्रभाव की जानकारी",
    policy: "गोपनीयता पहले",
    mission: "जितना हो सके दें। हर रोशनी मायने रखती है।",
    demo: "डेमो मोड · वास्तविक भुगतान नहीं",
    language: "भाषा",
    viewStory: "कहानी देखें",
    donateCause: "इस अभियान को दें",
  },
} as const;

function formatMoney(amount: number, currency: Currency) {
  const locale = currency === "NPR" ? "ne-NP" : currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function LiveCounter({ value, currency = "USD" }: { value: number; currency?: Currency }) {
  const [shown, setShown] = useState(value);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!shouldAdvanceLiveTotal(shown, value, "paid", reducedMotion ?? false)) {
      setShown(value);
      return;
    }

    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [reducedMotion, shown, value]);

  return <span aria-live="polite" aria-atomic="true" className="live-counter" title={`Total raised ${formatMoney(value, currency)}`}><span className="sr-only">{formatMoney(value, currency)}</span>{formatMoney(shown, currency)}</span>;
}

function WorldMap({ language }: { language: "en" | "hi" }) {
  const t = copy[language];
  return (
    <div className="map-panel" role="img" aria-label="Illustrative map showing donation lights across South Asia and beyond">
      <div className="map-stats">{t.map}<strong>28 countries connected</strong></div>
      <svg className="world-svg" viewBox="0 0 780 360" fill="none" aria-hidden="true">
        <path d="m71 97 33-31 42-8 25 16 40-8 22 19-7 19 17 16-16 21-31 4-16 22-31 7-19 27-27-5-2-26-18-18 5-24-17-18-8-21z" fill="#9fc4a5" fillOpacity=".7" />
        <path d="m182 207 25 9 10 21 17 12 6 35-14 26-14-13-13-29-22-19 5-20-14-8 14-14z" fill="#9fc4a5" fillOpacity=".62" />
        <path d="m347 91 23-14 29 6 16-15 31 10 6 22-19 14-31-4-23 16-20-8-12-27z" fill="#9fc4a5" fillOpacity=".67" />
        <path d="m380 136 26-17 40 8 34-17 42 11 24-12 41 18 35-4 26 18 44 9 24 28-18 22-44 6-25 21-36-7-27 15-35-9-28 12-27-18-28-2-9-25-20-13-9-28-17-17z" fill="#9fc4a5" fillOpacity=".71" />
        <path d="m443 206 33 4 15 21-12 31-28 10-20-16 3-27 9-23z" fill="#9fc4a5" fillOpacity=".65" />
        <path d="m623 270 37-9 27 15 19 22-18 13-34-8-22-13-9-20z" fill="#9fc4a5" fillOpacity=".55" />
        <path d="M461 159 Q545 75 614 150" stroke="#f3bd60" strokeDasharray="4 8" strokeOpacity=".75" />
        <path d="M461 159 Q347 78 195 137" stroke="#f3bd60" strokeDasharray="4 8" strokeOpacity=".65" />
      </svg>
      <span className="map-pulse one" /><span className="map-pulse two" /><span className="map-pulse three" />
    </div>
  );
}

function DonationSheet({
  cause,
  onClose,
  onSuccess,
}: {
  cause: Cause;
  onClose: () => void;
  onSuccess: (donation: Donation) => void;
}) {
  const [currency, setCurrency] = useState<Currency>(cause.region === "Nepal" ? "NPR" : cause.region === "India" ? "INR" : "USD");
  const [amount, setAmount] = useState(1);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState(cause.region === "Nepal" ? "eSewa · demo" : cause.region === "India" ? "UPI · demo" : "Card · demo");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useRef(crypto.randomUUID());
  const chosenAmount = custom ? Number(custom) : amount;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  useEffect(() => {
    setMethod(currency === "NPR" ? "eSewa · demo" : currency === "INR" ? "UPI · demo" : "Card · demo");
  }, [currency]);

  async function submitDonation() {
    if (!Number.isFinite(chosenAmount) || chosenAmount < 1 || chosenAmount > 10000) {
      setError("Choose an amount between 1 and 10,000.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const response = await fetch("/api/v1/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey.current },
        body: JSON.stringify({ causeSlug: cause.slug, amount: chosenAmount, currency, paymentMethod: method }),
      });
      if (!response.ok) throw new Error("Could not start the demo payment. Please try again.");
      const intent = (await response.json()) as { id: string; donorNumber: number };
      const completed = await fetch(`/api/v1/donations/${intent.id}/demo-complete`, { method: "POST" });
      if (!completed.ok) throw new Error("The demo payment could not be confirmed. Please retry.");
      onSuccess({ amount: chosenAmount, currency, cause, donorNumber: intent.donorNumber });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.section
        className="donation-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
        initial={reduceMotion ? false : { y: 42, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduceMotion ? undefined : { y: 32, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
      >
        <div className="sheet-head">
          <div><span className="eyebrow">A little light goes far</span><h2 id="donation-title">Make a small difference.</h2></div>
          <button className="sheet-close" onClick={onClose} aria-label="Close donation window"><X size={18} /></button>
        </div>
        <p className="sheet-subtitle">Your gift supports <strong>{cause.title}</strong>. No account or contact details needed.</p>
        <span className="field-label">Choose an amount</span>
        <div className="amount-grid">
          {amounts.map((value) => <AmountChip key={value} label={`${currency === "USD" ? "$" : currency === "NPR" ? "NPR " : "₹"}${value}`} selected={!custom && amount === value} onSelect={() => { setAmount(value); setCustom(""); }} />)}
        </div>
        <input className="custom-amount" type="number" min="1" max="10000" inputMode="decimal" placeholder="Or enter another amount" value={custom} aria-label="Custom donation amount" onChange={(event) => { setCustom(event.target.value); setError(""); }} />
        <span className="field-label">Currency</span>
        <div className="currency-row" role="group" aria-label="Select currency">
          {(["NPR", "INR", "USD"] as Currency[]).map((value) => <button className="currency-choice" key={value} aria-pressed={currency === value} onClick={() => setCurrency(value)}>{value === "INR" ? "₹ INR" : value}</button>)}
        </div>
        <span className="field-label">Payment method</span>
        <div className="currency-row" role="group" aria-label="Select demo payment method">
          {(currency === "NPR" ? ["FonePay · demo", "eSewa · demo", "Khalti · demo"] : currency === "INR" ? ["UPI · demo", "Card · demo", "Wallet · demo"] : ["Card · demo", "Stripe · demo", "PayPal · demo"]).map((value) => <button className="currency-choice" key={value} aria-pressed={method === value} onClick={() => setMethod(value)}>{value}</button>)}
        </div>
        <div className="payment-note"><ShieldCheck size={16} /><span>This is a safe demo checkout. No payment is taken and no financial details are collected.</span></div>
        {error && <p role="alert" style={{ color: "#b64236", fontSize: 11 }}>{error}</p>}
        <button className="button button-primary button-full" onClick={submitDonation} disabled={processing}>
          {processing ? "Confirming demo gift…" : `Continue with ${formatMoney(chosenAmount || amount, currency)}`} <ArrowRight size={16} />
        </button>
        <p className="sheet-legal">By continuing, you agree to our <a href="#transparency">Terms</a> and <a href="#transparency">Privacy Policy</a>. Guest checkout never requests OTP, email, or phone.</p>
      </motion.section>
    </motion.div>
  );
}

function ShareCard({ donation, onClose }: { donation: Donation; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareText = `I sent ${formatMoney(donation.amount, donation.currency)} of light to ${donation.cause.title} with Givelight. Your giving lights the world.`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    if (navigator.share) await navigator.share({ title: "A little light goes far", text: shareText, url: window.location.origin });
    else await copyLink();
  }

  function downloadCard() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext("2d");
    if (!context) return;
    const gradient = context.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, "#0b3d2e");
    gradient.addColorStop(1, "#071a16");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f4bf5e";
    context.beginPath();
    context.arc(540, 555, 190, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#155e49";
    context.beginPath();
    context.arc(540, 555, 166, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fffdf7";
    context.textAlign = "center";
    context.font = "700 48px Arial";
    context.fillText("GIVELIGHT", 540, 180);
    context.font = "500 48px Georgia";
    context.fillText("Your giving lights", 540, 970);
    context.fillText("the world.", 540, 1035);
    context.fillStyle = "#f4bf5e";
    context.font = "700 100px Arial";
    context.fillText(formatMoney(donation.amount, donation.currency), 540, 1250);
    context.fillStyle = "#d3e3d4";
    context.font = "40px Arial";
    context.fillText(donation.cause.title, 540, 1350, 880);
    context.font = "34px Arial";
    context.fillText("A little light goes a long way.", 540, 1710);
    const link = document.createElement("a");
    link.download = "givelight-kindness-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.section className="donation-sheet" role="dialog" aria-modal="true" aria-labelledby="share-title" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="sheet-head"><div><span className="eyebrow">Your kindness, made visible</span><h2 id="share-title">Share your light.</h2></div><button className="sheet-close" onClick={onClose} aria-label="Close share card"><X size={18} /></button></div>
        <div style={{ display: "grid", placeItems: "center", padding: "20px 0" }}>
          <div style={{ width: 208, aspectRatio: "9 / 16", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 20, borderRadius: 20, color: "#fffdf7", textAlign: "center", background: "radial-gradient(circle at 50% 30%, #19735a, #0b3d2e 56%, #071a16)" }}>
            <div className="brand-mark" style={{ width: 50, height: 50, marginBottom: 22 }}><Sparkles size={22} /></div>
            <span style={{ color: "#f6c86e", fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>A KINDNESS SPARK</span>
            <strong style={{ margin: "12px 0", fontFamily: "Georgia, serif", fontSize: 37, fontWeight: 500 }}>{formatMoney(donation.amount, donation.currency)}</strong>
            <span style={{ color: "#dae8da", fontSize: 10, lineHeight: 1.6 }}>{donation.cause.title}</span>
            <span style={{ marginTop: 30, color: "#f5d693", fontFamily: "Georgia, serif", fontSize: 15 }}>Your giving lights the world.</span>
            <span style={{ marginTop: 16, color: "#b5cbb9", fontSize: 8 }}>givelight · demo gift</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <button className="button button-primary" onClick={share}><Heart size={15} /> Share</button>
          <button className="button button-quiet" onClick={downloadCard}><ArrowDownRight size={15} /> Download</button>
          <button className="button button-quiet" style={{ gridColumn: "1 / -1" }} onClick={copyLink}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Link copied" : "Copy share link"}</button>
        </div>
      </motion.section>
    </motion.div>
  );
}

function CauseCard({ cause, onDonate, onStory, language }: { cause: Cause; onDonate: (cause: Cause) => void; onStory: (cause: Cause) => void; language: "en" | "hi" }) {
  const raisedPct = Math.min(Math.round((cause.raised / cause.goal) * 100), 100);
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.45 }}>
      <Card className="cause-card">
      <div className="cause-image"><Image src={cause.image} alt={`Community supported by ${cause.title}`} fill sizes="(max-width: 740px) 100vw, (max-width: 980px) 50vw, 33vw" unoptimized style={{ objectFit: "cover" }} /><span className="category-tag">{cause.category}</span>{cause.verified && <span className="verified-tag" aria-label="Verified NGO"><BadgeCheck size={18} /></span>}</div>
      <div className="cause-content"><span className="cause-loc"><MapPin size={11} style={{ verticalAlign: "-2px" }} /> {cause.location}</span><h3>{cause.title}</h3><p>{cause.description}</p><ProgressBar value={raisedPct} label={`${raisedPct}% funded`} /><div className="cause-meta"><span><strong>{formatMoney(cause.raised, "USD")}</strong> raised</span><span>Goal {formatMoney(cause.goal, "USD")}</span></div><div className="cause-foot"><span className="days-left">{cause.daysLeft} days left · verified</span><div style={{ display: "flex", gap: 7 }}><Button variant="quiet" className="small-give" onClick={() => onStory(cause)}>{copy[language].viewStory}</Button><Button className="small-give" onClick={() => onDonate(cause)}>{copy[language].donateCause}</Button></div></div></div>
      </Card>
    </motion.div>
  );
}

export default function GivelightApp() {
  const language = usePreferences((state) => state.language);
  const setLanguage = usePreferences((state) => state.setLanguage);
  const dark = usePreferences((state) => state.dark);
  const toggleDark = usePreferences((state) => state.toggleDark);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [storyCause, setStoryCause] = useState<Cause | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const t = copy[language];
  const reduceMotion = useReducedMotion();
  const celebrationEnabled = shouldCelebrateVerifiedDonation("paid", reduceMotion ?? false);
  const queryClient = useQueryClient();
  const visibleCauses = useMemo(() => filter === "All" ? causes : causes.filter((cause) => cause.region === filter || cause.category === filter), [filter]);
  const { data: liveStats } = useQuery({
    queryKey: ["live-stats"],
    queryFn: async () => {
      const response = await fetch("/api/v1/stats/live");
      if (!response.ok) throw new Error("Live demo totals are unavailable.");
      return await response.json() as typeof stats;
    },
    initialData: stats,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!mobileMenu) return;
    const focusTarget = mobileMenuRef.current?.querySelector<HTMLAnchorElement>("a, button");
    focusTarget?.focus();
  }, [mobileMenu]);

  useEffect(() => {
    let cancelled = false;
    const refreshStats = async () => {
      try {
        const response = await fetch("/api/v1/stats/live");
        if (!response.ok || cancelled) return;
        const update = await response.json() as Partial<typeof stats>;
        queryClient.setQueryData<typeof stats>(["live-stats"], (current) => ({ ...stats, ...current, ...update }));
      } catch {
        // Ignore transient refresh failures and let the query interval recover.
      }
    };

    void refreshStats();
    const timer = window.setInterval(() => {
      void refreshStats();
    }, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [queryClient]);

  useEffect(() => {
    if (reduceMotion) return;
    const context = gsap.context(() => {
      gsap.to(".orbit-a", { y: -9, repeat: -1, yoyo: true, duration: 2.4, ease: "sine.inOut" });
      gsap.to(".orbit-b", { y: 8, repeat: -1, yoyo: true, duration: 2.9, ease: "sine.inOut" });
    });
    return () => context.revert();
  }, [reduceMotion]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  const navLinks = [
    { label: t.nav[0], href: "#causes" },
    { label: t.nav[1], href: "#impact" },
    { label: t.nav[2], href: "#community" },
    { label: t.nav[3], href: "#transparency" },
  ];

  return (
    <main className={`site-shell${dark ? " dark-mode" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Givelight home"><span className="brand-mark"><Sparkles size={19} /></span><span>givelight</span></a>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
        <div className="nav-actions">
          <button className="icon-button profile-button" onClick={() => setAuthOpen(true)} aria-label="My profile, sign-in is optional"><UserRound size={16} /></button>
          <button className="language-button" onClick={() => setLanguage(language === "en" ? "hi" : "en")} aria-label={`${t.language}: ${language === "en" ? "English" : "Hindi"}`}><Languages size={14} />{language === "en" ? "EN" : "हि"}<ChevronDown size={12} /></button>
          <button className="icon-button" onClick={toggleDark} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="button button-primary" onClick={() => setSelectedCause(causes[0])}><Heart size={14} />{t.donate}</button>
          <button className="icon-button mobile-menu-button" aria-label="Open navigation menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}><Menu size={17} /></button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.nav ref={mobileMenuRef} className="mobile-nav" aria-label="Mobile navigation" initial={reduceMotion ? false : { opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -12 }} transition={{ duration: MOTION_DURATIONS.screen, ease: MOTION_EASINGS.soft }}>
              {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMobileMenu(false)}>{link.label}<ChevronRight size={15} /></a>)}
              <button type="button" onClick={() => { setMobileMenu(false); setAuthOpen(true); }}>My profile<ChevronRight size={15} /></button>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <section className="hero" id="top">
        <motion.div className="hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: MOTION_DURATIONS.screen, ease: MOTION_EASINGS.soft }}>
          <span className="eyebrow"><i className="eyebrow-dot" />{t.eyebrow}</span>
          <motion.h1 initial={reduceMotion ? false : { opacity: 0, filter: "blur(8px)", y: 20 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: MOTION_DURATIONS.screen + 0.1, ease: MOTION_EASINGS.soft }}>
            {t.h1a}
            <br />
            <em>{t.h1b}</em>
          </motion.h1>
          <p className="hero-subtitle">{t.subtitle}</p>
          <div className="hero-actions"><button className="button button-primary" onClick={() => setSelectedCause(causes[0])}><Sparkles size={16} />{t.cta}<ArrowRight size={15} /></button><a className="text-link" href="#causes">{t.how} <ArrowDownRight size={14} style={{ verticalAlign: "-3px" }} /></a></div>
          <div className="hero-note"><LockKeyhole size={13} />{t.safe}</div>
        </motion.div>
        <motion.div className="hero-art" initial={reduceMotion ? false : { opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: MOTION_DURATIONS.screen + 0.2, delay: .12, ease: MOTION_EASINGS.soft }}>
          <motion.div className="hero-spark" initial={reduceMotion ? false : { opacity: 0, x: -20, y: 22, scale: 0.5 }} animate={{ opacity: 1, x: 34, y: -12, scale: 1 }} transition={{ duration: MOTION_DURATIONS.celebration, ease: MOTION_EASINGS.spring }} />
          <div className="planet-glow" /><div className="planet-wrap"><KindnessPlanet reducedMotion={Boolean(reduceMotion)} /></div><span className="orbit-dot orbit-a" /><span className="orbit-dot orbit-b" />
            <div className="total-card"><span className="total-symbol"><Sparkles size={20} /></span><div><div className="total-label">{t.total}</div><div className="total-value"><LiveCounter value={liveStats.total} /></div></div><div className="total-count">{liveStats.donors.toLocaleString()} {t.contributors}<br />{formatMoney(liveStats.today, "USD")} {t.today}</div></div>
          <div className="hero-label label-one"><span className="label-icon"><Globe2 size={16} /></span><div><strong>28 countries</strong><span>one shared light</span></div></div>
          <div className="hero-label label-two"><span className="label-icon"><Sparkles size={16} /></span><div><strong>One small gift</strong><span>a brighter day</span></div></div>
        </motion.div>
      </section>

      <section className="story-section section section-tint" aria-label="Campaign story chapters">
        <div className="section-heading"><div><span className="eyebrow">{storyBlueprint[language][0].eyebrow}</span><h2>{copy[language].impactTitle}</h2></div><p>{copy[language].impactDescription}</p></div>
        <div className="story-chapters">{storyBlueprint[language].map((chapter, index) => (
          <motion.article key={chapter.title} className="story-chapter" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: MOTION_DURATIONS.screen, delay: index * 0.08, ease: MOTION_EASINGS.soft }}>
            <span className="story-index">{chapter.eyebrow}</span>
            <h3>{chapter.title}</h3>
            <p>{chapter.description}</p>
          </motion.article>
        ))}</div>
      </section>

      <section className="hero-bottom" aria-label="Community giving totals">
        <div className="total-card"><span className="total-symbol"><Sparkles size={20} /></span><div><div className="total-label">{t.total}</div><div className="total-value"><LiveCounter value={liveStats.total} /></div></div><div className="total-count">{liveStats.donors.toLocaleString()}<br />{t.contributors}</div></div>
        <div className="donor-strip"><div className="donor-strip-label">A little light, arriving every minute</div><div className="donor-list">{recentDonations.map((item) => <div className="donor-pill" key={`${item.place}-${item.time}`}><i className="donor-spot" /><div><strong>{item.name}</strong><br /><span>{item.place} · {item.time}</span></div></div>)}</div></div>
      </section>

      <section className="section section-tint" id="causes">
        <div className="section-heading"><div><span className="eyebrow">{t.causesEyebrow}</span><h2>{t.causesTitle}</h2></div><p>{t.causesDescription}<br /><a className="text-link" href="#transparency" style={{ color: "var(--teal)", fontWeight: 800 }}>{t.browse} <ArrowRight size={13} style={{ verticalAlign: "-2px" }} /></a></p></div>
        <div className="filter-row" role="group" aria-label="Filter causes">{filters.map((item) => <button key={item} className="filter-chip" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className="cause-grid">{visibleCauses.length ? visibleCauses.map((cause) => <CauseCard key={cause.slug} cause={cause} onDonate={setSelectedCause} onStory={setStoryCause} language={language} />) : <div style={{ padding: 30, color: "#718478", fontSize: 13 }}>More verified causes are coming soon.</div>}</div>
      </section>

      <section className="section section-dark" id="impact">
        <div className="section-heading"><div><span className="eyebrow" style={{ color: "#9ac8a8" }}>{t.impactEyebrow}</span><h2>{t.impactTitle}</h2></div><p>{t.impactDescription}</p></div>
        <div className="impact-grid"><WorldMap language={language} /><div className="impact-side"><div className="impact-stat-row"><div className="impact-stat"><span>{t.global}</span><strong><LiveCounter value={liveStats.total} /></strong></div><div className="impact-stat"><span>{t.community}</span><strong>{liveStats.donors.toLocaleString()}</strong></div><div className="impact-stat"><span>{t.today}</span><strong><LiveCounter value={liveStats.today} /></strong></div><div className="impact-stat"><span>{t.monthly}</span><strong>{formatMoney(91850, "USD")}</strong></div></div><div className="recent-panel"><div className="recent-title">{t.donors}<span className="live-indicator"><i />{t.live}</span></div>{recentDonations.slice(0, 3).map((item) => <div className="recent-item" key={`${item.place}-${item.time}`}><div className="recent-who"><span className="avatar-dot">{item.name === "Anonymous" ? <Sparkles size={12} /> : item.name[0]}</span><div>{item.name}<span> · {item.place}</span></div></div><strong>{formatMoney(item.amount, "USD")}</strong></div>)}</div></div></div>
      </section>

      <section className="section section-tint" id="community">
        <div className="section-heading"><div><span className="eyebrow"><UsersRound size={13} /> · together, further</span><h2>{t.communityTitle}</h2></div><p>{t.communityDescription}</p></div>
        <div className="bottom-grid"><div><div className="recent-title" style={{ marginBottom: 15 }}>{t.teams}<span style={{ color: "#809085", fontSize: 10 }}>This month <ChevronDown size={12} style={{ verticalAlign: "-2px" }} /></span></div><LeaderboardTable rows={leaderboardDemoData.map((item) => ({ name: item.nickname, detail: item.locationLabel ?? item.displayMode, amount: `${item.verifiedAmount.toLocaleString()} ${item.currency}` }))} /></div>
          <div className="transparency-card" id="transparency"><span className="eyebrow" style={{ color: "#f3c46d" }}><ShieldCheck size={14} /> Givelight promise</span><h3>{t.transparency}</h3><p>Trust should be visible. Every campaign is reviewed with local partners, and every update belongs to the people doing the work.</p><div className="transparency-list"><div className="transparency-line"><Check size={14} />{t.verify}</div><div className="transparency-line"><Check size={14} />{t.audit}</div><div className="transparency-line"><Check size={14} />{t.updates}</div><div className="transparency-line"><Check size={14} />{t.policy}</div></div><a className="button button-gold" href="#causes">How giving works <ArrowRight size={14} /></a></div></div>
      </section>

      <footer className="site-footer"><a className="brand" href="#top" style={{ color: "#edf5e8" }}><span className="brand-mark"><Sparkles size={17} /></span>givelight</a><span>{t.mission}</span><div className="footer-links"><a href="#transparency">Privacy</a><a href="#transparency">Terms</a><a href="#top">Support</a></div></footer>

      <div className="demo-banner" role="status"><CircleDollarSign size={13} />{t.demo}</div>

      <AnimatePresence>{selectedCause && <DonationSheet cause={selectedCause} onClose={() => setSelectedCause(null)} onSuccess={(gift) => { setSelectedCause(null); setDonation(gift); }} />}</AnimatePresence>
      <AnimatePresence>{donation && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className="donation-sheet" role="dialog" aria-modal="true" aria-labelledby="thanks-title" initial={celebrationEnabled ? { y: 28, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }}>
        <div className="success-state"><motion.span className="spark-badge" initial={celebrationEnabled ? { scale: 0.7, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ duration: MOTION_DURATIONS.celebration, ease: MOTION_EASINGS.soft }}><Sparkles size={34} /></motion.span><span className="eyebrow">Your light is on its way</span><h2 id="thanks-title">Thank you for giving.</h2><p>Your demo gift of <strong>{formatMoney(donation.amount, donation.currency)}</strong> is marked paid in this local demo for <strong>{donation.cause.title}</strong>.</p><div className="success-receipt">Donor number <strong>#{String(donation.donorNumber).padStart(5, "0")}</strong><br />Payment status <strong>Demo confirmed · not a real payment</strong></div><div className="success-actions"><button className="button button-primary button-full" onClick={() => setShareOpen(true)}><Sparkles size={15} /> Create a share card</button><button className="button button-quiet button-full" onClick={() => setAuthOpen(true)}>Save your light <ArrowRight size={15} /></button><button className="button button-quiet button-full" onClick={() => setDonation(null)}>Back to Givelight</button></div></div>
      </motion.section></motion.div>}</AnimatePresence>
      <AnimatePresence>{shareOpen && donation && <ShareCard donation={donation} onClose={() => setShareOpen(false)} />}</AnimatePresence>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}><div className="sheet-head"><div><span className="eyebrow">Always your choice</span><h2 id="auth-title">Save your light.</h2></div><button className="sheet-close" onClick={() => setAuthOpen(false)} aria-label="Close sign in"><X size={18} /></button></div><p className="sheet-subtitle">Sign-in is optional. In this demo, account providers are not connected. Your guest gift stays visible here without sharing personal details.</p><button className="button button-primary button-full" onClick={() => notify("Sign-in providers are disabled in demo mode.")}>Continue with Google · demo</button><button className="button button-quiet button-full" style={{ marginTop: 9 }} onClick={() => notify("Guest gifts can be claimed when account sign-in is configured.")}>Claim a guest gift · demo</button></AuthModal>
      <AnimatePresence>{storyCause && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setStoryCause(null)}><motion.section className="donation-sheet" role="dialog" aria-modal="true" aria-labelledby="story-title" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><div className="sheet-head"><div><span className="eyebrow"><BadgeCheck size={13} /> Verified local partner</span><h2 id="story-title">{storyCause.title}</h2></div><button className="sheet-close" onClick={() => setStoryCause(null)} aria-label="Close cause story"><X size={18} /></button></div><Image src={storyCause.image} alt="" width={1000} height={600} unoptimized style={{ width: "100%", height: 190, marginTop: 16, borderRadius: 13, objectFit: "cover" }} /><p className="sheet-subtitle" style={{ marginTop: 16 }}>{storyCause.description} Local partner Bright Steps Nepal shares regular progress updates and tracks how funds are used. Campaign goal: {formatMoney(storyCause.goal, "USD")}. {storyCause.daysLeft} days remain.</p><div className="payment-note"><ShieldCheck size={16} /><span>Campaign partner verification and impact reports are represented with sample demo information.</span></div><button className="button button-primary button-full" onClick={() => { setSelectedCause(storyCause); setStoryCause(null); }}>{t.donateCause}<ArrowRight size={15} /></button></motion.section></motion.div>}</AnimatePresence>
      <Toast message={toast} />
    </main>
  );
}
