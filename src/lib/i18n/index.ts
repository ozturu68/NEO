import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';

export const defaultNS = 'translation';
export const resources = {
  tr: { translation: tr },
  en: { translation: en },
} as const;

i18next
  .use(initReactI18next)
  .init({
    lng: 'tr',
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false,
    },
    debug: process.env.NODE_ENV === 'development',
  });

export default i18next;