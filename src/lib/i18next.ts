import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { LanguageDetector } from 'i18next-http-middleware';
import { log } from './logger';

i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    // Define language fallback (must be a string or an array of strings)
    fallbackLng: 'pt',
    preload: ['pt', 'en'], // Preload supported languages (string[])
    ns: ['common'], // Namespaces used
    defaultNS: 'common', // Default namespace
    backend: {
      loadPath: './public/locales/{{lng}}/{{ns}}.json', // Path for JSON translation files
    },
    detection: {
      order: ['header'], // Detect language based on headers
      caches: [], // Disable caching (can be enabled if needed)
    },
    debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
  })
  .then(() => {
  })
  .catch((error) => {
    log.error('Error initializing i18next:', error);
  });

export default i18next;
