"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Globe2,
  Heart,
  Languages,
  LockKeyhole,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { futurePlans, leaderboardDemoData, paymentMethods, publicStats } from "@/lib/demo-data";
import { usePreferences } from "@/lib/preferences";
import { AuthModal, Button, LeaderboardTable, Toast } from "@/components/ui";

type Currency = "USD" | "NPR" | "INR";

const formatMoney = (amount: number, currency: Currency) => {
  const locale = currency === "NPR" ? "ne-NP" : currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

function LiveCounter({ value, currency = "USD" }: { value: number; currency?: Currency }) {
  const [shown, setShown] = useState(value);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setShown(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 700;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setShown(value);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, value]);

  return <span aria-live="polite" aria-atomic="true">{formatMoney(shown, currency)}</span>;
}

export default function GivelightApp() {
  const language = usePreferences((state) => state.language);
  const setLanguage = usePreferences((state) => state.setLanguage);
  const dark = usePreferences((state) => state.dark);
  const toggleDark = usePreferences((state) => state.toggleDark);
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState(5);
  const [selectedMethodId, setSelectedMethodId] = useState(paymentMethods[0]?.id ?? "");
  const [customAmount, setCustomAmount] = useState("");

  const t = useMemo(() => {
    const messages = {
      en: {
        nav: ["Home", "Live Fund", "Leaderboard", "How It Works", "Transparency", "Future Plans"],
        eyebrow: "Small gifts. Real curiosity.",
        h1a: "Small gifts.",
        h1b: "Real curiosity.",
        subtitle: "This is a personal public experiment in generosity — transparent, small, and real.",
        cta: "Add your light",
        secondary: "See the live fund",
        note: "No forced login or fake charity claims. The fund stays at zero until a real contribution is verified.",
        total: "Total verified fund",
        supporters: "Verified supporters",
        founder: "Founder contribution",
        today: "Today's verified public contributions",
        emptyTitle: "Be the first light in this experiment.",
        emptySubtitle: "The public fund stays empty until a real payment is confirmed and manually reviewed.",
        stepsTitle: "How the experiment works",
        step1: "Pick an amount and currency.",
        step2: "Use the payment details once they are configured by the owner.",
        step3: "A secure confirmation flow will be enabled before contributions are accepted.",
        transparencyTitle: "Transparency is the product.",
        transparencyBody: "Everything public is manually reviewed. Future plans are announced only when they are ready, and no fake benefit claims are made.",
        leaderboardTitle: "Leaderboards",
        leaderboardEmpty: "No verified contributions yet. The first light will appear here.",
        futureTitle: "Future plans",
        futureEmpty: "Future plans will be shared here when the owner is ready to announce them.",
        paymentUnavailable: "Contributions are not being accepted yet.",
        paymentUnavailableBody: "Payment details and secure contribution review are not configured. This preview will not take payment or submit a contribution.",
        confirmQuestion: "Payment setup",
        addLight: "Add your light",
        lightButton: "Contributions unavailable",
        notYet: "Not yet",
      },
      hi: {
        nav: ["होम", "लाइव फंड", "लीडरबोर्ड", "यह कैसे काम करता है", "पारदर्शिता", "भविष्य की योजनाएँ"],
        eyebrow: "छोटी राशियाँ। असली जिज्ञासा।",
        h1a: "छोटी राशियाँ।",
        h1b: "असली जिज्ञासा।",
        subtitle: "यह generosity का एक personal public experiment है — स्पष्ट, छोटा, और असली।",
        cta: "अपनी रोशनी जोड़ें",
        secondary: "लाइव फंड देखें",
        note: "कोई forced login या fake charity claim नहीं। असली contribution verify होने तक fund शून्य रहेगा।",
        total: "कुल सत्यापित फंड",
        supporters: "सत्यापित समर्थक",
        founder: "संस्थापक योगदान",
        today: "आज के सत्यापित सार्वजनिक योगदान",
        emptyTitle: "इस experiment की पहली रोशनी बनें।",
        emptySubtitle: "public fund तब तक खाली रहेगा जब तक असली payment confirm और manually review नहीं होता।",
        stepsTitle: "यह experiment कैसे काम करता है",
        step1: "राशि और currency चुनें।",
        step2: "Owner द्वारा payment details configure होने के बाद ही भुगतान करें।",
        step3: "Contribution स्वीकार करने से पहले secure confirmation flow चालू होगा।",
        transparencyTitle: "पारदर्शिता ही product है।",
        transparencyBody: "सभी public data manual review के बाद ही दिखते हैं। Future plans केवल तभी announce किए जाते हैं जब owner तैयार हो, और fake benefit claims नहीं किए जाते।",
        leaderboardTitle: "लीडरबोर्ड",
        leaderboardEmpty: "अभी कोई सत्यापित contribution नहीं है। पहली रोशनी यहाँ दिखाई देगी।",
        futureTitle: "भविष्य की योजनाएँ",
        futureEmpty: "Future plans यहाँ तब साझा किए जाएंगे जब owner उन्हें announce करेगा।",
        paymentUnavailable: "अभी contributions स्वीकार नहीं किए जा रहे हैं।",
        paymentUnavailableBody: "Payment details और secure contribution review configure नहीं हैं। यह preview payment नहीं लेगा और contribution submit नहीं करेगा।",
        confirmQuestion: "Payment setup",
        addLight: "अपनी रोशनी जोड़ें",
        lightButton: "Contributions उपलब्ध नहीं हैं",
        notYet: "अभी नहीं",
      },
    } as const;
    return messages[language];
  }, [language]);

  const leaderboardRows = useMemo(() => {
    if (leaderboardDemoData.length === 0) return [];
    return leaderboardDemoData.slice(0, 3).map((entry) => ({
      name: entry.nickname,
      detail: entry.locationLabel ?? entry.displayMode,
      amount: `${entry.verifiedAmount.toLocaleString()} ${entry.currency}`,
    }));
  }, []);

  const methodOptions = useMemo(() => paymentMethods.filter((item) => item.active), []);
  const selectedMethod = methodOptions.find((item) => item.id === selectedMethodId && item.currency === selectedCurrency)
    ?? methodOptions.find((item) => item.currency === selectedCurrency);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const navLinks = [
    { href: "#top", label: t.nav[0] },
    { href: "#fund", label: t.nav[1] },
    { href: "#leaderboard", label: t.nav[2] },
    { href: "#steps", label: t.nav[3] },
    { href: "#transparency", label: t.nav[4] },
    { href: "#future", label: t.nav[5] },
  ];

  return (
    <main className={`site-shell${dark ? " dark-mode" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Givelight home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>givelight</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>{link.label}</a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-button" onClick={() => setAuthOpen(true)} aria-label="Open profile">
            <UserRound size={16} />
          </button>
          <button
            className="language-button"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            aria-label="Switch language"
          >
            <Languages size={14} /> {language === "en" ? "EN" : "हि"}
            <ChevronDown size={12} />
          </button>
          <button className="icon-button" onClick={toggleDark} aria-label="Toggle color theme">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Button onClick={() => setSheetOpen(true)}>
            <Heart size={14} /> {t.cta}
          </Button>
          <button className="icon-button mobile-menu-button" aria-label="Open mobile menu" onClick={() => setMobileOpen((value) => !value)}>
            <Menu size={17} />
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="mobile-nav"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {navLinks.map((link) => (
                <a href={link.href} key={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                  <ChevronRight size={15} />
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <section className="hero" id="top">
        <motion.div
          className="hero-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="eyebrow"><i className="eyebrow-dot" /> {t.eyebrow}</span>
          <h1>
            {t.h1a}
            <br />
            <em>{t.h1b}</em>
          </h1>
          <p className="hero-subtitle">{t.subtitle}</p>
          <div className="hero-actions">
            <Button onClick={() => setSheetOpen(true)}>
              <Sparkles size={16} /> {t.cta} <ArrowRight size={15} />
            </Button>
            <a className="text-link" href="#fund">{t.secondary} <ArrowRight size={14} /></a>
          </div>
          <div className="hero-note"><LockKeyhole size={13} /> {t.note}</div>
        </motion.div>

        <motion.div
          className="hero-art"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="planet-glow" />
          <div className="planet-wrap">
            <div className="sample-planet" aria-hidden="true">
              <Sparkles size={42} />
            </div>
          </div>
          <span className="orbit-dot orbit-a" />
          <span className="orbit-dot orbit-b" />

          <div className="total-card compact">
            <span className="total-symbol"><Sparkles size={20} /></span>
            <div>
              <div className="total-label">{t.total}</div>
              <div className="total-value"><LiveCounter value={publicStats.totalVerifiedFund || 0} /></div>
            </div>
            <div className="total-count">
              {publicStats.verifiedSupporters || 0} {t.supporters}
              <br />
              {formatMoney(publicStats.founderContribution || 0, "USD")} {t.founder}
            </div>
          </div>

          <div className="hero-label label-one">
            <span className="label-icon"><Globe2 size={16} /></span>
            <div>
              <strong>Transparent</strong>
              <span>one live fund</span>
            </div>
          </div>
          <div className="hero-label label-two">
            <span className="label-icon"><Sparkles size={16} /></span>
            <div>
              <strong>Small acts</strong>
              <span>big curiosity</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="section section-tint" id="fund">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Live fund</span>
            <h2>{t.total}</h2>
          </div>
          <p>{t.emptySubtitle}</p>
        </div>

        <div className="fund-grid">
          <div className="stat-box">
            <span>{t.total}</span>
            <strong><LiveCounter value={publicStats.totalVerifiedFund || 0} /></strong>
          </div>
          <div className="stat-box">
            <span>{t.supporters}</span>
            <strong>{publicStats.verifiedSupporters || 0}</strong>
          </div>
          <div className="stat-box">
            <span>{t.founder}</span>
            <strong>{formatMoney(publicStats.founderContribution || 0, "USD")}</strong>
          </div>
          <div className="stat-box">
            <span>{t.today}</span>
            <strong>{formatMoney(publicStats.todayVerifiedPublicContributions || 0, "USD")}</strong>
          </div>
        </div>
      </section>

      <section className="section" id="steps">
        <div className="section-heading">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>{t.stepsTitle}</h2>
          </div>
        </div>

        <div className="step-grid">
          <article className="step-card">
            <span>01</span>
            <h3>{t.step1}</h3>
            <p>Choose an amount and currency to prepare for a future contribution.</p>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>{t.step2}</h3>
            <p>Payment destinations are not configured yet. This preview cannot accept a transfer.</p>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>{t.step3}</h3>
            <p>Secure contribution intake and manual review must be enabled before verified payments can appear here.</p>
          </article>
        </div>
      </section>

      <section className="section section-tint" id="leaderboard">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Community</span>
            <h2>{t.leaderboardTitle}</h2>
          </div>
          <p>{t.transparencyBody}</p>
        </div>

        {leaderboardRows.length > 0 ? (
          <LeaderboardTable rows={leaderboardRows} />
        ) : (
          <div className="empty-panel">
            <Sparkles size={18} />
            <strong>{t.emptyTitle}</strong>
            <p>{t.leaderboardEmpty}</p>
          </div>
        )}
      </section>

      <section className="section section-tint" id="future">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Future</span>
            <h2>{t.futureTitle}</h2>
          </div>
        </div>

        {futurePlans.length > 0 ? (
          <div className="future-grid">
            {futurePlans.map((item) => (
              <article key={item.id} className="future-card">
                <span className="future-badge">{item.status}</span>
                <h3>{item.title.en}</h3>
                <p>{item.description[language]}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <ShieldCheck size={18} />
            <strong>{t.futureTitle}</strong>
            <p>{t.futureEmpty}</p>
          </div>
        )}
      </section>

      <section className="section section-dark" id="transparency">
        <div className="section-heading">
          <div>
            <span className="eyebrow" style={{ color: "#9ddfb0" }}>Transparency</span>
            <h2>{t.transparencyTitle}</h2>
          </div>
          <p>{t.transparencyBody}</p>
        </div>

        <div className="transparency-box">
          <div className="transparency-line"><Check size={14} /> Verified totals update only after manual review.</div>
          <div className="transparency-line"><Check size={14} /> No fake NGO, campaign, or &quot;guaranteed outcome&quot; claims are shown.</div>
          <div className="transparency-line"><Check size={14} /> Public funding stays honest, minimal, and transparent.</div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top" aria-label="Givelight home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>givelight</span>
        </a>
        <span>Small gifts. Real curiosity.</span>
        <div className="footer-links">
          <a href="#transparency">Transparency</a>
          <a href="#future">Plans</a>
          <a href="#top">Top</a>
        </div>
      </footer>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setSheetOpen(false)}>
            <motion.section
              className="donation-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={t.addLight}
              initial={reduceMotion ? false : { y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
            >
              <div className="sheet-head">
                <div>
                  <span className="eyebrow">{t.addLight}</span>
                  <h2>{t.confirmQuestion}</h2>
                </div>
                <button className="sheet-close" onClick={() => setSheetOpen(false)} aria-label="Close light form">
                  <X size={18} />
                </button>
              </div>

              <div className="field-wrap">
                <label className="field-label">Amount</label>
                <div className="amount-grid">
                  {[1, 2, 5, 10].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="amount-chip"
                      aria-pressed={Number(customAmount || amount) === value}
                      onClick={() => {
                        setCustomAmount("");
                        setAmount(value);
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <input
                  className="custom-amount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                />
              </div>

              <div className="field-wrap">
                <label className="field-label">Currency</label>
                <div className="currency-row" role="group" aria-label="Choose currency">
                  {(["NPR", "INR", "USD"] as Currency[]).map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      className="currency-choice"
                      aria-pressed={selectedCurrency === currency}
                      onClick={() => setSelectedCurrency(currency)}
                    >
                      {currency}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-wrap">
                <label className="field-label">Payment method</label>
                <div className="currency-row" role="group" aria-label="Choose payment method">
                  {methodOptions.filter((method) => method.currency === selectedCurrency).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className="currency-choice"
                      aria-pressed={selectedMethod?.id === method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                    >
                      {method.provider}
                    </button>
                  ))}
                </div>
                {selectedMethod && (
                  <div className="payment-note">
                    <ShieldCheck size={16} />
                    <span>
                      {t.paymentUnavailableBody} {selectedMethod.identifier}
                    </span>
                  </div>
                )}
              </div>

              <div className="field-wrap">
                <label className="field-label">Instructions</label>
                {selectedMethod && (
                  <p className="sheet-subtitle">{selectedMethod.instructions[language]}</p>
                )}
              </div>

              <div className="payment-unavailable" role="status">
                <strong>{t.paymentUnavailable}</strong>
                <span>{t.paymentUnavailableBody}</span>
              </div>
              <Button className="button-primary button-full" disabled>
                {t.lightButton}
              </Button>
              <button className="button button-quiet button-full" type="button" onClick={() => setSheetOpen(false)}>
                {t.notYet}
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}>
        <div className="sheet-head">
          <div>
            <span className="eyebrow">Owner access</span>
            <h2>Admin dashboard</h2>
          </div>
          <button className="sheet-close" onClick={() => setAuthOpen(false)} aria-label="Close admin form">
            <X size={18} />
          </button>
        </div>
        <p className="sheet-subtitle">Admin access is protected by Firebase custom claims. Client-side roles are not trusted.</p>
        <Button className="button-primary button-full" onClick={() => setToast("Firebase admin flow is not enabled in the demo client.")}>
          Continue with Google
        </Button>
      </AuthModal>

      <Toast message={toast} />
    </main>
  );
}
