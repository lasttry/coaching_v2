'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { log } from './logger';

import pt from '../../public/locales/pt/common.json';
import en from '../../public/locales/en/common.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const setCookie = (name: string, value: string, days: number = 365): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const getInitialLanguage = (): 'pt' | 'en' => {
  if (typeof window === 'undefined') return 'pt';

  const cookieLng = getCookie('i18next');
  if (cookieLng === 'pt' || cookieLng === 'en') return cookieLng;

  const stored = localStorage.getItem('lng');
  if (stored === 'pt' || stored === 'en') {
    setCookie('i18next', stored);
    return stored;
  }

  return 'pt';
};

// Initialize with PT as default to match server rendering
if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources,
    lng: 'pt', // Always start with PT to match server
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense to avoid hydration issues
    },
    debug: false,
  });

  log.info('✅ i18next initialized');
}

// After hydration, switch to user's preferred language if different
if (typeof window !== 'undefined') {
  const preferredLng = getInitialLanguage();
  if (i18next.language !== preferredLng) {
    // Use setTimeout to avoid hydration issues
    setTimeout(() => {
      void i18next.changeLanguage(preferredLng);
    }, 0);
  }
}

// Sync language changes to cookie
i18next.on('languageChanged', (lng) => {
  setCookie('i18next', lng);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lng', lng);
  }
});

export default i18next;
