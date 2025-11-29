
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations - organizovano po jezicima i funkcionalnostima
import common_en from './locales/en/common.json';
import common_sr from './locales/sr/common.json';
import auth_en from './locales/en/auth.json';
import auth_sr from './locales/sr/auth.json';
import home_en from './locales/en/home.json';
import home_sr from './locales/sr/home.json';
import navbar_en from './locales/en/navbar.json';
import navbar_sr from './locales/sr/navbar.json';
import sidebar_en from './locales/en/sidebar.json';
import sidebar_sr from './locales/sr/sidebar.json';
import proizvodi_en from './locales/en/proizvodi.json';
import proizvodi_sr from './locales/sr/proizvodi.json';
import korisnici_en from './locales/en/korisnici.json';
import korisnici_sr from './locales/sr/korisnici.json';
import korpa_en from './locales/en/korpa.json';
import korpa_sr from './locales/sr/korpa.json';
import profil_en from './locales/en/profil.json';
import profil_sr from './locales/sr/profil.json';
import porudzbine_en from './locales/en/porudzbine.json';
import porudzbine_sr from './locales/sr/porudzbine.json';
import notFound_en from './locales/en/notFound.json';
import notFound_sr from './locales/sr/notFound.json';
import placanje_en from './locales/en/placanje.json';
import placanje_sr from './locales/sr/placanje.json';
import moje_porudzbine_en from './locales/en/moje_porudzbine.json';
import moje_porudzbine_sr from './locales/sr/moje_porudzbine.json';
import podaci_preuzimanja_en from './locales/en/podaci-preuzimanja.json';
import podaci_preuzimanja_sr from './locales/sr/podaci-preuzimanja.json';
import uspjesno_placanje_en from './locales/en/uspjesno_placanje.json';
import uspjesno_placanje_sr from './locales/sr/uspjesno_placanje.json';
import omiljeni_page_en from './locales/en/omiljeni-page.json';
import omiljeni_page_sr from './locales/sr/omiljeni-page.json';

// Jednostavna konfiguracija i18next-a
i18n
  .use(initReactI18next)
  .init({
    // Svi prevodi organizovani po jezicima
    resources: {
      en: {
        common: common_en,
        auth: auth_en,
        home: home_en,
        navbar: navbar_en,
        sidebar: sidebar_en,
        proizvodi: proizvodi_en,
        korisnici: korisnici_en,
        korpa: korpa_en,
        profil: profil_en,
        porudzbine: porudzbine_en,
        notFound: notFound_en,
        placanje: placanje_en,
        moje_porudzbine: moje_porudzbine_en,
        podaci_preuzimanja: podaci_preuzimanja_en,
        omiljeni_page: omiljeni_page_en,
        uspjesno_placanje: uspjesno_placanje_en,
      },
      sr: {
        common: common_sr,
        auth: auth_sr,
        home: home_sr,
        navbar: navbar_sr,
        sidebar: sidebar_sr,
        proizvodi: proizvodi_sr,
        korisnici: korisnici_sr,
        korpa: korpa_sr,
        profil: profil_sr,
        porudzbine: porudzbine_sr,
        notFound: notFound_sr,
        placanje: placanje_sr,
        moje_porudzbine: moje_porudzbine_sr,
        podaci_preuzimanja: podaci_preuzimanja_sr,
        omiljeni_page: omiljeni_page_sr,
        uspjesno_placanje: uspjesno_placanje_sr,
      }
    },

    // Srpski je glavni jezik
    lng: 'sr',
    fallbackLng: 'sr',

    // Glavni namespace za opšte prevode
    defaultNS: 'common',

    interpolation: {
      escapeValue: false // React već čuva od XSS napada
    }
  });

export default i18n;
