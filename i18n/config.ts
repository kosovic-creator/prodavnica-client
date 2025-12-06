/* eslint-disable @typescript-eslint/no-unused-vars */

import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const isServer = typeof window === 'undefined';

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'sr'],
      debug: process.env.NODE_ENV === 'development',
      ns: ['common', 'auth'],
      defaultNS: 'common',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
        lookupQuerystring: 'lang',
        caches: ['cookie'],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
