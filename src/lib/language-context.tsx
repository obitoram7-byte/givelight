"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

export const translations = {
  en: {
    nav: {
      home: "Home",
      liveFund: "Live Fund",
      leaderboard: "Leaderboard",
      howItWorks: "How It Works",
      transparency: "Transparency",
      futurePlans: "Future Plans",
      profile: "Profile",
      admin: "Admin Dashboard",
      guestLight: "Guest Light",
    },
    hero: {
      eyebrow: "Small gifts. Real curiosity.",
      h1a: "Small gifts.",
      h1b: "Real curiosity.",
      subtitle: "Can a community still come together, one small light at a time?",
      cta: "Add Your Light",
      secondary: "See Live Fund",
      safe: "No account needed. No forced login. Add your light in a few simple steps.",
    },
    liveFund: {
      eyebrow: "Personal public experiment",
      title: "Total Verified Fund",
      subtitle: "A small public experiment in generosity. Add a light, watch the fund grow, and see what a community can do together.",
      totalVerified: "Total Verified Fund",
      publicVerified: "Public Verified Contributions",
      founderContribution: "Founder Contribution",
      todayVerified: "Today’s Verified Public Contributions",
      supportersCount: "Verified Supporters",
      lastUpdated: "Last verified update",
      disclaimer: "Verified fund totals update only after manual review.",
    },
    qrFlow: {
      modalTitle: "Add Your Light",
      regionLabel: "Region",
      amountLabel: "Contribution amount",
      confirmTitle: "Did you complete the payment of {amount} {currency} to {payee}?",
      yesPaid: "Yes, I Have Paid",
      notYet: "Not Yet",
      truthStatement: "Please confirm only after payment. Fund totals and leaderboard rankings update after manual verification.",
      pendingTitle: "Thanks for adding your light.",
      pendingSubtitle: "Your confirmation is awaiting review.",
      pendingBadge: "Awaiting review",
      pendingMessage: "Verified fund totals update only after review.",
    },
    leaderboard: {
      title: "Leaderboards",
      subtitle: "Top 3 actual verified contributors only.",
      emptyTitle: "Be the first light in this experiment.",
      emptySubtitle: "When there are verified contributions, they will appear here.",
      rank: "Rank",
      contributor: "Contributor",
      amount: "Verified Amount",
      points: "Light Points",
    },
    lumi: {
      idle: "A small light can go a long way.",
      empty: "Be the first light in this experiment.",
      qr: "Scan, pay, then confirm your light.",
      confirm: "Did your light reach us?",
      pending: "I’m checking your light.",
      verified: "Your light is verified!",
      founder: "A founder light was added today.",
    },
    layout: {
      language: "Language",
      home: "Home",
      donate: "Add Your Light",
      profile: "Profile",
    },
    sections: {
      whyTitle: "Why this exists",
      whyDescription: "Givelight is a simple experiment: when the amount is small, can many small acts of support become something meaningful?",
      howTitle: "How it works",
      futureTitle: "Future Plans",
      futureEmpty: "Future giveaway or community plans will be shared here when announced.",
      transparencyTitle: "Transparency",
      transparencyCopy: "This is a personal public experiment run by the Givelight owner. Contributions shown in the verified fund are manually reviewed before appearing publicly. Future giveaway or activity plans will be announced clearly before they begin.",
      leaderPreviewEmpty: "No verified contributions yet. The first light will appear here.",
      emptyLanternTitle: "Be the first light in this experiment.",
      emptyLanternSubtitle: "No public contribution has been verified yet.",
    },
  },
  hi: {
    nav: {
      home: "होम",
      liveFund: "लाइव फंड",
      leaderboard: "लीडरबोर्ड",
      howItWorks: "यह कैसे काम करता है",
      transparency: "पारदर्शिता",
      futurePlans: "भविष्य की योजनाएँ",
      profile: "प्रोफ़ाइल",
      admin: "एडमिन डैशबोर्ड",
      guestLight: "गेस्ट लाइट",
    },
    hero: {
      eyebrow: "छोटी राशियाँ। असली जिज्ञासा।",
      h1a: "छोटी राशियाँ।",
      h1b: "असली जिज्ञासा।",
      subtitle: "क्या community अभी भी एक-एक छोटी रोशनी से साथ आ सकती है?",
      cta: "अपनी रौशनी जोड़ें",
      secondary: "लाइव फंड देखें",
      safe: "कोई account जरूरी नहीं। कोई forced login नहीं। कुछ सरल कदमों में अपनी रोशनी जोड़ें।",
    },
    liveFund: {
      eyebrow: "व्यक्तिगत public experiment",
      title: "कुल सत्यापित फंड",
      subtitle: "दयालुता का एक छोटा public experiment. अपनी light जोड़ें, fund को बढ़ते देखें, और देखें community मिलकर क्या कर सकती है।",
      totalVerified: "कुल सत्यापित फंड",
      publicVerified: "सार्वजनिक सत्यापित योगदान",
      founderContribution: "संस्थापक योगदान",
      todayVerified: "आज के सत्यापित सार्वजनिक योगदान",
      supportersCount: "सत्यापित समर्थक",
      lastUpdated: "अंतिम सत्यापित अपडेट",
      disclaimer: "सत्यापित फंड totals केवल manual review के बाद अपडेट होते हैं।",
    },
    qrFlow: {
      modalTitle: "अपनी रोशनी जोड़ें",
      regionLabel: "क्षेत्र",
      amountLabel: "योगदान राशि",
      confirmTitle: "क्या आपने {amount} {currency} का भुगतान {payee} को पूरा किया?",
      yesPaid: "हाँ, मैंने भुगतान कर दिया है",
      notYet: "अभी नहीं",
      truthStatement: "कृपया payment के बाद ही confirm करें. Fund totals और leaderboard rankings manual verification के बाद अपडेट होते हैं.",
      pendingTitle: "अपनी रोशनी जोड़ने के लिए धन्यवाद।",
      pendingSubtitle: "आपकी पुष्टि समीक्षा के लिए लंबित है।",
      pendingBadge: "समीक्षा लंबित",
      pendingMessage: "सत्यापित fund totals केवल review के बाद अपडेट होते हैं।",
    },
    leaderboard: {
      title: "लीडरबोर्ड",
      subtitle: "केवल top 3 सत्यापित योगदानकर्ता।",
      emptyTitle: "इस experiment की पहली रोशनी बनें।",
      emptySubtitle: "सत्यापित contribution होने पर यह यहाँ दिखाई देगा।",
      rank: "रैंक",
      contributor: "योगदानकर्ता",
      amount: "सत्यापित राशि",
      points: "लाइट पॉइंट्स",
    },
    lumi: {
      idle: "एक छोटी रोशनी बहुत दूर तक जा सकती है।",
      empty: "इस experiment की पहली रोशनी बनें।",
      qr: "Scan करें, payment करें, फिर अपनी रोशनी confirm करें।",
      confirm: "क्या आपकी रोशनी हम तक पहुँच गई?",
      pending: "मैं आपकी रोशनी देख रहा हूँ।",
      verified: "आपकी रोशनी सत्यापित हो गई!",
      founder: "आज एक संस्थापक रोशनी जुड़ी।",
    },
    layout: {
      language: "भाषा",
      home: "होम",
      donate: "अपनी रोशनी जोड़ें",
      profile: "प्रोफ़ाइल",
    },
    sections: {
      whyTitle: "यह क्यों है",
      whyDescription: "Givelight एक साधारण experiment है: अगर राशि छोटी है, तो क्या कई छोटी मददें कुछ meaningful बन सकती हैं?",
      howTitle: "यह कैसे काम करता है",
      futureTitle: "भविष्य की योजनाएँ",
      futureEmpty: "Future giveaway या community plans यहाँ announced होने पर साझा किए जाएंगे।",
      transparencyTitle: "पारदर्शिता",
      transparencyCopy: "यह Givelight owner द्वारा चलाया गया personal public experiment है. Verified fund में दिखने वाले contributions public होने से पहले manually review किए जाते हैं. Future giveaway या activity plans शुरू होने से पहले clearly announce किए जाएंगे.",
      leaderPreviewEmpty: "अभी कोई सत्यापित contribution नहीं है. पहली रोशनी यहाँ दिखाई देगी.",
      emptyLanternTitle: "इस experiment की पहली रोशनी बनें।",
      emptyLanternSubtitle: "अभी कोई public contribution verified नहीं हुआ है।",
    },
  },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)[Language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("givelight_lang") as Language | null;
    if (saved === "en" || saved === "hi") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("givelight_lang", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}