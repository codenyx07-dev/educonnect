"use client";

import { useLangStore, Language } from "@/store/langStore";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLangStore();

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
        <Globe className="w-4 h-4 text-primary-500" />
        <span>{langs.find(l => l.code === language)?.label}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        {langs.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors ${language === lang.code ? 'text-primary-600 bg-primary-50/50 dark:bg-primary-900/10' : 'text-slate-600 dark:text-slate-400'}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
