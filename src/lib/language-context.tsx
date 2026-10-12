"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    nav: {
      causes: "Causes",
      impact: "Live Impact",
      leaderboard: "Leaderboard",
      transparency: "Transparency",
      howItWorks: "How It Works",
      admin: "Admin Dashboard",
      guestLight: "Guest Light",
    },
    hero: {
      eyebrow: "Small gifts. Brighter tomorrows.",
      h1a: "Small gifts.",
      h1b: "Real change.",
      subtitle: "Your giving lights the world. A little kindness travels further than you think. Contribute in a few simple steps — no account needed.",
      cta: "Add Your Light",
      how: "See Live Impact",
      safe: "No account required. No contact details requested. Just kindness.",
    },
    liveFund: {
      eyebrow: "Verified Community Fund",
      title: "Real & Verified Contributions",
      subtitle: "Every penny shown here is verified against actual accounts before appearing in public totals.",
      totalVerified: "Total Verified Fund",
      publicVerified: "Public Contributions",
      founderContribution: "Founder Contribution",
      todayVerified: "Today's Verified Total",
      supportersCount: "Verified Supporters",
      lastUpdated: "Last verified update",
      howVerifiedLink: "How funds are verified & used →",
      transparencyLink: "View Transparency Ledger →",
      disclaimer: "Pending self-confirmed payments are not included in verified totals.",
    },
    qrFlow: {
      modalTitle: "Add Your Light",
      step1: "1. Select Currency & Amount",
      step2: "2. Choose Your Region",
      step3: "3. Scan & Pay",
      confirmTitle: "Payment Confirmation",
      confirmPrompt: "Did you complete the payment of {amount} {currency} to {payee}?",
      yesPaid: "Yes, I Have Paid",
      notYet: "Not Yet",
      truthStatement: "Please confirm only after payment. Contributions are included in verified totals after manual review.",
      pendingTitle: "Thank you for adding your light!",
      pendingSubtitle: "Your payment confirmation is awaiting review.",
      pendingBadge: "Awaiting verification",
      pendingMessage: "Your Light Point is saved on this device. Your contribution amount will join the verified fund after operator review.",
      exploreMap: "Explore Live Impact Map",
    },
    leaderboard: {
      title: "Top Contributors & Top Lights",
      subtitle: "Celebrating real generosity and community engagement.",
      tabContributors: "Top Contributors (Verified Money)",
      tabLights: "Top Lights (Participation Points)",
      infoText: "Rankings are based only on verified public contributions. Founder contributions, pending payments, refunds, and test payments are not included.",
      emptyTitle: "Be the first light on the board.",
      emptySubtitle: "Contribute today and shine on the community leaderboard.",
      rank: "Rank",
      contributor: "Contributor",
      amount: "Verified Amount",
      points: "Light Points",
    },
    lumi: {
      idle: "A small light can go a long way.",
      welcome: "Ready to add your light?",
      qr: "Scan, pay, then confirm your light.",
      confirm: "Did your light reach us?",
      pending: "I'm checking your light.",
      verified: "Your light is verified!",
      founder: "A new founder light was added today.",
      empty: "Be the first light in this journey.",
    },
  },
  hi: {
    nav: {
      causes: "अभियान",
      impact: "लाइव प्रभाव",
      leaderboard: "लीडरबोर्ड",
      transparency: "पारदर्शिता",
      howItWorks: "यह कैसे काम करता है",
      admin: "एडमिन डैशबोर्ड",
      guestLight: "गेस्ट लाइट",
    },
    hero: {
      eyebrow: "छोटे दान। उज्ज्वल कल।",
      h1a: "छोटा योगदान।",
      h1b: "असली बदलाव।",
      subtitle: "आपका छोटा दान, दुनिया रोशन करे। बिना किसी अकाउंट या रजिस्ट्रेशन के, बस कुछ ही पलों में अपना सहयोग दें।",
      cta: "अपनी रोशनी जोड़ें",
      how: "लाइव प्रभाव देखें",
      safe: "कोई अकाउंट नहीं। कोई संपर्क जानकारी नहीं। केवल निस्वार्थ मदद।",
    },
    liveFund: {
      eyebrow: "सत्यापित सामुदायिक कोष",
      title: "वास्तविक और सत्यापित फंड",
      subtitle: "सार्वजनिक कुल में दिखाई देने से पहले यहाँ दिखाई गई हर राशि का वास्तविक खातों से सत्यापन किया जाता है।",
      totalVerified: "कुल सत्यापित फंड",
      publicVerified: "सार्वजनिक योगदान",
      founderContribution: "संस्थापक योगदान",
      todayVerified: "आज का सत्यापित कुल",
      supportersCount: "सत्यापित समर्थक",
      lastUpdated: "अंतिम सत्यापित अपडेट",
      howVerifiedLink: "फंड का सत्यापन और उपयोग कैसे होता है →",
      transparencyLink: "पारदर्शिता लेजर देखें →",
      disclaimer: "पुष्टि की प्रतीक्षा कर रहे भुगतानों को सत्यापित कुल में शामिल नहीं किया जाता है।",
    },
    qrFlow: {
      modalTitle: "अपनी रोशनी जोड़ें",
      step1: "1. मुद्रा और राशि चुनें",
      step2: "2. अपना क्षेत्र चुनें",
      step3: "3. स्कैन करें और भुगतान करें",
      confirmTitle: "भुगतान की पुष्टि",
      confirmPrompt: "क्या आपने {payee} को {amount} {currency} का भुगतान पूरा कर दिया है?",
      yesPaid: "हाँ, मैंने भुगतान कर दिया है",
      notYet: "अभी नहीं",
      truthStatement: "कृपया भुगतान के बाद ही पुष्टि करें। समीक्षा के बाद ही योगदान को कुल में जोड़ा जाता है।",
      pendingTitle: "अपनी रोशनी जोड़ने के लिए धन्यवाद!",
      pendingSubtitle: "आपकी भुगतान पुष्टि समीक्षा के अधीन है।",
      pendingBadge: "सत्यापन का इंतज़ार",
      pendingMessage: "आपका लाइट पॉइंट इस डिवाइस पर सहेजा गया है। समीक्षा के बाद आपकी राशि सत्यापित फंड में जुड़ जाएगी।",
      exploreMap: "लाइव इम्पैक्ट मैप देखें",
    },
    leaderboard: {
      title: "शीर्ष योगदानकर्ता और शीर्ष लाइटें",
      subtitle: "वास्तविक उदारता और सामुदायिक सहभागिता का उत्सव।",
      tabContributors: "शीर्ष योगदानकर्ता (सत्यापित राशि)",
      tabLights: "शीर्ष लाइटें (सहभागिता अंक)",
      infoText: "रैंकिंग केवल सत्यापित सार्वजनिक योगदानों पर आधारित है। संस्थापक योगदान और लंबित भुगतान इसमें शामिल नहीं हैं।",
      emptyTitle: "बोर्ड पर पहली रोशनी बनिए।",
      emptySubtitle: "आज ही योगदान दें और सामुदायिक लीडरबोर्ड पर चमकें।",
      rank: "रैंक",
      contributor: "योगदानकर्ता",
      amount: "सत्यापित राशि",
      points: "लाइट पॉइंट्स",
    },
    lumi: {
      idle: "एक छोटी रोशनी बहुत दूर तक जा सकती है।",
      welcome: "क्या आप अपनी रोशनी जोड़ने के लिए तैयार हैं?",
      qr: "स्कैन करें, भुगतान करें, फिर अपनी रोशनी कन्फर्म करें।",
      confirm: "क्या आपकी रोशनी हम तक पहुँच गई?",
      pending: "मैं आपकी रोशनी चेक कर रहा हूँ।",
      verified: "आपकी रोशनी सत्यापित हो गई है!",
      founder: "आज एक नई संस्थापक रोशनी जोड़ी गई।",
      empty: "इस सफ़र की पहली रोशनी बनिए।",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('givelight_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('givelight_lang', lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}