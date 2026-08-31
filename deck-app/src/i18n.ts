import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

// Arabic first, and the document direction follows the language: the deck is laid out
// right-to-left and every RTL-aware class in it reads dir from <html>.
i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

const applyDirection = (lang: string) => {
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};
applyDirection(i18n.language);
i18n.on('languageChanged', applyDirection);

export default i18n;
