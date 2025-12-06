/* eslint-disable @typescript-eslint/no-unused-vars */


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import srCommon from './locales/sr/common.json';
import srAuth from './locales/sr/auth.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
  },
  sr: {
    common: srCommon,
    auth: srAuth,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'sr'],
      debug: process.env.NODE_ENV === 'development',
      ns: ['common', 'auth'],
      defaultNS: 'common',
      resources,
      backend: false, // onemogući backend loader i na klijentu
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
