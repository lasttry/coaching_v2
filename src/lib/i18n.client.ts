'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { log } from './logger';

// Importa os recursos de tradução diretamente
import pt from '../../public/locales/pt/common.json';
import en from '../../public/locales/en/common.json';

// ⚙️ Configuração principal
const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

// Evita inicializar mais de uma vez
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: 'pt', // idioma padrão
      fallbackLng: 'pt',
      interpolation: {
        escapeValue: false, // o React já faz escaping
      },
      debug: process.env.NODE_ENV === 'development',
    })
    .then(() => {
      log.info('✅ i18next initialized');
    })
    .catch((err) => {
      log.error('❌ Error initializing i18next:', err);
    });
}

export default i18next;
