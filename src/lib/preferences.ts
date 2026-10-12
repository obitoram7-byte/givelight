import { create } from "zustand";

type Language = "en" | "hi";

type PreferencesState = {
  language: Language;
  dark: boolean;
  setLanguage: (language: Language) => void;
  toggleDark: () => void;
};

export const usePreferences = create<PreferencesState>((set) => ({
  language: "en",
  dark: false,
  setLanguage: (language) => set({ language }),
  toggleDark: () => set((state) => ({ dark: !state.dark })),
}));
