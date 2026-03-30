import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'hi' | 'te' | 'ta';

interface LangState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'edubridge-lang',
    }
  )
);
