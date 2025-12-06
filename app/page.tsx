import i18next from 'i18next';
import en from '../public/locales/en/common.json';
import sr from '../public/locales/sr/common.json';

const resources = {
  en: { common: en },
  sr: { common: sr }
};

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const params = await searchParams;
  let lng = 'en';
  if (params?.lang === 'sr' || params?.lang === 'en') {
    lng = params.lang;
  }

  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng,
    fallbackLng: 'en',
    resources,
  });

  return (
    <>
      <main>
        <h1>{i18nInstance.t('common:welcome')}</h1>
        <p>{i18nInstance.t('common:info')}</p>
      </main>
    </>
  );
}

