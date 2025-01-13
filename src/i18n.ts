import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(initReactI18next)
  .use(LanguageDetector) // Detects the user's language
  .use(HttpApi) // Loads translations from public/locales
  .init({
    supportedLngs: ['pt'], // Add supported languages here
    fallbackLng: 'pt',
    ns: ['common'], // Add 'common' as a namespace
    defaultNS: 'common', // Set 'common' as the default namespace
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
