import { useLangStore, Language } from './langStore';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import ta from '../locales/ta.json';

const locales: Record<Language, any> = { en, hi, te, ta };

export const useTranslation = () => {
  const { language } = useLangStore();
  
  const t = (path: string) => {
    const keys = path.split('.');
    let result = locales[language];
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path; // Fallback to path string
      }
    }
    
    return result;
  };

  return { t, language };
};
