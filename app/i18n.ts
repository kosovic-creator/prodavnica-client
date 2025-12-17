import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: 'sr',
    fallbackLng: 'sr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;