import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr-CA.json';
import frCA from './locales/fr-CA.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    'fr-CA': { translation: frCA },
  },
  lng: typeof window !== 'undefined' ? (localStorage.getItem('i18nextLng') || 'en') : 'en',
  fallbackLng: 'en',
  debug: import.meta.env.DEV,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// expose i18n for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).i18next = i18n;
}

export default i18n;
