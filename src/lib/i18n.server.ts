import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { log } from './logger';

const localesPath = path.resolve('./public/locales');

if (!i18next.isInitialized) {
  i18next
    .use(Backend)
    .init({
      lng: 'pt',
      fallbackLng: 'pt',
      preload: ['pt', 'en'],
      ns: ['common'],
      defaultNS: 'common',
      backend: {
        loadPath: `${localesPath}/{{lng}}/{{ns}}.json`,
      },
      debug: process.env.NODE_ENV === 'development',
    })
    .then(() => log.info('✅ i18next server initialized'))
    .catch((err) => log.error('❌ Error initializing server i18next:', err));
}

export default i18next;
