
import sr from '@/i18n/locales/sr/uspjesno_placanje.json';
import en from '@/i18n/locales/en/uspjesno_placanje.json';

export default async function UspjesnoPlacanjePage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const t = lang === 'en' ? en : sr;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center mx-auto mb-4">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-green-700 mb-2 tracking-tight">{t.naslov}</h1>
          <p className="text-base text-gray-700 mb-4">{t.poruka}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {t.povratak}
          </a>
          <a
            href="/moje-porudzbine"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
          >
            {lang === 'en' ? 'My orders' : 'Moje porudžbine'}
          </a>
        </div>
      </div>
    </div>
  );
}