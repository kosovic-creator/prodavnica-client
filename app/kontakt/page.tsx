/* eslint-disable @typescript-eslint/no-explicit-any */

import i18next from 'i18next';
import en from '../../i18n/locales/en/kontakt.json';
import sr from '../../i18n/locales/sr/kontakt.json';

const resources = {
  en: { kontakt: en },
  sr: { kontakt: sr }
};

export default async function KontaktPage(props: any) {
  // Next.js App Router: searchParams dolazi iz props.searchParams
  const searchParams =await props.searchParams || {};
  const lng = searchParams.lang === 'en' ? 'en' : 'sr';
  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng,
    fallbackLng: 'sr',
    resources,
    ns: ['kontakt'],
    defaultNS: 'kontakt',
  });

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">{i18nInstance.t('tekst')}</h1>
      {/* Ovdje ide kontakt forma */}
    </div>
  );
}